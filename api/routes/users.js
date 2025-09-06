import express from 'express';
import { User } from '../db/schema.js';
import { authenticateToken } from './auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/profiles';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            user: user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            dateOfBirth,
            location,
            bio,
            socialLinks
        } = req.body;

        // Check if email is already taken by another user
        if (email) {
            const existingUser = await User.findOne({ 
                email: email, 
                _id: { $ne: req.user.id } 
            });
            if (existingUser) {
                return res.status(400).json({ error: 'Email is already in use' });
            }
        }

        // Prepare update object
        const updateData = {
            updatedAt: new Date()
        };

        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (email) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
        if (location !== undefined) updateData.location = location;
        if (bio !== undefined) updateData.bio = bio;
        if (socialLinks) {
            updateData.socialLinks = {
                website: socialLinks.website || '',
                linkedin: socialLinks.linkedin || '',
                twitter: socialLinks.twitter || ''
            };
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Update profile error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Upload profile picture
router.post('/profile/picture', authenticateToken, upload.single('profilePicture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Get current user to delete old profile picture
        const currentUser = await User.findById(req.user.id);
        if (currentUser.profilePicture) {
            // Delete old profile picture file
            const oldFilePath = path.join(process.cwd(), currentUser.profilePicture);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }

        // Update user with new profile picture path
        const profilePicturePath = req.file.path.replace(/\\/g, '/'); // Normalize path for cross-platform
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { 
                profilePicture: profilePicturePath,
                updatedAt: new Date()
            },
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Profile picture updated successfully',
            profilePicture: profilePicturePath,
            user: updatedUser
        });
    } catch (error) {
        console.error('Profile picture upload error:', error);
        // Delete uploaded file if there was an error
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Failed to upload profile picture' });
    }
});

// Delete profile picture
router.delete('/profile/picture', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.profilePicture) {
            // Delete profile picture file
            const filePath = path.join(process.cwd(), user.profilePicture);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Update user to remove profile picture
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { 
                profilePicture: '',
                updatedAt: new Date()
            },
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Profile picture deleted successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Delete profile picture error:', error);
        res.status(500).json({ error: 'Failed to delete profile picture' });
    }
});

// Get user profile by ID (public view)
router.get('/:userId/profile', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password -email -phone');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            user: user
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

// Search users
router.get('/search', authenticateToken, async (req, res) => {
    try {
        const { query, role, limit = 10 } = req.query;
        
        let searchCriteria = { isActive: true };
        
        if (query) {
            searchCriteria.$or = [
                { firstName: { $regex: query, $options: 'i' } },
                { lastName: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ];
        }

        if (role) {
            searchCriteria.role = role;
        }

        const users = await User.find(searchCriteria)
            .select('-password')
            .limit(parseInt(limit))
            .sort({ firstName: 1, lastName: 1 });

        res.json({
            success: true,
            users: users
        });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ error: 'Failed to search users' });
    }
});

export default router;
