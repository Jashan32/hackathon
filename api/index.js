import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from 'cors';

// Import routes
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import lectureRoutes from './routes/lectures.js';
import documentRoutes from './routes/documents.js';
import mentorshipRoutes from './routes/mentorship.js';
import progressRoutes from './routes/progress.js';
import assignmentRoutes from './routes/assignments.js';
import taRoutes from './routes/tas.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/tas', taRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Course Platform API is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
    });
});

// 404 handler - must be last middleware
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

async function main() {
    try {
        console.log(MONGO_URI)
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');
        
        app.listen(PORT, () => {
            console.log(`🚀 Course Platform API is running on port ${PORT}`);
            console.log(`📚 Health check: http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

main()