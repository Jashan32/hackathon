import express from 'express';
import jwt from 'jsonwebtoken';
import { StudentProgress, Course, Lecture, Document } from '../db/schema.js';

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

// Get student progress for a course
router.get('/course/:courseId', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can view progress' });
        }

        const progress = await StudentProgress.findOne({
            student: req.user.userId,
            course: req.params.courseId
        })
        .populate('lecturesWatched.lecture', 'title duration')
        .populate('documentsViewed.document', 'title')
        .populate('course', 'title');

        if (!progress) {
            return res.status(404).json({ error: 'Progress not found' });
        }

        res.json({ progress });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update lecture watch progress
router.post('/lecture/:lectureId/watch', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can update progress' });
        }

        const { watchTime, isCompleted } = req.body;

        const lecture = await Lecture.findById(req.params.lectureId);
        if (!lecture) {
            return res.status(404).json({ error: 'Lecture not found' });
        }

        let progress = await StudentProgress.findOne({
            student: req.user.userId,
            course: lecture.course
        });

        if (!progress) {
            // Create new progress record
            progress = new StudentProgress({
                student: req.user.userId,
                course: lecture.course
            });
        }

        // Check if lecture already watched
        const existingWatch = progress.lecturesWatched.find(
            watch => watch.lecture.toString() === req.params.lectureId
        );

        if (existingWatch) {
            // Update existing watch record
            existingWatch.watchTime = Math.max(existingWatch.watchTime, watchTime);
            existingWatch.isCompleted = isCompleted || existingWatch.isCompleted;
            existingWatch.watchedAt = Date.now();
        } else {
            // Add new watch record
            progress.lecturesWatched.push({
                lecture: req.params.lectureId,
                watchTime,
                isCompleted
            });
        }

        // Update overall progress
        await updateOverallProgress(progress);
        
        progress.lastAccessed = Date.now();
        progress.updatedAt = Date.now();
        await progress.save();

        res.json({ message: 'Progress updated successfully', progress });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark document as viewed
router.post('/document/:documentId/view', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can update progress' });
        }

        const document = await Document.findById(req.params.documentId);
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        let progress = await StudentProgress.findOne({
            student: req.user.userId,
            course: document.course
        });

        if (!progress) {
            // Create new progress record
            progress = new StudentProgress({
                student: req.user.userId,
                course: document.course
            });
        }

        // Check if document already viewed
        const existingView = progress.documentsViewed.find(
            view => view.document.toString() === req.params.documentId
        );

        if (!existingView) {
            // Add new view record
            progress.documentsViewed.push({
                document: req.params.documentId
            });
        }

        // Update overall progress
        await updateOverallProgress(progress);
        
        progress.lastAccessed = Date.now();
        progress.updatedAt = Date.now();
        await progress.save();

        res.json({ message: 'Document marked as viewed', progress });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get progress for all enrolled courses
router.get('/my-progress', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can view progress' });
        }

        const progressRecords = await StudentProgress.find({
            student: req.user.userId
        })
        .populate('course', 'title thumbnail educator')
        .populate('course.educator', 'firstName lastName')
        .sort({ lastAccessed: -1 });

        res.json({ progressRecords });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get course analytics for educator
router.get('/course/:courseId/analytics', authenticateToken, async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (course.educator.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Only course educator can view analytics' });
        }

        const progressRecords = await StudentProgress.find({ 
            course: req.params.courseId 
        })
        .populate('student', 'firstName lastName email')
        .populate('lecturesWatched.lecture', 'title')
        .populate('documentsViewed.document', 'title');

        // Calculate analytics
        const totalStudents = progressRecords.length;
        const averageProgress = totalStudents > 0 
            ? progressRecords.reduce((sum, record) => sum + record.overallProgress, 0) / totalStudents 
            : 0;

        const completedStudents = progressRecords.filter(record => record.overallProgress === 100).length;
        const activeStudents = progressRecords.filter(record => {
            const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return record.lastAccessed >= oneWeekAgo;
        }).length;

        res.json({
            analytics: {
                totalStudents,
                averageProgress: Math.round(averageProgress * 100) / 100,
                completedStudents,
                activeStudents,
                completionRate: totalStudents > 0 ? (completedStudents / totalStudents) * 100 : 0
            },
            progressRecords
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper function to calculate overall progress
async function updateOverallProgress(progress) {
    try {
        // Get total lectures and documents for the course
        const [totalLectures, totalDocuments] = await Promise.all([
            Lecture.countDocuments({ course: progress.course, isPublished: true }),
            Document.countDocuments({ course: progress.course, isPublished: true })
        ]);

        const totalContent = totalLectures + totalDocuments;
        
        if (totalContent === 0) {
            progress.overallProgress = 0;
            return;
        }

        // Count completed items
        const completedLectures = progress.lecturesWatched.filter(watch => watch.isCompleted).length;
        const viewedDocuments = progress.documentsViewed.length;
        
        const completedContent = completedLectures + viewedDocuments;
        progress.overallProgress = Math.round((completedContent / totalContent) * 100);
        
    } catch (error) {
        console.error('Error updating overall progress:', error);
    }
}

export default router;
