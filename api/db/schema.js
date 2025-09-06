import mongoose from "mongoose";
const Schema = mongoose.Schema;

// User Schema (for educators, students, TAs)
const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['educator', 'student', 'ta'],
        required: true
    },
    profilePicture: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        maxlength: 500
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Course Schema
const courseSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    educator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    thumbnail: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    price: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    curriculum: [{
        _id: {
            type: Schema.Types.ObjectId,
            default: () => new mongoose.Types.ObjectId()
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            default: ''
        },
        order: {
            type: Number,
            required: true
        },
        lectures: [{
            _id: {
                type: Schema.Types.ObjectId,
                default: () => new mongoose.Types.ObjectId()
            },
            title: {
                type: String,
                required: true,
                trim: true
            },
            description: {
                type: String,
                default: ''
            },
            duration: {
                type: String, // e.g., "12:30"
                required: true
            },
            type: {
                type: String,
                enum: ['video', 'document', 'quiz', 'assignment'],
                default: 'video'
            },
            videoUrl: {
                type: String,
                default: ''
            },
            documentUrl: {
                type: String,
                default: ''
            },
            order: {
                type: Number,
                required: true
            },
            isPreview: {
                type: Boolean,
                default: false
            },
            isPublished: {
                type: Boolean,
                default: false
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            updatedAt: {
                type: Date,
                default: Date.now
            }
        }],
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }],
    enrolledStudents: [{
        student: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        enrolledAt: {
            type: Date,
            default: Date.now
        },
        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        }
    }],
    tas: [{
        ta: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        assignedAt: {
            type: Date,
            default: Date.now
        },
        assignedStudents: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }]
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Lecture Schema
const lectureSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    videoUrl: {
        type: String,
        required: true
    },
    duration: {
        type: Number, // in seconds
        required: true
    },
    order: {
        type: Number,
        required: true
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    transcript: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Document Schema
const documentSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        enum: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt'],
        required: true
    },
    fileSize: {
        type: Number, // in bytes
        required: true
    },
    order: {
        type: Number,
        required: true
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Mentorship Session Schema
const mentorshipSessionSchema = new Schema({
    ta: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    student: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String
    },
    sessionType: {
        type: String,
        enum: ['doubt-clearing', '1-on-1', 'progress-review', 'other'],
        default: 'doubt-clearing'
    },
    scheduledAt: {
        type: Date,
        required: true
    },
    duration: {
        type: Number, // in minutes
        default: 60
    },
    status: {
        type: String,
        enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    meetingLink: {
        type: String
    },
    notes: {
        type: String
    },
    rating: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        feedback: {
            type: String
        },
        ratedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Student Progress Schema
const studentProgressSchema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    lecturesProgress: [{
        sectionId: {
            type: Schema.Types.ObjectId,
            required: true
        },
        lectureId: {
            type: Schema.Types.ObjectId,
            required: true
        },
        isCompleted: {
            type: Boolean,
            default: false
        },
        isLocked: {
            type: Boolean,
            default: true
        },
        watchTime: {
            type: Number, // in seconds
            default: 0
        },
        lastWatchedAt: {
            type: Date,
            default: Date.now
        },
        completedAt: {
            type: Date
        }
    }],
    documentsViewed: [{
        document: {
            type: Schema.Types.ObjectId,
            ref: 'Document'
        },
        viewedAt: {
            type: Date,
            default: Date.now
        }
    }],
    overallProgress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    currentLecture: {
        sectionId: {
            type: Schema.Types.ObjectId
        },
        lectureId: {
            type: Schema.Types.ObjectId
        }
    },
    lastAccessed: {
        type: Date,
        default: Date.now
    },
    totalTimeSpent: {
        type: Number, // in minutes
        default: 0
    },
    streak: {
        type: Number,
        default: 0
    },
    achievements: [{
        name: {
            type: String,
            required: true
        },
        earnedAt: {
            type: Date,
            default: Date.now
        },
        description: {
            type: String
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Assignment Schema
const assignmentSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    maxMarks: {
        type: Number,
        required: true,
        min: 0
    },
    instructions: {
        type: String
    },
    attachments: [{
        fileName: String,
        fileUrl: String,
        fileType: String
    }],
    submissions: [{
        student: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        submittedAt: {
            type: Date,
            default: Date.now
        },
        files: [{
            fileName: String,
            fileUrl: String,
            fileType: String
        }],
        marks: {
            type: Number,
            min: 0
        },
        feedback: {
            type: String
        },
        gradedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        gradedAt: {
            type: Date
        }
    }],
    isPublished: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Create Models
const User = mongoose.model('User', userSchema);
const Course = mongoose.model('Course', courseSchema);
const Lecture = mongoose.model('Lecture', lectureSchema);
const Document = mongoose.model('Document', documentSchema);
const MentorshipSession = mongoose.model('MentorshipSession', mentorshipSessionSchema);
const StudentProgress = mongoose.model('StudentProgress', studentProgressSchema);
const Assignment = mongoose.model('Assignment', assignmentSchema);

export {
    User,
    Course,
    Lecture,
    Document,
    MentorshipSession,
    StudentProgress,
    Assignment
};
