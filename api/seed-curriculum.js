import mongoose from 'mongoose';
import { Course, User } from './db/schema.js';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hackathon');

async function seedCurriculum() {
    try {
        // Find an existing educator
        const educator = await User.findOne({ role: 'educator' });
        if (!educator) {
            console.log('No educator found. Please create an educator first.');
            return;
        }

        // Create a sample course with curriculum
        const sampleCourse = new Course({
            title: "Advanced React Development",
            description: "Master advanced React concepts including hooks, context, performance optimization, and testing. Build real-world applications with modern React patterns and best practices.",
            educator: educator._id,
            thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop",
            category: "Programming",
            difficulty: "advanced",
            price: 99.99,
            isPublished: true,
            curriculum: [
                {
                    title: "Getting Started with Advanced React",
                    description: "Learn the fundamentals and set up your development environment",
                    order: 1,
                    lectures: [
                        {
                            title: "Course Introduction and Setup",
                            description: "Welcome to the course! Let's get your environment ready.",
                            duration: "12:30",
                            type: "video",
                            videoUrl: "https://example.com/video1",
                            order: 1,
                            isPreview: true,
                            isPublished: true
                        },
                        {
                            title: "Modern React Development Environment",
                            description: "Setting up the best tools for React development",
                            duration: "18:45",
                            type: "video",
                            videoUrl: "https://example.com/video2",
                            order: 2,
                            isPreview: false,
                            isPublished: true
                        },
                        {
                            title: "Project Structure and Best Practices",
                            description: "How to organize your React projects effectively",
                            duration: "15:20",
                            type: "video",
                            videoUrl: "https://example.com/video3",
                            order: 3,
                            isPreview: false,
                            isPublished: true
                        }
                    ]
                },
                {
                    title: "Advanced Hooks and State Management",
                    description: "Deep dive into React hooks and state management patterns",
                    order: 2,
                    lectures: [
                        {
                            title: "Custom Hooks Deep Dive",
                            description: "Creating reusable custom hooks for your applications",
                            duration: "25:15",
                            type: "video",
                            videoUrl: "https://example.com/video4",
                            order: 1,
                            isPreview: false,
                            isPublished: true
                        },
                        {
                            title: "useReducer vs useState",
                            description: "When and how to use different state management hooks",
                            duration: "20:30",
                            type: "video",
                            videoUrl: "https://example.com/video5",
                            order: 2,
                            isPreview: false,
                            isPublished: true
                        },
                        {
                            title: "Context API and Performance",
                            description: "Using Context API effectively without performance issues",
                            duration: "22:45",
                            type: "video",
                            videoUrl: "https://example.com/video6",
                            order: 3,
                            isPreview: false,
                            isPublished: true
                        }
                    ]
                },
                {
                    title: "Performance Optimization",
                    description: "Advanced techniques for optimizing React applications",
                    order: 3,
                    lectures: [
                        {
                            title: "React.memo and useMemo",
                            description: "Preventing unnecessary re-renders with memoization",
                            duration: "19:10",
                            type: "video",
                            videoUrl: "https://example.com/video7",
                            order: 1,
                            isPreview: false,
                            isPublished: true
                        },
                        {
                            title: "Code Splitting and Lazy Loading",
                            description: "Optimizing bundle size with dynamic imports",
                            duration: "24:35",
                            type: "video",
                            videoUrl: "https://example.com/video8",
                            order: 2,
                            isPreview: false,
                            isPublished: true
                        }
                    ]
                }
            ]
        });

        await sampleCourse.save();
        console.log('Sample course with curriculum created successfully!');
        console.log('Course ID:', sampleCourse._id);

        // Find a student and enroll them in the course
        const student = await User.findOne({ role: 'student' });
        if (student) {
            sampleCourse.enrolledStudents.push({ student: student._id });
            await sampleCourse.save();
            console.log('Student enrolled in the course!');
            console.log('Student ID:', student._id);
        }

    } catch (error) {
        console.error('Error seeding curriculum:', error);
    } finally {
        mongoose.connection.close();
    }
}

seedCurriculum();
