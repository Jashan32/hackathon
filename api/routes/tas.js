import express from 'express';
import { User, Course } from '../db/schema.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get all TAs for an educator
router.get('/educator', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'educator' && req.user.role !== 'industry_expert') {
            return res.status(403).json({ error: 'Only educators and industry experts can view TAs' });
        }

        // Find all courses by this educator
        const courses = await Course.find({ educator: req.user.userId });
        const courseIds = courses.map(course => course._id);

        // Get all TAs assigned to these courses
        const tasData = [];
        
        for (const course of courses) {
            for (const taAssignment of course.tas) {
                const ta = await User.findById(taAssignment.ta);
                if (ta) {
                    // Get mentorship sessions count for this TA
                    const sessionsCompleted = 15; // Mock for now - you can implement real counting later
                    
                    tasData.push({
                        id: ta._id,
                        name: `${ta.firstName} ${ta.lastName}`,
                        email: ta.email,
                        avatar: ta.profilePicture,
                        courseId: course._id,
                        courseName: course.title,
                        assignedStudents: taAssignment.assignedStudents.length,
                        sessionsCompleted,
                        rating: 4.5, // Mock rating - implement real rating system later
                        joinedDate: ta.createdAt,
                        status: ta.isActive ? 'active' : 'inactive',
                        specialties: ['JavaScript', 'React'], // Mock - can be added to user schema later
                        bio: ta.bio || ''
                    });
                }
            }
        }

        res.json({ tas: tasData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Assign a TA to a course
router.post('/assign', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'educator' && req.user.role !== 'industry_expert') {
            return res.status(403).json({ error: 'Only educators and industry experts can assign TAs' });
        }

        const { taEmail, courseId, assignedStudents = [] } = req.body;

        // Validate required fields
        if (!taEmail || !courseId) {
            return res.status(400).json({ error: 'TA email and course ID are required' });
        }

        // Find the course and verify educator ownership
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (course.educator.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'You can only assign TAs to your own courses' });
        }

        // Find or create the TA user
        let ta = await User.findOne({ email: taEmail.toLowerCase() });
        
        if (!ta) {
            // Create new TA user if they don't exist
            const [firstName, ...lastNameParts] = req.body.name?.split(' ') || ['TA', 'User'];
            const lastName = lastNameParts.join(' ') || 'User';
            
            ta = new User({
                firstName,
                lastName,
                email: taEmail.toLowerCase(),
                password: 'temporaryPassword123', // In real app, send email to set password
                role: 'ta',
                bio: `Teaching Assistant for ${course.title}`
            });
            await ta.save();
        } else {
            // Update existing user role to TA if they're a student
            if (ta.role === 'student') {
                ta.role = 'ta';
                await ta.save();
            } else if (ta.role === 'educator') {
                return res.status(400).json({ error: 'Cannot assign an educator as a TA' });
            }
        }

        // Check if TA is already assigned to this course
        const existingTA = course.tas.find(t => t.ta.toString() === ta._id.toString());
        
        if (existingTA) {
            // Update assigned students
            existingTA.assignedStudents = assignedStudents;
        } else {
            // Add new TA assignment
            course.tas.push({
                ta: ta._id,
                assignedStudents: assignedStudents
            });
        }

        await course.save();
        await course.populate('tas.ta', 'firstName lastName email profilePicture');

        res.json({ 
            message: 'TA assigned successfully', 
            ta: {
                id: ta._id,
                name: `${ta.firstName} ${ta.lastName}`,
                email: ta.email,
                courseId: course._id,
                courseName: course.title,
                assignedStudents: assignedStudents.length
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove TA from course
router.delete('/:taId/course/:courseId', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'educator' && req.user.role !== 'industry_expert') {
            return res.status(403).json({ error: 'Only educators and industry experts can remove TAs' });
        }

        const { taId, courseId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (course.educator.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'You can only remove TAs from your own courses' });
        }

        // Remove TA from course
        course.tas = course.tas.filter(ta => ta.ta.toString() !== taId);
        await course.save();

        res.json({ message: 'TA removed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update TA assignment (change assigned students)
router.put('/:taId/course/:courseId', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'educator' && req.user.role !== 'industry_expert') {
            return res.status(403).json({ error: 'Only educators and industry experts can update TA assignments' });
        }

        const { taId, courseId } = req.params;
        const { assignedStudents } = req.body;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (course.educator.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'You can only update TAs in your own courses' });
        }

        // Find and update TA assignment
        const taAssignment = course.tas.find(ta => ta.ta.toString() === taId);
        if (!taAssignment) {
            return res.status(404).json({ error: 'TA not found in this course' });
        }

        taAssignment.assignedStudents = assignedStudents || [];
        await course.save();

        res.json({ message: 'TA assignment updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get available students for a specific course (for TA assignment)
router.get('/course/:courseId/available-students', authenticateToken, async (req, res) => {
    try {
        const { courseId } = req.params;
        
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Get enrolled students for this course
        const enrolledStudents = await User.find({
            _id: { $in: course.enrolledStudents },
            role: 'student'
        }).select('name email');

        // Mock progress data for each student
        const studentsWithProgress = enrolledStudents.map(student => ({
            id: student._id,
            name: student.name,
            email: student.email,
            progress: Math.floor(Math.random() * 100) // Mock progress
        }));

        res.json({ students: studentsWithProgress });
    } catch (error) {
        console.error('Error fetching available students:', error);
        res.status(500).json({ error: 'Failed to fetch available students' });
    }
});

// Get available students for TA assignment
router.get('/students/:courseId', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'educator' && req.user.role !== 'industry_expert') {
            return res.status(403).json({ error: 'Only educators and industry experts can view students' });
        }

        const { courseId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (course.educator.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'You can only view students from your own courses' });
        }

        // Get enrolled students
        const studentIds = course.enrolledStudents.map(enrollment => enrollment.student);
        const students = await User.find({ 
            _id: { $in: studentIds },
            role: 'student'
        }).select('firstName lastName email');

        const studentsData = students.map(student => ({
            id: student._id,
            name: `${student.firstName} ${student.lastName}`,
            email: student.email,
            progress: Math.floor(Math.random() * 100) // Mock progress - implement real progress later
        }));

        res.json({ students: studentsData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get TA details
router.get('/:taId', authenticateToken, async (req, res) => {
    try {
        const { taId } = req.params;

        const ta = await User.findById(taId);
        if (!ta || ta.role !== 'ta') {
            return res.status(404).json({ error: 'TA not found' });
        }

        // Find courses where this TA is assigned
        const courses = await Course.find({ 'tas.ta': taId })
            .populate('educator', 'firstName lastName');

        const taData = {
            id: ta._id,
            name: `${ta.firstName} ${ta.lastName}`,
            email: ta.email,
            avatar: ta.profilePicture,
            bio: ta.bio,
            joinedDate: ta.createdAt,
            status: ta.isActive ? 'active' : 'inactive',
            courses: courses.map(course => ({
                id: course._id,
                title: course.title,
                educator: `${course.educator.firstName} ${course.educator.lastName}`,
                assignedStudents: course.tas.find(t => t.ta.toString() === taId)?.assignedStudents.length || 0
            }))
        };

        res.json({ ta: taData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
