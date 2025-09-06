import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft,
    Play,
    Clock,
    Users,
    Star,
    BookOpen,
    Download,
    Share2,
    Heart,
    CheckCircle,
    Lock,
    FileText,
    Video,
    Headphones,
    Image,
    Award,
    Calendar,
    Globe,
    User,
    MessageSquare,
    BarChart3,
    Target,
    TrendingUp,
    Plus,
    Bookmark
} from 'lucide-react';

export default function ViewCourse() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [progress, setProgress] = useState(0);
    const [liked, setLiked] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const [enrolling, setEnrolling] = useState(false);

    const tabs = [
        { id: 'overview', name: 'Overview', icon: BookOpen },
        { id: 'curriculum', name: 'Curriculum', icon: Video },
        { id: 'reviews', name: 'Reviews', icon: MessageSquare },
        { id: 'instructor', name: 'Instructor', icon: User }
    ];

    useEffect(() => {
        if (courseId) {
            fetchCourse();
            checkEnrollmentStatus();
        }
    }, [courseId]);

    const fetchCourse = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3000/api/courses/${courseId}`);
            if (response.ok) {
                const data = await response.json();
                setCourse({
                    ...data.course,
                    // Mock additional data for comprehensive view
                    duration: '12 hours',
                    level: data.course.difficulty,
                    language: 'English',
                    lastUpdated: new Date(data.course.updatedAt).toLocaleDateString(),
                    totalLectures: Math.floor(Math.random() * 25) + 10,
                    totalQuizzes: Math.floor(Math.random() * 8) + 3,
                    totalAssignments: Math.floor(Math.random() * 5) + 2,
                    rating: (Math.random() * 2 + 3).toFixed(1),
                    totalRatings: Math.floor(Math.random() * 500) + 100,
                    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'], // Mock skills
                    requirements: [
                        'Basic understanding of programming concepts',
                        'Familiarity with web development',
                        'Computer with internet connection'
                    ],
                    objectives: [
                        'Master the fundamentals of the subject',
                        'Build real-world projects',
                        'Develop industry-ready skills',
                        'Prepare for certification'
                    ],
                    curriculum: [
                        {
                            id: 1,
                            title: 'Introduction & Setup',
                            lectures: [
                                { id: 1, title: 'Course Overview', duration: '5:30', type: 'video', completed: true, free: true },
                                { id: 2, title: 'Setting up Development Environment', duration: '12:45', type: 'video', completed: true, free: false },
                                { id: 3, title: 'Course Resources', duration: '3:20', type: 'document', completed: false, free: true }
                            ]
                        },
                        {
                            id: 2,
                            title: 'Core Concepts',
                            lectures: [
                                { id: 4, title: 'Understanding the Basics', duration: '18:30', type: 'video', completed: false, free: false },
                                { id: 5, title: 'Practical Examples', duration: '25:15', type: 'video', completed: false, free: false },
                                { id: 6, title: 'Quiz: Core Concepts', duration: '10:00', type: 'quiz', completed: false, free: false }
                            ]
                        },
                        {
                            id: 3,
                            title: 'Advanced Topics',
                            lectures: [
                                { id: 7, title: 'Advanced Techniques', duration: '32:45', type: 'video', completed: false, free: false },
                                { id: 8, title: 'Case Studies', duration: '28:20', type: 'video', completed: false, free: false },
                                { id: 9, title: 'Assignment: Build a Project', duration: '60:00', type: 'assignment', completed: false, free: false }
                            ]
                        }
                    ],
                    reviews: [
                        {
                            id: 1,
                            studentName: 'John Doe',
                            rating: 5,
                            comment: 'Excellent course with clear explanations and practical examples.',
                            date: '2 weeks ago'
                        },
                        {
                            id: 2,
                            studentName: 'Jane Smith',
                            rating: 4,
                            comment: 'Very informative and well-structured. Highly recommended!',
                            date: '1 month ago'
                        }
                    ]
                });
            }
        } catch (error) {
            console.error('Failed to fetch course:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkEnrollmentStatus = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/courses/student/enrolled', {
                headers: {
                    'authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                const enrolled = data.courses.some(course => course._id === courseId);
                setIsEnrolled(enrolled);
                if (enrolled) {
                    setProgress(Math.floor(Math.random() * 100)); // Mock progress
                }
            }
        } catch (error) {
            console.error('Failed to check enrollment:', error);
        }
    };

    const handleEnroll = async () => {
        try {
            setEnrolling(true);
            const response = await fetch(`http://localhost:3000/api/courses/${courseId}/enroll`, {
                method: 'POST',
                headers: {
                    'authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setIsEnrolled(true);
                setProgress(0);
            } else {
                const errorData = await response.json();
                console.error('Enrollment failed:', errorData.error);
            }
        } catch (error) {
            console.error('Enrollment error:', error);
        } finally {
            setEnrolling(false);
        }
    };

    const getContentIcon = (type) => {
        switch (type) {
            case 'video': return Video;
            case 'document': return FileText;
            case 'quiz': return Target;
            case 'assignment': return BarChart3;
            default: return BookOpen;
        }
    };

    const getTotalDuration = () => {
        if (!course?.curriculum) return '0 min';
        const totalMinutes = course.curriculum.reduce((total, section) => {
            return total + section.lectures.reduce((sectionTotal, lecture) => {
                const [minutes, seconds] = lecture.duration.split(':').map(Number);
                return sectionTotal + minutes + (seconds / 60);
            }, 0);
        }, 0);
        
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.floor(totalMinutes % 60);
        return `${hours}h ${minutes}m`;
    };

    if (loading) {
        return (
            <div className="px-[60px] pt-[45px] pb-[30px] min-h-screen bg-[#0d0d0d]">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e43b58]"></div>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="px-[60px] pt-[45px] pb-[30px] min-h-screen bg-[#0d0d0d]">
                <div className="text-center py-[80px]">
                    <BookOpen className="size-[64px] text-[#888888] mx-auto mb-[24px]" />
                    <h3 className="text-white text-[24px] font-semibold mb-[8px]">Course not found</h3>
                    <p className="text-[#888888] text-[16px] mb-[24px]">
                        The course you're looking for doesn't exist or has been removed.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard/stu/courses')}
                        className="bg-[#e43b58] hover:bg-[#c73650] text-white px-[24px] py-[12px] rounded-[8px] transition-colors"
                    >
                        Browse Courses
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="px-[60px] pt-[45px] pb-[30px] min-h-screen bg-[#0d0d0d]">
            {/* Header */}
            <div className="flex items-center gap-[16px] mb-[32px]">
                <button 
                    onClick={() => navigate(-1)}
                    className="w-[40px] h-[40px] bg-[#1d1d1d] hover:bg-[#383838] border border-white/10 rounded-[8px] flex items-center justify-center transition-colors"
                >
                    <ArrowLeft className="size-[20px] text-white" />
                </button>
                <div className="flex-1">
                    <h1 className="text-white text-[28px] font-semibold mb-[4px]">{course.title}</h1>
                    <p className="text-[#888888] text-[14px]">
                        By {course.educator.firstName} {course.educator.lastName}
                    </p>
                </div>
                <div className="flex items-center gap-[12px]">
                    <button
                        onClick={() => setLiked(!liked)}
                        className={`w-[40px] h-[40px] rounded-[8px] flex items-center justify-center transition-colors ${
                            liked ? 'bg-red-500/20 text-red-400' : 'bg-[#1d1d1d] text-[#888888] hover:text-white border border-white/10'
                        }`}
                    >
                        <Heart className={`size-[20px] ${liked ? 'fill-current' : ''}`} />
                    </button>
                    <button
                        onClick={() => setBookmarked(!bookmarked)}
                        className={`w-[40px] h-[40px] rounded-[8px] flex items-center justify-center transition-colors ${
                            bookmarked ? 'bg-yellow-500/20 text-yellow-400' : 'bg-[#1d1d1d] text-[#888888] hover:text-white border border-white/10'
                        }`}
                    >
                        <Bookmark className={`size-[20px] ${bookmarked ? 'fill-current' : ''}`} />
                    </button>
                    <button className="w-[40px] h-[40px] bg-[#1d1d1d] hover:bg-[#383838] border border-white/10 rounded-[8px] flex items-center justify-center transition-colors">
                        <Share2 className="size-[20px] text-white" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-[32px]">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    {/* Course Thumbnail */}
                    <div className="relative h-[300px] bg-[#383838] rounded-[12px] overflow-hidden mb-[32px]">
                        {course.thumbnail ? (
                            <img 
                                src={course.thumbnail} 
                                alt={course.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Play className="size-[64px] text-[#888888]" />
                            </div>
                        )}
                        {!isEnrolled && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="text-center">
                                    <Play className="size-[64px] text-white mx-auto mb-[16px]" />
                                    <p className="text-white text-[18px] font-medium">Preview Course</p>
                                </div>
                            </div>
                        )}
                        {isEnrolled && progress > 0 && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-[16px]">
                                <div className="flex items-center justify-between text-white text-[14px] mb-[8px]">
                                    <span>Your Progress</span>
                                    <span>{progress}% Complete</span>
                                </div>
                                <div className="w-full bg-white/20 rounded-full h-[6px] overflow-hidden">
                                    <div 
                                        className="h-full bg-[#e43b58] transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex border-b border-white/10 mb-[32px]">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-[8px] px-[20px] py-[12px] text-[14px] font-medium transition-colors border-b-2 ${
                                        activeTab === tab.id
                                            ? 'text-[#e43b58] border-[#e43b58]'
                                            : 'text-[#888888] border-transparent hover:text-white'
                                    }`}
                                >
                                    <Icon className="size-[16px]" />
                                    {tab.name}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'overview' && (
                        <div className="space-y-[24px]">
                            <div>
                                <h3 className="text-white text-[20px] font-semibold mb-[12px]">About this course</h3>
                                <p className="text-[#cccccc] text-[16px] leading-[1.6]">{course.description}</p>
                            </div>

                            <div>
                                <h3 className="text-white text-[20px] font-semibold mb-[12px]">What you'll learn</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
                                    {course.objectives.map((objective, index) => (
                                        <div key={index} className="flex items-start gap-[8px]">
                                            <CheckCircle className="size-[16px] text-green-400 mt-[2px] flex-shrink-0" />
                                            <span className="text-[#cccccc] text-[14px]">{objective}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-white text-[20px] font-semibold mb-[12px]">Requirements</h3>
                                <ul className="space-y-[8px]">
                                    {course.requirements.map((requirement, index) => (
                                        <li key={index} className="flex items-start gap-[8px]">
                                            <div className="w-[4px] h-[4px] bg-[#888888] rounded-full mt-[8px] flex-shrink-0"></div>
                                            <span className="text-[#cccccc] text-[14px]">{requirement}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-white text-[20px] font-semibold mb-[12px]">Skills you'll gain</h3>
                                <div className="flex flex-wrap gap-[8px]">
                                    {course.skills.map((skill, index) => (
                                        <span key={index} className="bg-[#e43b58]/20 text-[#e43b58] px-[12px] py-[6px] rounded-[6px] text-[14px]">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'curriculum' && (
                        <div className="space-y-[16px]">
                            <div className="flex items-center justify-between mb-[24px]">
                                <h3 className="text-white text-[20px] font-semibold">Course Curriculum</h3>
                                <div className="text-[#888888] text-[14px]">
                                    {course.totalLectures} lectures • {getTotalDuration()}
                                </div>
                            </div>

                            {course.curriculum.map((section, sectionIndex) => (
                                <div key={section.id} className="bg-[#1d1d1d] border border-white/10 rounded-[12px] overflow-hidden">
                                    <div className="p-[20px] border-b border-white/10">
                                        <h4 className="text-white text-[16px] font-semibold">
                                            Section {sectionIndex + 1}: {section.title}
                                        </h4>
                                        <p className="text-[#888888] text-[12px] mt-[4px]">
                                            {section.lectures.length} lectures
                                        </p>
                                    </div>
                                    <div className="divide-y divide-white/10">
                                        {section.lectures.map((lecture) => {
                                            const Icon = getContentIcon(lecture.type);
                                            const canAccess = isEnrolled || lecture.free;
                                            
                                            return (
                                                <div 
                                                    key={lecture.id} 
                                                    className={`p-[16px] flex items-center gap-[12px] ${canAccess ? 'hover:bg-[#383838]/20 cursor-pointer' : 'opacity-60'}`}
                                                >
                                                    <div className={`w-[32px] h-[32px] rounded-[6px] flex items-center justify-center ${
                                                        lecture.completed ? 'bg-green-500/20' : 'bg-[#383838]'
                                                    }`}>
                                                        {lecture.completed ? (
                                                            <CheckCircle className="size-[16px] text-green-400" />
                                                        ) : canAccess ? (
                                                            <Icon className="size-[16px] text-white" />
                                                        ) : (
                                                            <Lock className="size-[16px] text-[#888888]" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className={`text-[14px] font-medium ${canAccess ? 'text-white' : 'text-[#888888]'}`}>
                                                            {lecture.title}
                                                            {lecture.free && !isEnrolled && (
                                                                <span className="ml-[8px] bg-blue-500/20 text-blue-400 px-[6px] py-[2px] rounded-[4px] text-[10px]">
                                                                    FREE
                                                                </span>
                                                            )}
                                                        </p>
                                                        <p className="text-[#888888] text-[12px] capitalize">{lecture.type} • {lecture.duration}</p>
                                                    </div>
                                                    {canAccess && (
                                                        <Play className="size-[16px] text-[#888888]" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="space-y-[24px]">
                            <div className="flex items-center gap-[24px] mb-[32px]">
                                <div className="text-center">
                                    <div className="text-white text-[48px] font-bold">{course.rating}</div>
                                    <div className="flex items-center justify-center gap-[4px] mb-[4px]">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`size-[16px] ${
                                                    i < Math.floor(course.rating) ? 'text-yellow-400 fill-current' : 'text-[#888888]'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-[#888888] text-[12px]">{course.totalRatings} ratings</p>
                                </div>
                                <div className="flex-1">
                                    {[5, 4, 3, 2, 1].map(stars => (
                                        <div key={stars} className="flex items-center gap-[8px] mb-[4px]">
                                            <div className="flex items-center gap-[4px]">
                                                {[...Array(stars)].map((_, i) => (
                                                    <Star key={i} className="size-[12px] text-yellow-400 fill-current" />
                                                ))}
                                            </div>
                                            <div className="flex-1 bg-[#383838] h-[6px] rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-yellow-400"
                                                    style={{ width: `${Math.random() * 80 + 10}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-[#888888] text-[12px] w-[30px]">
                                                {Math.floor(Math.random() * 50)}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-[20px]">
                                {course.reviews.map(review => (
                                    <div key={review.id} className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[20px]">
                                        <div className="flex items-start gap-[12px]">
                                            <div className="w-[40px] h-[40px] bg-[#383838] rounded-full flex items-center justify-center">
                                                <User className="size-[20px] text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-[8px]">
                                                    <h4 className="text-white text-[14px] font-medium">{review.studentName}</h4>
                                                    <span className="text-[#888888] text-[12px]">{review.date}</span>
                                                </div>
                                                <div className="flex items-center gap-[4px] mb-[8px]">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`size-[12px] ${
                                                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-[#888888]'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="text-[#cccccc] text-[14px]">{review.comment}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'instructor' && (
                        <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                            <div className="flex items-start gap-[20px]">
                                <div className="w-[80px] h-[80px] bg-[#383838] rounded-full flex items-center justify-center">
                                    {course.educator.profilePicture ? (
                                        <img 
                                            src={course.educator.profilePicture} 
                                            alt={`${course.educator.firstName} ${course.educator.lastName}`}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <User className="size-[40px] text-white" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white text-[20px] font-semibold mb-[8px]">
                                        {course.educator.firstName} {course.educator.lastName}
                                    </h3>
                                    <p className="text-[#888888] text-[14px] mb-[16px]">Course Instructor</p>
                                    <div className="grid grid-cols-2 gap-[16px] mb-[16px]">
                                        <div className="text-center">
                                            <p className="text-white text-[20px] font-semibold">4.8</p>
                                            <p className="text-[#888888] text-[12px]">Instructor Rating</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-white text-[20px] font-semibold">1,234</p>
                                            <p className="text-[#888888] text-[12px]">Students Taught</p>
                                        </div>
                                    </div>
                                    <p className="text-[#cccccc] text-[14px] leading-[1.6]">
                                        Experienced educator with over 5 years of teaching in the industry. 
                                        Passionate about helping students achieve their learning goals through 
                                        practical, hands-on instruction.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-[24px]">
                    {/* Enrollment Card */}
                    <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                        <div className="text-center mb-[20px]">
                            <div className="text-white text-[32px] font-bold mb-[4px]">${course.price}</div>
                            <p className="text-[#888888] text-[14px]">One-time payment</p>
                        </div>

                        {isEnrolled ? (
                            <div className="space-y-[12px]">
                                <div className="bg-green-500/20 text-green-400 py-[12px] rounded-[8px] text-center text-[14px] font-medium">
                                    ✓ Enrolled
                                </div>
                                <button 
                                    onClick={() => navigate(`/dashboard/stu/courses/${courseId}/content`)}
                                    className="w-full bg-[#e43b58] hover:bg-[#c73650] text-white py-[12px] rounded-[8px] transition-colors"
                                >
                                    Continue Learning
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleEnroll}
                                disabled={enrolling}
                                className="w-full bg-[#e43b58] hover:bg-[#c73650] disabled:opacity-50 text-white py-[12px] rounded-[8px] transition-colors flex items-center justify-center gap-[8px]"
                            >
                                {enrolling ? (
                                    <>
                                        <div className="w-[16px] h-[16px] border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        Enrolling...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="size-[16px]" />
                                        Enroll Now
                                    </>
                                )}
                            </button>
                        )}

                        <p className="text-[#888888] text-[12px] text-center mt-[12px]">
                            30-day money-back guarantee
                        </p>
                    </div>

                    {/* Course Info */}
                    <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[20px]">
                        <h3 className="text-white text-[16px] font-semibold mb-[16px]">Course Information</h3>
                        <div className="space-y-[12px]">
                            <div className="flex items-center gap-[8px] text-[14px]">
                                <Clock className="size-[16px] text-[#888888]" />
                                <span className="text-[#888888]">Duration:</span>
                                <span className="text-white">{getTotalDuration()}</span>
                            </div>
                            <div className="flex items-center gap-[8px] text-[14px]">
                                <BarChart3 className="size-[16px] text-[#888888]" />
                                <span className="text-[#888888]">Level:</span>
                                <span className="text-white capitalize">{course.level}</span>
                            </div>
                            <div className="flex items-center gap-[8px] text-[14px]">
                                <Users className="size-[16px] text-[#888888]" />
                                <span className="text-[#888888]">Enrolled:</span>
                                <span className="text-white">{course.enrolledStudents?.length || 0} students</span>
                            </div>
                            <div className="flex items-center gap-[8px] text-[14px]">
                                <Globe className="size-[16px] text-[#888888]" />
                                <span className="text-[#888888]">Language:</span>
                                <span className="text-white">{course.language}</span>
                            </div>
                            <div className="flex items-center gap-[8px] text-[14px]">
                                <Calendar className="size-[16px] text-[#888888]" />
                                <span className="text-[#888888]">Updated:</span>
                                <span className="text-white">{course.lastUpdated}</span>
                            </div>
                        </div>
                    </div>

                    {/* Course Features */}
                    <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[20px]">
                        <h3 className="text-white text-[16px] font-semibold mb-[16px]">This course includes</h3>
                        <div className="space-y-[8px]">
                            <div className="flex items-center gap-[8px] text-[14px]">
                                <Video className="size-[16px] text-[#888888]" />
                                <span className="text-[#cccccc]">{course.totalLectures} video lectures</span>
                            </div>
                            <div className="flex items-center gap-[8px] text-[14px]">
                                <Target className="size-[16px] text-[#888888]" />
                                <span className="text-[#cccccc]">{course.totalQuizzes} quizzes</span>
                            </div>
                            <div className="flex items-center gap-[8px] text-[14px]">
                                <FileText className="size-[16px] text-[#888888]" />
                                <span className="text-[#cccccc]">{course.totalAssignments} assignments</span>
                            </div>
                            <div className="flex items-center gap-[8px] text-[14px]">
                                <Download className="size-[16px] text-[#888888]" />
                                <span className="text-[#cccccc]">Downloadable resources</span>
                            </div>
                            <div className="flex items-center gap-[8px] text-[14px]">
                                <Award className="size-[16px] text-[#888888]" />
                                <span className="text-[#cccccc]">Certificate of completion</span>
                            </div>
                            <div className="flex items-center gap-[8px] text-[14px]">
                                <Clock className="size-[16px] text-[#888888]" />
                                <span className="text-[#cccccc]">Lifetime access</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}