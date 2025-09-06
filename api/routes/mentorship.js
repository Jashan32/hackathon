import express from 'express';
import jwt from 'jsonwebtoken';
import { MentorshipSession, Course, User } from '../db/schema.js';

const router = express.Router();

// Middleware to verify token
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
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

// Create mentorship session (TA or Student can create)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { 
            taId, 
            studentId, 
            courseId, 
            title, 
            description, 
            sessionType, 
            scheduledAt, 
            duration, 
            meetingLink 
        } = req.body;

        // Verify course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Verify TA and student exist and have correct roles
        const ta = await User.findById(taId);
        const student = await User.findById(studentId);

        if (!ta || ta.role !== 'ta') {
            return res.status(400).json({ error: 'Invalid TA' });
        }
        
        if (!student || student.role !== 'student') {
            return res.status(400).json({ error: 'Invalid student' });
        }

        // Check if the requester is either the TA or the student
        if (req.user.userId !== taId && req.user.userId !== studentId) {
            return res.status(403).json({ error: 'You can only create sessions for yourself' });
        }

        const session = new MentorshipSession({
            ta: taId,
            student: studentId,
            course: courseId,
            title,
            description,
            sessionType,
            scheduledAt,
            duration,
            meetingLink
        });

        await session.save();
        await session.populate([
            { path: 'ta', select: 'firstName lastName email' },
            { path: 'student', select: 'firstName lastName email' },
            { path: 'course', select: 'title' }
        ]);

        res.status(201).json({ message: 'Mentorship session created successfully', session });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all sessions for a user (TA or Student)
router.get('/my-sessions', authenticateToken, async (req, res) => {
    try {
        const { status, upcoming } = req.query;
        
        let filter = {};
        
        if (req.user.role === 'ta') {
            filter.ta = req.user.userId;
        } else if (req.user.role === 'student') {
            filter.student = req.user.userId;
        } else {
            return res.status(403).json({ error: 'Only TAs and students can view sessions' });
        }

        if (status) {
            filter.status = status;
        }

        if (upcoming === 'true') {
            filter.scheduledAt = { $gte: new Date() };
        }

        const sessions = await MentorshipSession.find(filter)
            .populate('ta', 'firstName lastName email profilePicture')
            .populate('student', 'firstName lastName email profilePicture')
            .populate('course', 'title')
            .sort({ scheduledAt: 1 });

        res.json({ sessions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get sessions for a course
router.get('/course/:courseId', authenticateToken, async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Check if user has access to this course
        const isEducator = course.educator.toString() === req.user.userId;
        const isTA = course.tas.some(ta => ta.ta.toString() === req.user.userId);
        const isStudent = course.enrolledStudents.some(
            enrollment => enrollment.student.toString() === req.user.userId
        );

        if (!isEducator && !isTA && !isStudent) {
            return res.status(403).json({ error: 'Not authorized to view sessions for this course' });
        }

        const sessions = await MentorshipSession.find({ course: req.params.courseId })
            .populate('ta', 'firstName lastName email')
            .populate('student', 'firstName lastName email')
            .populate('course', 'title')
            .sort({ scheduledAt: -1 });

        res.json({ sessions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single session
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const session = await MentorshipSession.findById(req.params.id)
            .populate('ta', 'firstName lastName email profilePicture')
            .populate('student', 'firstName lastName email profilePicture')
            .populate('course', 'title');

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Check if user has access to this session
        if (session.ta._id.toString() !== req.user.userId && 
            session.student._id.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized to view this session' });
        }

        res.json({ session });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update session
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const session = await MentorshipSession.findById(req.params.id);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Check if user can update this session
        if (session.ta.toString() !== req.user.userId && 
            session.student.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized to update this session' });
        }

        const updatedSession = await MentorshipSession.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        ).populate([
            { path: 'ta', select: 'firstName lastName email' },
            { path: 'student', select: 'firstName lastName email' },
            { path: 'course', select: 'title' }
        ]);

        res.json({ message: 'Session updated successfully', session: updatedSession });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cancel session
router.patch('/:id/cancel', authenticateToken, async (req, res) => {
    try {
        const session = await MentorshipSession.findById(req.params.id);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Check if user can cancel this session
        if (session.ta.toString() !== req.user.userId && 
            session.student.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized to cancel this session' });
        }

        session.status = 'cancelled';
        session.updatedAt = Date.now();
        await session.save();

        res.json({ message: 'Session cancelled successfully', session });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark session as completed
router.patch('/:id/complete', authenticateToken, async (req, res) => {
    try {
        const { notes } = req.body;
        
        const session = await MentorshipSession.findById(req.params.id);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Only TA can mark session as completed
        if (session.ta.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Only TA can mark session as completed' });
        }

        session.status = 'completed';
        if (notes) session.notes = notes;
        session.updatedAt = Date.now();
        await session.save();

        res.json({ message: 'Session marked as completed', session });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rate session
router.patch('/:id/rate', authenticateToken, async (req, res) => {
    try {
        const { rating, feedback } = req.body;
        
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const session = await MentorshipSession.findById(req.params.id);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Check if session is completed
        if (session.status !== 'completed') {
            return res.status(400).json({ error: 'Can only rate completed sessions' });
        }

        // Check if user participated in this session
        if (session.ta.toString() !== req.user.userId && 
            session.student.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized to rate this session' });
        }

        session.rating = {
            rating,
            feedback,
            ratedBy: req.user.userId
        };
        session.updatedAt = Date.now();
        await session.save();

        res.json({ message: 'Session rated successfully', session });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get available time slots for TA
router.get('/ta/:taId/availability', async (req, res) => {
    try {
        const { date } = req.query; // Format: YYYY-MM-DD
        
        if (!date) {
            return res.status(400).json({ error: 'Date parameter is required' });
        }

        const startOfDay = new Date(`${date}T00:00:00.000Z`);
        const endOfDay = new Date(`${date}T23:59:59.999Z`);

        const bookedSessions = await MentorshipSession.find({
            ta: req.params.taId,
            scheduledAt: {
                $gte: startOfDay,
                $lte: endOfDay
            },
            status: { $in: ['scheduled', 'ongoing'] }
        });

        res.json({ bookedSessions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
