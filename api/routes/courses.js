import express from 'express';
import jwt from 'jsonwebtoken';
import { Course, User, Lecture, Document, StudentProgress } from '../db/schema.js';

const router = express.Router();

// Middleware to verify token
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
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

export default router;
