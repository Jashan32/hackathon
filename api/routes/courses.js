import express from 'express';
import jwt from 'jsonwebtoken';
import { Course, User, Lecture, Document, StudentProgress } from '../db/schema.js';

const router = express.Router();

// Middleware to verify token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification error:', error.message);
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Create course (educators only)
router.post('/', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'educator') {
            return res.status(403).json({ error: 'Only educators can create courses' });
        }

        const { title, description, category, difficulty, price, thumbnail } = req.body;

        const course = new Course({
            title,
            description,
            category,
            difficulty,
            price,
            thumbnail,
            educator: req.user.userId
        });

        await course.save();
        await course.populate('educator', 'firstName lastName email');

        res.status(201).json({ message: 'Course created successfully', course });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all courses
router.get('/', async (req, res) => {
    try {
        const { category, difficulty, search } = req.query;
        let filter = { isPublished: true };

        if (category) filter.category = category;
        if (difficulty) filter.difficulty = difficulty;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const courses = await Course.find(filter)
            .populate('educator', 'firstName lastName profilePicture')
            .sort({ createdAt: -1 });

        res.json({ courses });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get course by ID
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('educator', 'firstName lastName email profilePicture bio')
            .populate('enrolledStudents.student', 'firstName lastName email')
            .populate('tas.ta', 'firstName lastName email');

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        res.json({ course });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update course (educator only)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (course.educator.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized to update this course' });
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        ).populate('educator', 'firstName lastName email');

        res.json({ message: 'Course updated successfully', course: updatedCourse });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Enroll in course
router.post('/:id/enroll', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can enroll in courses' });
        }

        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Check if already enrolled
        const isEnrolled = course.enrolledStudents.some(
            enrollment => enrollment.student.toString() === req.user.userId
        );

        if (isEnrolled) {
            return res.status(400).json({ error: 'Already enrolled in this course' });
        }

        // Add student to course
        course.enrolledStudents.push({ student: req.user.userId });
        await course.save();

        // Create student progress record
        const progress = new StudentProgress({
            student: req.user.userId,
            course: req.params.id
        });
        await progress.save();

        res.json({ message: 'Successfully enrolled in course' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Assign TA to course
router.post('/:id/assign-ta', authenticateToken, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (course.educator.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Only course educator can assign TAs' });
        }

        const { taId, studentIds } = req.body;

        // Verify TA exists and has correct role
        const ta = await User.findById(taId);
        if (!ta || ta.role !== 'ta') {
            return res.status(400).json({ error: 'Invalid TA' });
        }

        // Check if TA is already assigned
        const existingTA = course.tas.find(t => t.ta.toString() === taId);
        if (existingTA) {
            // Update assigned students
            existingTA.assignedStudents = studentIds;
        } else {
            // Add new TA
            course.tas.push({
                ta: taId,
                assignedStudents: studentIds
            });
        }

        await course.save();
        await course.populate('tas.ta', 'firstName lastName email');

        res.json({ message: 'TA assigned successfully', course });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get courses by educator
router.get('/educator/:educatorId', async (req, res) => {
    try {
        const courses = await Course.find({ educator: req.params.educatorId })
            .populate('educator', 'firstName lastName email')
            .sort({ createdAt: -1 });

        res.json({ courses });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get enrolled courses for student
router.get('/student/enrolled', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can view enrolled courses' });
        }

        const courses = await Course.find({
            'enrolledStudents.student': req.user.userId
        }).populate('educator', 'firstName lastName profilePicture');

        res.json({ courses });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Publish/Unpublish course
router.patch('/:id/publish', authenticateToken, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (course.educator.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        course.isPublished = !course.isPublished;
        course.updatedAt = Date.now();
        await course.save();

        res.json({ 
            message: `Course ${course.isPublished ? 'published' : 'unpublished'} successfully`,
            course 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get course curriculum with progress for enrolled student
router.get('/:id/curriculum', authenticateToken, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('educator', 'firstName lastName profilePicture bio socialLinks totalStudents totalCourses rating');

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Check if user is enrolled or is the educator
        const isEnrolled = course.enrolledStudents.some(
            enrollment => enrollment.student.toString() === req.user.userId
        );
        const isEducator = course.educator._id.toString() === req.user.userId;

        if (!isEnrolled && !isEducator && req.user.role === 'student') {
            return res.status(403).json({ error: 'Not enrolled in this course' });
        }

        let studentProgress = null;
        if (req.user.role === 'student') {
            studentProgress = await StudentProgress.findOne({
                student: req.user.userId,
                course: req.params.id
            });

            // If no progress record exists and student is enrolled, create one
            if (!studentProgress && isEnrolled) {
                studentProgress = new StudentProgress({
                    student: req.user.userId,
                    course: req.params.id,
                    lecturesProgress: []
                });

                // Initialize lecture progress for all lectures
                course.curriculum.forEach((section, sectionIndex) => {
                    section.lectures.forEach((lecture, lectureIndex) => {
                        studentProgress.lecturesProgress.push({
                            sectionId: section._id,
                            lectureId: lecture._id,
                            isCompleted: false,
                            isLocked: sectionIndex === 0 && lectureIndex === 0 ? false : true
                        });
                    });
                });

                await studentProgress.save();
            }
        }

        // Build curriculum with progress data
        const curriculumWithProgress = course.curriculum.map(section => {
            const lecturesWithProgress = section.lectures.map(lecture => {
                let lectureProgress = null;
                if (studentProgress) {
                    lectureProgress = studentProgress.lecturesProgress.find(
                        lp => lp.sectionId.toString() === section._id.toString() && 
                              lp.lectureId.toString() === lecture._id.toString()
                    );
                }

                return {
                    ...lecture.toObject(),
                    completed: lectureProgress ? lectureProgress.isCompleted : false,
                    locked: lectureProgress ? lectureProgress.isLocked : true,
                    watchTime: lectureProgress ? lectureProgress.watchTime : 0
                };
            });

            return {
                ...section.toObject(),
                lectures: lecturesWithProgress
            };
        });

        // Calculate overall progress
        let overallProgress = 0;
        if (studentProgress) {
            const totalLectures = course.curriculum.reduce((total, section) => total + section.lectures.length, 0);
            const completedLectures = studentProgress.lecturesProgress.filter(lp => lp.isCompleted).length;
            overallProgress = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;
        }

        // Get additional course stats
        const totalLectures = course.curriculum.reduce((total, section) => total + section.lectures.length, 0);
        const totalDuration = course.curriculum.reduce((total, section) => {
            return total + section.lectures.reduce((sectionTotal, lecture) => {
                const [minutes, seconds] = lecture.duration.split(':').map(Number);
                return sectionTotal + (minutes * 60) + seconds;
            }, 0);
        }, 0);

        const hours = Math.floor(totalDuration / 3600);
        const minutes = Math.floor((totalDuration % 3600) / 60);
        const formattedDuration = `${hours}h ${minutes}m`;

        res.json({
            course: {
                _id: course._id,
                title: course.title,
                description: course.description,
                thumbnail: course.thumbnail,
                category: course.category,
                difficulty: course.difficulty,
                price: course.price,
                rating: 4.8, // Mock rating for now
                totalStudents: course.enrolledStudents.length,
                totalLectures,
                totalDuration: formattedDuration,
                language: 'English', // Mock data
                lastUpdated: course.updatedAt,
                educator: course.educator,
                curriculum: curriculumWithProgress
            },
            progress: {
                overallProgress,
                currentLecture: studentProgress?.currentLecture || null,
                totalTimeSpent: studentProgress?.totalTimeSpent || 0,
                lastAccessed: studentProgress?.lastAccessed || new Date(),
                streak: studentProgress?.streak || 0,
                achievements: studentProgress?.achievements || []
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update lecture progress
router.post('/:courseId/lectures/:lectureId/progress', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can update progress' });
        }

        const { watchTime, isCompleted } = req.body;
        const { courseId, lectureId } = req.params;

        let studentProgress = await StudentProgress.findOne({
            student: req.user.userId,
            course: courseId
        });

        if (!studentProgress) {
            return res.status(404).json({ error: 'Student progress not found' });
        }

        // Find and update lecture progress
        const lectureProgressIndex = studentProgress.lecturesProgress.findIndex(
            lp => lp.lectureId.toString() === lectureId
        );

        if (lectureProgressIndex === -1) {
            return res.status(404).json({ error: 'Lecture progress not found' });
        }

        studentProgress.lecturesProgress[lectureProgressIndex].watchTime = watchTime || 0;
        studentProgress.lecturesProgress[lectureProgressIndex].lastWatchedAt = new Date();

        if (isCompleted) {
            studentProgress.lecturesProgress[lectureProgressIndex].isCompleted = true;
            studentProgress.lecturesProgress[lectureProgressIndex].completedAt = new Date();

            // Unlock next lecture
            const course = await Course.findById(courseId);
            const allLectures = [];
            course.curriculum.forEach(section => {
                section.lectures.forEach(lecture => {
                    allLectures.push({ sectionId: section._id, lectureId: lecture._id });
                });
            });

            const currentIndex = allLectures.findIndex(l => l.lectureId.toString() === lectureId);
            if (currentIndex !== -1 && currentIndex < allLectures.length - 1) {
                const nextLecture = allLectures[currentIndex + 1];
                const nextLectureProgressIndex = studentProgress.lecturesProgress.findIndex(
                    lp => lp.lectureId.toString() === nextLecture.lectureId.toString()
                );
                if (nextLectureProgressIndex !== -1) {
                    studentProgress.lecturesProgress[nextLectureProgressIndex].isLocked = false;
                }
            }
        }

        // Update overall progress
        const totalLectures = studentProgress.lecturesProgress.length;
        const completedLectures = studentProgress.lecturesProgress.filter(lp => lp.isCompleted).length;
        studentProgress.overallProgress = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;
        studentProgress.lastAccessed = new Date();

        await studentProgress.save();

        res.json({ message: 'Progress updated successfully', progress: studentProgress.overallProgress });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add curriculum section to course
router.post('/:id/curriculum/sections', authenticateToken, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (course.educator.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { title, description, order } = req.body;
        const newSection = {
            title,
            description,
            order: order || course.curriculum.length + 1,
            lectures: []
        };

        course.curriculum.push(newSection);
        course.updatedAt = Date.now();
        await course.save();

        res.json({ message: 'Section added successfully', section: newSection });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add lecture to curriculum section
router.post('/:courseId/curriculum/sections/:sectionId/lectures', authenticateToken, async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (course.educator.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const section = course.curriculum.id(req.params.sectionId);
        if (!section) {
            return res.status(404).json({ error: 'Section not found' });
        }

        const { title, description, duration, type, videoUrl, documentUrl, isPreview } = req.body;
        const newLecture = {
            title,
            description,
            duration,
            type: type || 'video',
            videoUrl,
            documentUrl,
            order: section.lectures.length + 1,
            isPreview: isPreview || false,
            isPublished: false
        };

        section.lectures.push(newLecture);
        course.updatedAt = Date.now();
        await course.save();

        res.json({ message: 'Lecture added successfully', lecture: newLecture });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
