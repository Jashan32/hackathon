import express from 'express';
import jwt from 'jsonwebtoken';
import { Document, Course } from '../db/schema.js';

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

// Create document
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, description, courseId, fileUrl, fileType, fileSize, order } = req.body;

        // Verify course exists and user is the educator
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (course.educator.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Only course educator can add documents' });
        }

        const document = new Document({
            title,
            description,
            course: courseId,
            fileUrl,
            fileType,
            fileSize,
            order
        });

        await document.save();
        await document.populate('course', 'title');

        res.status(201).json({ message: 'Document created successfully', document });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get documents for a course
router.get('/course/:courseId', async (req, res) => {
    try {
        const documents = await Document.find({ 
            course: req.params.courseId,
            isPublished: true 
        })
        .populate('course', 'title')
        .sort({ order: 1 });

        res.json({ documents });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all documents for a course (including unpublished - for educators)
router.get('/course/:courseId/all', authenticateToken, async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Only course educator can see all documents
        if (course.educator.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const documents = await Document.find({ course: req.params.courseId })
            .populate('course', 'title')
            .sort({ order: 1 });

        res.json({ documents });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single document
router.get('/:id', async (req, res) => {
    try {
        const document = await Document.findById(req.params.id)
            .populate('course', 'title educator');

        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        res.json({ document });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update document
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const document = await Document.findById(req.params.id).populate('course');
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Check if user is the course educator
        if (document.course.educator.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized to update this document' });
        }

        const updatedDocument = await Document.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        ).populate('course', 'title');

        res.json({ message: 'Document updated successfully', document: updatedDocument });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete document
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const document = await Document.findById(req.params.id).populate('course');
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Check if user is the course educator
        if (document.course.educator.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized to delete this document' });
        }

        await Document.findByIdAndDelete(req.params.id);
        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Publish/Unpublish document
router.patch('/:id/publish', authenticateToken, async (req, res) => {
    try {
        const document = await Document.findById(req.params.id).populate('course');
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Check if user is the course educator
        if (document.course.educator.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        document.isPublished = !document.isPublished;
        document.updatedAt = Date.now();
        await document.save();

        res.json({ 
            message: `Document ${document.isPublished ? 'published' : 'unpublished'} successfully`,
            document 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reorder documents
router.patch('/course/:courseId/reorder', authenticateToken, async (req, res) => {
    try {
        const { documentIds } = req.body; // Array of document IDs in new order

        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (course.educator.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Update order for each document
        for (let i = 0; i < documentIds.length; i++) {
            await Document.findByIdAndUpdate(documentIds[i], { order: i + 1 });
        }

        res.json({ message: 'Documents reordered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
