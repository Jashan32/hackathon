import express from 'express';
import jwt from 'jsonwebtoken';
import { Lecture, Course } from '../db/schema.js';

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

// Create lecture
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, description, courseId, videoUrl, duration, order, transcript } = req.body;

        // Verify course exists and user is the educator
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (course.educator.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Only course educator can add lectures' });
        }

        const lecture = new Lecture({
            title,
            description,
            course: courseId,
            videoUrl,
            duration,
            order,
            transcript
        });

        await lecture.save();
        await lecture.populate('course', 'title');

        res.status(201).json({ message: 'Lecture created successfully', lecture });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get lectures for a course
router.get('/course/:courseId', async (req, res) => {
    try {
        const lectures = await Lecture.find({ 
            course: req.params.courseId,
            isPublished: true 
        })
        .populate('course', 'title')
        .sort({ order: 1 });

        res.json({ lectures });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all lectures for a course (including unpublished - for educators)
router.get('/course/:courseId/all', authenticateToken, async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Only course educator can see all lectures
        if (course.educator.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const lectures = await Lecture.find({ course: req.params.courseId })
            .populate('course', 'title')
            .sort({ order: 1 });

        res.json({ lectures });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single lecture
router.get('/:id', async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.id)
            .populate('course', 'title educator');

        if (!lecture) {
            return res.status(404).json({ error: 'Lecture not found' });
        }

        res.json({ lecture });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update lecture
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.id).populate('course');
        if (!lecture) {
            return res.status(404).json({ error: 'Lecture not found' });
        }

        // Check if user is the course educator
        if (lecture.course.educator.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized to update this lecture' });
        }

        const updatedLecture = await Lecture.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        ).populate('course', 'title');

        res.json({ message: 'Lecture updated successfully', lecture: updatedLecture });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete lecture
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.id).populate('course');
        if (!lecture) {
            return res.status(404).json({ error: 'Lecture not found' });
        }

        // Check if user is the course educator
        if (lecture.course.educator.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized to delete this lecture' });
        }

        await Lecture.findByIdAndDelete(req.params.id);
        res.json({ message: 'Lecture deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Publish/Unpublish lecture
router.patch('/:id/publish', authenticateToken, async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.id).populate('course');
        if (!lecture) {
            return res.status(404).json({ error: 'Lecture not found' });
        }

        // Check if user is the course educator
        if (lecture.course.educator.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        lecture.isPublished = !lecture.isPublished;
        lecture.updatedAt = Date.now();
        await lecture.save();

        res.json({ 
            message: `Lecture ${lecture.isPublished ? 'published' : 'unpublished'} successfully`,
            lecture 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reorder lectures
router.patch('/course/:courseId/reorder', authenticateToken, async (req, res) => {
    try {
        const { lectureIds } = req.body; // Array of lecture IDs in new order

        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (course.educator.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Update order for each lecture
        for (let i = 0; i < lectureIds.length; i++) {
            await Lecture.findByIdAndUpdate(lectureIds[i], { order: i + 1 });
        }

        res.json({ message: 'Lectures reordered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
