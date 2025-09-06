import express from 'express';
import jwt from 'jsonwebtoken';
import { Assignment, Course, User } from '../db/schema.js';

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

// Create assignment (educators only)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { 
            title, 
            description, 
            courseId, 
            dueDate, 
            maxMarks, 
            instructions, 
            attachments 
        } = req.body;

        // Verify course exists and user is the educator
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (course.educator.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Only course educator can create assignments' });
        }

        const assignment = new Assignment({
            title,
            description,
            course: courseId,
            dueDate,
            maxMarks,
            instructions,
            attachments
        });

        await assignment.save();
        await assignment.populate('course', 'title');

        res.status(201).json({ message: 'Assignment created successfully', assignment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get assignments for a course
router.get('/course/:courseId', authenticateToken, async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Check if user has access to this course
        const isEducator = course.educator.toString() === req.user.userId;
        const isStudent = course.enrolledStudents.some(
            enrollment => enrollment.student.toString() === req.user.userId
        );
        const isTA = course.tas.some(ta => ta.ta.toString() === req.user.userId);

        if (!isEducator && !isStudent && !isTA) {
            return res.status(403).json({ error: 'Not authorized to view assignments for this course' });
        }

        let filter = { course: req.params.courseId };
        
        // Students can only see published assignments
        if (req.user.role === 'student') {
            filter.isPublished = true;
        }

        const assignments = await Assignment.find(filter)
            .populate('course', 'title')
            .sort({ dueDate: 1 });

        // If student, include their submission status
        if (req.user.role === 'student') {
            const assignmentsWithStatus = assignments.map(assignment => {
                const submission = assignment.submissions.find(
                    sub => sub.student.toString() === req.user.userId
                );
                return {
                    ...assignment.toObject(),
                    hasSubmitted: !!submission,
                    submission: submission || null
                };
            });
            return res.json({ assignments: assignmentsWithStatus });
        }

        res.json({ assignments });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single assignment
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id)
            .populate('course', 'title educator')
            .populate('submissions.student', 'firstName lastName email')
            .populate('submissions.gradedBy', 'firstName lastName');

        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        // Check access permissions
        const course = assignment.course;
        const isEducator = course.educator.toString() === req.user.userId;
        const isStudent = req.user.role === 'student';
        
        if (!isEducator && !isStudent) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Filter submissions based on role
        if (isStudent) {
            // Students can only see their own submission
            assignment.submissions = assignment.submissions.filter(
                sub => sub.student._id.toString() === req.user.userId
            );
        }

        res.json({ assignment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Submit assignment (students only)
router.post('/:id/submit', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can submit assignments' });
        }

        const { files } = req.body; // Array of file objects

        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        // Check if assignment is published
        if (!assignment.isPublished) {
            return res.status(400).json({ error: 'Assignment is not published yet' });
        }

        // Check due date
        if (new Date() > assignment.dueDate) {
            return res.status(400).json({ error: 'Assignment submission deadline has passed' });
        }

        // Check if already submitted
        const existingSubmission = assignment.submissions.find(
            sub => sub.student.toString() === req.user.userId
        );

        if (existingSubmission) {
            // Update existing submission
            existingSubmission.files = files;
            existingSubmission.submittedAt = Date.now();
        } else {
            // Create new submission
            assignment.submissions.push({
                student: req.user.userId,
                files
            });
        }

        assignment.updatedAt = Date.now();
        await assignment.save();

        res.json({ message: 'Assignment submitted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Grade assignment (educators only)
router.post('/:id/grade', authenticateToken, async (req, res) => {
    try {
        const { studentId, marks, feedback } = req.body;

        const assignment = await Assignment.findById(req.params.id).populate('course');
        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        // Check if user is the course educator
        if (assignment.course.educator.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Only course educator can grade assignments' });
        }

        // Find submission
        const submission = assignment.submissions.find(
            sub => sub.student.toString() === studentId
        );

        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        // Validate marks
        if (marks < 0 || marks > assignment.maxMarks) {
            return res.status(400).json({ 
                error: `Marks must be between 0 and ${assignment.maxMarks}` 
            });
        }

        // Update submission with grades
        submission.marks = marks;
        submission.feedback = feedback;
        submission.gradedBy = req.user.userId;
        submission.gradedAt = Date.now();

        assignment.updatedAt = Date.now();
        await assignment.save();

        res.json({ message: 'Assignment graded successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update assignment (educators only)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id).populate('course');
        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        // Check if user is the course educator
        if (assignment.course.educator.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized to update this assignment' });
        }

        const updatedAssignment = await Assignment.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        ).populate('course', 'title');

        res.json({ message: 'Assignment updated successfully', assignment: updatedAssignment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete assignment (educators only)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id).populate('course');
        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        // Check if user is the course educator
        if (assignment.course.educator.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized to delete this assignment' });
        }

        await Assignment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Publish/Unpublish assignment
router.patch('/:id/publish', authenticateToken, async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id).populate('course');
        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        // Check if user is the course educator
        if (assignment.course.educator.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        assignment.isPublished = !assignment.isPublished;
        assignment.updatedAt = Date.now();
        await assignment.save();

        res.json({ 
            message: `Assignment ${assignment.isPublished ? 'published' : 'unpublished'} successfully`,
            assignment 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get assignment submissions (educators only)
router.get('/:id/submissions', authenticateToken, async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id)
            .populate('course')
            .populate('submissions.student', 'firstName lastName email')
            .populate('submissions.gradedBy', 'firstName lastName');

        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        // Check if user is the course educator
        if (assignment.course.educator.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        res.json({ 
            assignment: {
                title: assignment.title,
                maxMarks: assignment.maxMarks,
                dueDate: assignment.dueDate
            },
            submissions: assignment.submissions 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
