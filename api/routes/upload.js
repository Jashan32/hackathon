import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

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

// Configure multer to store files in memory
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Upload image endpoint
router.post('/image', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        // Create a GridFS bucket
        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: 'images'
        });

        // Generate a unique filename
        const filename = `${Date.now()}-${req.file.originalname}`;

        // Create upload stream
        const uploadStream = bucket.openUploadStream(filename, {
            metadata: {
                userId: req.user.userId,
                originalName: req.file.originalname,
                mimetype: req.file.mimetype
            }
        });

        // Handle upload completion
        uploadStream.on('finish', () => {
            res.status(201).json({
                message: 'Image uploaded successfully',
                fileId: uploadStream.id,
                filename: filename,
                url: `/api/upload/image/${uploadStream.id}`
            });
        });

        // Handle upload errors
        uploadStream.on('error', (error) => {
            console.error('Upload error:', error);
            res.status(500).json({ error: 'Failed to upload image' });
        });

        // Write the file buffer to the stream
        uploadStream.end(req.file.buffer);

    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve image endpoint
router.get('/image/:id', async (req, res) => {
    try {
        const fileId = new mongoose.Types.ObjectId(req.params.id);
        
        // Create a GridFS bucket
        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: 'images'
        });

        // Check if file exists
        const files = await bucket.find({ _id: fileId }).toArray();
        if (!files || files.length === 0) {
            return res.status(404).json({ error: 'Image not found' });
        }

        const file = files[0];

        // Set appropriate headers
        res.set('Content-Type', file.metadata.mimetype);
        res.set('Content-Length', file.length);

        // Create download stream and pipe to response
        const downloadStream = bucket.openDownloadStream(fileId);
        
        downloadStream.on('error', (error) => {
            console.error('Download error:', error);
            res.status(500).json({ error: 'Failed to retrieve image' });
        });

        downloadStream.pipe(res);

    } catch (error) {
        console.error('Image retrieval error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete image endpoint
router.delete('/image/:id', authenticateToken, async (req, res) => {
    try {
        const fileId = new mongoose.Types.ObjectId(req.params.id);
        
        // Create a GridFS bucket
        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: 'images'
        });

        // Check if file exists and user owns it
        const files = await bucket.find({ _id: fileId }).toArray();
        if (!files || files.length === 0) {
            return res.status(404).json({ error: 'Image not found' });
        }

        const file = files[0];
        if (file.metadata.userId !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to delete this image' });
        }

        // Delete the file
        await bucket.delete(fileId);
        
        res.json({ message: 'Image deleted successfully' });

    } catch (error) {
        console.error('Image deletion error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
