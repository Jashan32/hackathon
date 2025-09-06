import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft,
    Play,
    Clock,
    Users,
    Star,
    BookOpen,
    CheckCircle,
    Circle,
    Lock,
    FileText,
    Video,
    Download,
    Award,
    Calendar,
    BarChart3,
    Target,
    TrendingUp,
    Eye,
    PlayCircle,
    Bookmark,
    Share2,
    MessageSquare,
    User,
    Globe,
    Linkedin,
    Twitter
} from 'lucide-react';

export default function ViewEnrolled() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [lectureProgress, setLectureProgress] = useState({});
    const [activeTab, setActiveTab] = useState('overview');
    const [bookmarked, setBookmarked] = useState(false);

    const tabs = [
        { id: 'overview', name: 'Overview', icon: BookOpen },
        { id: 'curriculum', name: 'Curriculum', icon: Video },
        { id: 'progress', name: 'My Progress', icon: BarChart3 },
        { id: 'instructor', name: 'Instructor', icon: User }
    ];

    // Mock course data - Remove when backend is fully integrated
    const mockCourse = {
        _id: courseId,
        title: "Advanced React Development",
        description: "Master advanced React concepts including hooks, context, performance optimization, and testing. Build real-world applications with modern React patterns and best practices.",
        thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop",
        category: "Programming",
        difficulty: "Advanced",
        price: 99.99,
        rating: 4.8,
        totalStudents: 1250,
        totalLectures: 45,
        totalDuration: "8h 30m",
        language: "English",
        lastUpdated: "2024-01-15",
        enrolledAt: "2024-01-10",
        progress: 65,
        educator: {
            _id: "educator1",
            firstName: "John",
            lastName: "Doe",
            bio: "Senior React Developer with 8+ years of experience. Former Facebook engineer and React core contributor.",
            profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            socialLinks: {
                website: "https://johndoe.dev",
                linkedin: "https://linkedin.com/in/johndoe",
                twitter: "@johndoe"
            },
            totalStudents: 5000,
            totalCourses: 12,
            rating: 4.9
        },
        curriculum: [
            {
                _id: "section1",
                title: "Getting Started with Advanced React",
                lectures: [
                    {
                        _id: "lec1",
                        title: "Course Introduction and Setup",
                        duration: "12:30",
                        type: "video",
                        completed: true,
                        locked: false,
                        preview: true
                    },
                    {
                        _id: "lec2",
                        title: "Modern React Development Environment",
                        duration: "18:45",
                        type: "video",
                        completed: true,
                        locked: false,
                        preview: false
                    },
                    {
                        _id: "lec3",
                        title: "Project Structure and Best Practices",
                        duration: "15:20",
                        type: "video",
                        completed: false,
                        locked: false,
                        preview: false
                    }
                ]
            },
            {
                _id: "section2",
                title: "Advanced Hooks and State Management",
                lectures: [
                    {
                        _id: "lec4",
                        title: "Custom Hooks Deep Dive",
                        duration: "25:15",
                        type: "video",
                        completed: false,
                        locked: false,
                        preview: false
                    },
                    {
                        _id: "lec5",
                        title: "useReducer vs useState",
                        duration: "20:30",
                        type: "video",
                        completed: false,
                        locked: false,
                        preview: false
                    },
                    {
                        _id: "lec6",
                        title: "Context API and Performance",
                        duration: "22:45",
                        type: "video",
                        completed: false,
                        locked: true,
                        preview: false
                    }
                ]
            },
            {
                _id: "section3",
                title: "Performance Optimization",
                lectures: [
                    {
                        _id: "lec7",
                        title: "React.memo and useMemo",
                        duration: "19:10",
                        type: "video",
                        completed: false,
                        locked: true,
                        preview: false
                    },
                    {
                        _id: "lec8",
                        title: "Code Splitting and Lazy Loading",
                        duration: "24:35",
                        type: "video",
                        completed: false,
                        locked: true,
                        preview: false
                    }
                ]
            }
        ],
        achievements: [
            { name: "First Lecture Complete", earned: true, date: "2024-01-10" },
            { name: "50% Progress", earned: true, date: "2024-01-20" },
            { name: "Course Complete", earned: false, date: null }
        ],
        learningStats: {
            totalTimeWatched: "5h 25m",
            averageSessionTime: "45m",
            streak: 5,
            lastAccessed: "2024-01-25"
        }
    };

    useEffect(() => {
        fetchEnrolledCourse();
    }, [courseId]);

    const fetchEnrolledCourse = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3000/api/courses/${courseId}/curriculum`, {
                headers: {
                    'authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Course data:', data);
                
                // Process the data to match the expected format
                const processedCourse = {
                    ...data.course,
                    enrolledAt: data.course.enrolledAt || new Date().toISOString(),
                    progress: data.progress.overallProgress,
                    learningStats: {
                        totalTimeWatched: `${Math.floor(data.progress.totalTimeSpent / 60)}h ${data.progress.totalTimeSpent % 60}m`,
                        averageSessionTime: "45m", // Mock data for now
                        streak: data.progress.streak,
                        lastAccessed: data.progress.lastAccessed
                    },
                    achievements: data.progress.achievements.length > 0 ? data.progress.achievements.map(achievement => ({
                        name: achievement.name,
                        earned: true,
                        date: achievement.earnedAt
                    })) : [
                        { name: "First Lecture Complete", earned: data.progress.overallProgress > 0, date: data.progress.overallProgress > 0 ? new Date().toISOString() : null },
                        { name: "50% Progress", earned: data.progress.overallProgress >= 50, date: data.progress.overallProgress >= 50 ? new Date().toISOString() : null },
                        { name: "Course Complete", earned: data.progress.overallProgress === 100, date: data.progress.overallProgress === 100 ? new Date().toISOString() : null }
                    ]
                };

                setCourse(processedCourse);
                setProgress(data.progress.overallProgress);
                
                // Set lecture progress state
                const lectureProgressMap = {};
                data.course.curriculum.forEach(section => {
                    section.lectures.forEach(lecture => {
                        lectureProgressMap[lecture._id] = {
                            completed: lecture.completed,
                            locked: lecture.locked,
                            watchTime: lecture.watchTime
                        };
                    });
                });
                setLectureProgress(lectureProgressMap);
            } else {
                console.error('Failed to fetch course data:', response.statusText);
            }
        } catch (error) {
            console.error('Failed to fetch enrolled course:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCompletedLectures = () => {
        if (!course) return 0;
        return course.curriculum.reduce((total, section) => {
            return total + section.lectures.filter(lecture => {
                const lectureProgressData = lectureProgress[lecture._id] || {};
                return lectureProgressData.completed || lecture.completed;
            }).length;
        }, 0);
    };

    const getTotalLectures = () => {
        if (!course) return 0;
        return course.curriculum.reduce((total, section) => {
            return total + section.lectures.length;
        }, 0);
    };

    const startLearning = () => {
        navigate(`/dashboard/stu/courses/${courseId}/content`);
    };

    const continueFromLastPoint = () => {
        // Find the first incomplete lecture that's not locked
        for (const section of course.curriculum) {
            for (const lecture of section.lectures) {
                const lectureProgressData = lectureProgress[lecture._id] || {};
                const isCompleted = lectureProgressData.completed || lecture.completed;
                const isLocked = lectureProgressData.locked !== false && lecture.locked;
                
                if (!isCompleted && !isLocked) {
                    navigate(`/dashboard/stu/courses/${courseId}/content/${lecture._id}`);
                    return;
                }
            }
        }
        // If all completed or no unlocked lectures found, start from beginning
        startLearning();
    };

    const renderOverviewTab = () => (
        <div className="space-y-[24px]">
            {/* Course Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
                <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[20px]">
                    <div className="flex items-center gap-[12px] mb-[8px]">
                        <BarChart3 className="size-[20px] text-[#e43b58]" />
                        <span className="text-[#888888] text-[14px]">Progress</span>
                    </div>
                    <p className="text-white text-[24px] font-bold">{progress}%</p>
                    <p className="text-[#888888] text-[12px]">{getCompletedLectures()}/{getTotalLectures()} lectures</p>
                </div>

                <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[20px]">
                    <div className="flex items-center gap-[12px] mb-[8px]">
                        <Clock className="size-[20px] text-[#e43b58]" />
                        <span className="text-[#888888] text-[14px]">Time Watched</span>
                    </div>
                    <p className="text-white text-[24px] font-bold">{course.learningStats.totalTimeWatched}</p>
                    <p className="text-[#888888] text-[12px]">Avg {course.learningStats.averageSessionTime}/session</p>
                </div>

                <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[20px]">
                    <div className="flex items-center gap-[12px] mb-[8px]">
                        <Target className="size-[20px] text-[#e43b58]" />
                        <span className="text-[#888888] text-[14px]">Streak</span>
                    </div>
                    <p className="text-white text-[24px] font-bold">{course.learningStats.streak}</p>
                    <p className="text-[#888888] text-[12px]">days in a row</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                <h3 className="text-white text-[18px] font-semibold mb-[16px]">Quick Actions</h3>
                <div className="flex flex-wrap gap-[12px]">
                    <button
                        onClick={continueFromLastPoint}
                        className="flex items-center gap-[8px] bg-[#e43b58] hover:bg-[#c73650] text-white px-[20px] py-[12px] rounded-[8px] transition-colors"
                    >
                        <Play className="size-[16px]" />
                        Continue Learning
                    </button>
                    <button
                        onClick={() => setActiveTab('curriculum')}
                        className="flex items-center gap-[8px] bg-[#383838] hover:bg-[#4a4a4a] text-white px-[20px] py-[12px] rounded-[8px] transition-colors"
                    >
                        <BookOpen className="size-[16px]" />
                        View Curriculum
                    </button>
                    <button
                        onClick={() => setActiveTab('progress')}
                        className="flex items-center gap-[8px] bg-[#383838] hover:bg-[#4a4a4a] text-white px-[20px] py-[12px] rounded-[8px] transition-colors"
                    >
                        <BarChart3 className="size-[16px]" />
                        Track Progress
                    </button>
                </div>
            </div>

            {/* Course Description */}
            <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                <h3 className="text-white text-[18px] font-semibold mb-[16px]">About This Course</h3>
                <p className="text-[#cccccc] text-[14px] leading-relaxed mb-[16px]">
                    {course.description}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px] text-[14px]">
                    <div>
                        <p className="text-[#888888] mb-[4px]">Level</p>
                        <p className="text-white font-medium">{course.difficulty}</p>
                    </div>
                    <div>
                        <p className="text-[#888888] mb-[4px]">Duration</p>
                        <p className="text-white font-medium">{course.totalDuration}</p>
                    </div>
                    <div>
                        <p className="text-[#888888] mb-[4px]">Language</p>
                        <p className="text-white font-medium">{course.language}</p>
                    </div>
                    <div>
                        <p className="text-[#888888] mb-[4px]">Updated</p>
                        <p className="text-white font-medium">{new Date(course.lastUpdated).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Curriculum Overview */}
            <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                <h3 className="text-white text-[18px] font-semibold mb-[16px]">Curriculum Overview</h3>
                <div className="space-y-[12px]">
                    {course.curriculum.slice(0, 3).map((section, index) => {
                        const completedLectures = section.lectures.filter(lecture => {
                            const lectureProgressData = lectureProgress[lecture._id] || {};
                            return lectureProgressData.completed || lecture.completed;
                        }).length;
                        const sectionProgress = section.lectures.length > 0 ? Math.round((completedLectures / section.lectures.length) * 100) : 0;
                        
                        return (
                            <div key={section._id} className="flex items-center justify-between p-[16px] bg-[#383838] rounded-[8px]">
                                <div className="flex-1">
                                    <h4 className="text-white text-[14px] font-medium mb-[4px]">
                                        Section {index + 1}: {section.title}
                                    </h4>
                                    <p className="text-[#888888] text-[12px]">
                                        {completedLectures}/{section.lectures.length} lectures completed
                                    </p>
                                </div>
                                <div className="flex items-center gap-[12px]">
                                    <span className="text-[#e43b58] text-[14px] font-semibold">{sectionProgress}%</span>
                                    <div className="w-[60px] bg-[#1d1d1d] rounded-full h-[4px]">
                                        <div 
                                            className="bg-[#e43b58] h-[4px] rounded-full transition-all duration-300"
                                            style={{ width: `${sectionProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {course.curriculum.length > 3 && (
                        <button
                            onClick={() => setActiveTab('curriculum')}
                            className="w-full text-[#e43b58] text-[14px] font-medium hover:text-[#c73650] transition-colors text-center py-[8px]"
                        >
                            View all {course.curriculum.length} sections →
                        </button>
                    )}
                </div>
            </div>

            {/* Achievements */}
            <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                <h3 className="text-white text-[18px] font-semibold mb-[16px]">Achievements</h3>
                <div className="space-y-[12px]">
                    {course.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-center gap-[12px]">
                            <Award className={`size-[20px] ${achievement.earned ? 'text-yellow-500' : 'text-[#888888]'}`} />
                            <div className="flex-1">
                                <p className={`text-[14px] font-medium ${achievement.earned ? 'text-white' : 'text-[#888888]'}`}>
                                    {achievement.name}
                                </p>
                                {achievement.earned && achievement.date && (
                                    <p className="text-[#888888] text-[12px]">
                                        Earned on {new Date(achievement.date).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderCurriculumTab = () => {
        // Calculate section progress
        const getSectionProgress = (section) => {
            const completedLectures = section.lectures.filter(lecture => {
                const lectureProgressData = lectureProgress[lecture._id] || {};
                return lectureProgressData.completed || lecture.completed;
            }).length;
            return section.lectures.length > 0 ? Math.round((completedLectures / section.lectures.length) * 100) : 0;
        };

        // Calculate section duration
        const getSectionDuration = (section) => {
            const totalSeconds = section.lectures.reduce((total, lecture) => {
                const [minutes, seconds] = lecture.duration.split(':').map(Number);
                return total + (minutes * 60) + seconds;
            }, 0);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        };

        // Get lecture type icon
        const getLectureTypeIcon = (type) => {
            switch (type) {
                case 'video': return Video;
                case 'document': return FileText;
                case 'quiz': return Target;
                case 'assignment': return BookOpen;
                default: return Video;
            }
        };

        return (
            <div className="space-y-[16px]">
                {course.curriculum.map((section, sectionIndex) => {
                    const sectionProgress = getSectionProgress(section);
                    const sectionDuration = getSectionDuration(section);
                    
                    return (
                        <div key={section._id} className="bg-[#1d1d1d] border border-white/10 rounded-[12px] overflow-hidden">
                            <div className="bg-[#383838] px-[20px] py-[16px]">
                                <div className="flex items-center justify-between mb-[8px]">
                                    <h3 className="text-white text-[16px] font-semibold">
                                        Section {sectionIndex + 1}: {section.title}
                                    </h3>
                                    <span className="text-[#e43b58] text-[14px] font-semibold">{sectionProgress}%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-[16px] text-[#888888] text-[14px]">
                                        <span>{section.lectures.length} lectures</span>
                                        <span>{sectionDuration}</span>
                                    </div>
                                    <div className="w-[100px] bg-[#1d1d1d] rounded-full h-[4px]">
                                        <div 
                                            className="bg-[#e43b58] h-[4px] rounded-full transition-all duration-300"
                                            style={{ width: `${sectionProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                                {section.description && (
                                    <p className="text-[#cccccc] text-[13px] mt-[8px] leading-relaxed">
                                        {section.description}
                                    </p>
                                )}
                            </div>
                            <div className="divide-y divide-white/10">
                                {section.lectures.map((lecture, lectureIndex) => {
                                    const lectureProgressData = lectureProgress[lecture._id] || {};
                                    const LectureIcon = getLectureTypeIcon(lecture.type);
                                    const isCompleted = lectureProgressData.completed || lecture.completed;
                                    const isLocked = lectureProgressData.locked !== false && lecture.locked;
                                    const watchTime = lectureProgressData.watchTime || 0;
                                    
                                    return (
                                        <div key={lecture._id} className="p-[20px] hover:bg-[#383838] transition-colors">
                                            <div className="flex items-center gap-[16px]">
                                                <div className="w-[32px] h-[32px] flex items-center justify-center">
                                                    {isCompleted ? (
                                                        <CheckCircle className="size-[20px] text-green-500" />
                                                    ) : isLocked ? (
                                                        <Lock className="size-[20px] text-[#888888]" />
                                                    ) : (
                                                        <Circle className="size-[20px] text-[#888888]" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-[8px] mb-[4px]">
                                                        <h4 className={`text-[14px] font-medium ${isLocked ? 'text-[#888888]' : 'text-white'}`}>
                                                            {lectureIndex + 1}. {lecture.title}
                                                        </h4>
                                                        <div className="flex items-center gap-[4px]">
                                                            {lecture.isPreview && (
                                                                <span className="bg-[#e43b58] text-white text-[10px] px-[6px] py-[1px] rounded-full">
                                                                    Preview
                                                                </span>
                                                            )}
                                                            {!lecture.isPublished && (
                                                                <span className="bg-yellow-600 text-white text-[10px] px-[6px] py-[1px] rounded-full">
                                                                    Draft
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-[12px] text-[12px] text-[#888888] mb-[4px]">
                                                        <div className="flex items-center gap-[4px]">
                                                            <LectureIcon className="size-[12px]" />
                                                            <span className="capitalize">{lecture.type}</span>
                                                        </div>
                                                        <div className="flex items-center gap-[4px]">
                                                            <Clock className="size-[12px]" />
                                                            <span>{lecture.duration}</span>
                                                        </div>
                                                        {watchTime > 0 && (
                                                            <div className="flex items-center gap-[4px]">
                                                                <Eye className="size-[12px]" />
                                                                <span>{Math.floor(watchTime / 60)}min watched</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {lecture.description && (
                                                        <p className="text-[#888888] text-[12px] truncate">
                                                            {lecture.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => navigate(`/dashboard/stu/courses/${courseId}/content/${lecture._id}`)}
                                                    disabled={isLocked}
                                                    className={`w-[40px] h-[40px] rounded-[8px] flex items-center justify-center transition-colors ${
                                                        isLocked
                                                            ? 'bg-[#383838] cursor-not-allowed'
                                                            : 'bg-[#e43b58] hover:bg-[#c73650]'
                                                    }`}
                                                >
                                                    <PlayCircle className={`size-[20px] ${isLocked ? 'text-[#888888]' : 'text-white'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderProgressTab = () => (
        <div className="space-y-[24px]">
            {/* Overall Progress */}
            <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                <h3 className="text-white text-[18px] font-semibold mb-[16px]">Overall Progress</h3>
                <div className="mb-[16px]">
                    <div className="flex items-center justify-between mb-[8px]">
                        <span className="text-white text-[14px]">Course Completion</span>
                        <span className="text-[#e43b58] text-[14px] font-semibold">{progress}%</span>
                    </div>
                    <div className="w-full bg-[#383838] rounded-full h-[8px]">
                        <div 
                            className="bg-[#e43b58] h-[8px] rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-[16px] text-[14px]">
                    <div>
                        <p className="text-[#888888]">Completed Lectures</p>
                        <p className="text-white font-semibold">{getCompletedLectures()}/{getTotalLectures()}</p>
                    </div>
                    <div>
                        <p className="text-[#888888]">Time Invested</p>
                        <p className="text-white font-semibold">{course.learningStats.totalTimeWatched}</p>
                    </div>
                </div>
            </div>

            {/* Learning Streak */}
            <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                <h3 className="text-white text-[18px] font-semibold mb-[16px]">Learning Streak</h3>
                <div className="flex items-center gap-[16px]">
                    <div className="w-[60px] h-[60px] bg-[#e43b58] rounded-full flex items-center justify-center">
                        <span className="text-white text-[20px] font-bold">{course.learningStats.streak}</span>
                    </div>
                    <div>
                        <p className="text-white text-[16px] font-semibold">Days in a row!</p>
                        <p className="text-[#888888] text-[14px]">Keep it up to maintain your streak</p>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                <h3 className="text-white text-[18px] font-semibold mb-[16px]">Recent Activity</h3>
                <div className="space-y-[12px]">
                    <div className="flex items-center gap-[12px] p-[12px] bg-[#383838] rounded-[8px]">
                        <CheckCircle className="size-[16px] text-green-500" />
                        <div className="flex-1">
                            <p className="text-white text-[14px]">Completed "Modern React Development Environment"</p>
                            <p className="text-[#888888] text-[12px]">2 hours ago</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-[12px] p-[12px] bg-[#383838] rounded-[8px]">
                        <Play className="size-[16px] text-[#e43b58]" />
                        <div className="flex-1">
                            <p className="text-white text-[14px]">Started "Project Structure and Best Practices"</p>
                            <p className="text-[#888888] text-[12px]">1 day ago</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-[12px] p-[12px] bg-[#383838] rounded-[8px]">
                        <Award className="size-[16px] text-yellow-500" />
                        <div className="flex-1">
                            <p className="text-white text-[14px]">Earned "50% Progress" achievement</p>
                            <p className="text-[#888888] text-[12px]">3 days ago</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderInstructorTab = () => (
        <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
            <div className="flex items-start gap-[20px] mb-[24px]">
                <div className="w-[80px] h-[80px] rounded-full overflow-hidden bg-[#383838]">
                    {course.educator.profilePicture ? (
                        <img 
                            src={course.educator.profilePicture} 
                            alt={`${course.educator.firstName} ${course.educator.lastName}`}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <User className="size-[32px] text-[#888888]" />
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <h3 className="text-white text-[20px] font-semibold mb-[8px]">
                        {course.educator.firstName} {course.educator.lastName}
                    </h3>
                    <p className="text-[#cccccc] text-[14px] leading-relaxed mb-[16px]">
                        {course.educator.bio}
                    </p>
                    <div className="flex items-center gap-[16px] mb-[16px]">
                        <div className="text-center">
                            <p className="text-white text-[18px] font-semibold">{course.educator.rating}</p>
                            <p className="text-[#888888] text-[12px]">Rating</p>
                        </div>
                        <div className="text-center">
                            <p className="text-white text-[18px] font-semibold">{course.educator.totalStudents.toLocaleString()}</p>
                            <p className="text-[#888888] text-[12px]">Students</p>
                        </div>
                        <div className="text-center">
                            <p className="text-white text-[18px] font-semibold">{course.educator.totalCourses}</p>
                            <p className="text-[#888888] text-[12px]">Courses</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-[12px]">
                        {course.educator.socialLinks.website && (
                            <a
                                href={course.educator.socialLinks.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-[36px] h-[36px] bg-[#383838] hover:bg-[#4a4a4a] rounded-[8px] flex items-center justify-center transition-colors"
                            >
                                <Globe className="size-[16px] text-[#888888]" />
                            </a>
                        )}
                        {course.educator.socialLinks.linkedin && (
                            <a
                                href={course.educator.socialLinks.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-[36px] h-[36px] bg-[#383838] hover:bg-[#4a4a4a] rounded-[8px] flex items-center justify-center transition-colors"
                            >
                                <Linkedin className="size-[16px] text-[#888888]" />
                            </a>
                        )}
                        {course.educator.socialLinks.twitter && (
                            <a
                                href={course.educator.socialLinks.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-[36px] h-[36px] bg-[#383838] hover:bg-[#4a4a4a] rounded-[8px] flex items-center justify-center transition-colors"
                            >
                                <Twitter className="size-[16px] text-[#888888]" />
                            </a>
                        )}
                        <button className="w-[36px] h-[36px] bg-[#383838] hover:bg-[#4a4a4a] rounded-[8px] flex items-center justify-center transition-colors">
                            <MessageSquare className="size-[16px] text-[#888888]" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview': return renderOverviewTab();
            case 'curriculum': return renderCurriculumTab();
            case 'progress': return renderProgressTab();
            case 'instructor': return renderInstructorTab();
            default: return renderOverviewTab();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
                <div className="text-white">Loading course...</div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-white text-[24px] font-semibold mb-[8px]">Course Not Found</h2>
                    <p className="text-[#888888] mb-[16px]">The course you're looking for doesn't exist or you don't have access.</p>
                    <button
                        onClick={() => navigate('/dashboard/stu/enrolled')}
                        className="bg-[#e43b58] hover:bg-[#c73650] text-white px-[20px] py-[10px] rounded-[8px] transition-colors"
                    >
                        Back to Enrolled Courses
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0d0d0d] p-[24px]">
            <div className="max-w-[1200px] mx-auto">
                {/* Header */}
                <div className="flex items-center gap-[16px] mb-[24px]">
                    <button
                        onClick={() => navigate('/dashboard/stu/enrolled')}
                        className="w-[40px] h-[40px] bg-[#1d1d1d] hover:bg-[#383838] border border-white/10 rounded-[8px] flex items-center justify-center transition-colors"
                    >
                        <ArrowLeft className="size-[20px] text-white" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-white text-[24px] font-bold">{course.title}</h1>
                        <p className="text-[#888888] text-[14px]">
                            Enrolled on {new Date(course.enrolledAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex items-center gap-[12px]">
                        <button
                            onClick={() => setBookmarked(!bookmarked)}
                            className={`w-[40px] h-[40px] rounded-[8px] flex items-center justify-center transition-colors ${
                                bookmarked ? 'bg-[#e43b58] text-white' : 'bg-[#1d1d1d] border border-white/10 text-[#888888] hover:text-white'
                            }`}
                        >
                            <Bookmark className="size-[18px]" />
                        </button>
                        <button className="w-[40px] h-[40px] bg-[#1d1d1d] border border-white/10 hover:bg-[#383838] rounded-[8px] flex items-center justify-center transition-colors">
                            <Share2 className="size-[18px] text-[#888888]" />
                        </button>
                    </div>
                </div>

                {/* Course Header */}
                <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px] mb-[24px]">
                    <div className="flex gap-[24px]">
                        <div className="w-[200px] h-[112px] bg-[#383838] rounded-[8px] overflow-hidden flex-shrink-0">
                            {course.thumbnail ? (
                                <img 
                                    src={course.thumbnail} 
                                    alt={course.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <PlayCircle className="size-[48px] text-[#888888]" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-[12px] mb-[8px]">
                                <span className="bg-[#e43b58] text-white text-[12px] px-[8px] py-[2px] rounded-full">
                                    {course.category}
                                </span>
                                <span className="bg-[#383838] text-white text-[12px] px-[8px] py-[2px] rounded-full">
                                    {course.difficulty}
                                </span>
                            </div>
                            <div className="flex items-center gap-[16px] mb-[16px] text-[14px] text-[#888888]">
                                <div className="flex items-center gap-[4px]">
                                    <Star className="size-[14px] text-yellow-500" />
                                    <span>{course.rating}</span>
                                </div>
                                <div className="flex items-center gap-[4px]">
                                    <Users className="size-[14px]" />
                                    <span>{course.totalStudents.toLocaleString()} students</span>
                                </div>
                                <div className="flex items-center gap-[4px]">
                                    <Clock className="size-[14px]" />
                                    <span>{course.totalDuration}</span>
                                </div>
                            </div>
                            <div className="mb-[16px]">
                                <div className="flex items-center justify-between mb-[8px]">
                                    <span className="text-white text-[14px]">Progress</span>
                                    <span className="text-[#e43b58] text-[14px] font-semibold">{progress}%</span>
                                </div>
                                <div className="w-full bg-[#383838] rounded-full h-[6px]">
                                    <div 
                                        className="bg-[#e43b58] h-[6px] rounded-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                            <button
                                onClick={continueFromLastPoint}
                                className="bg-[#e43b58] hover:bg-[#c73650] text-white px-[20px] py-[12px] rounded-[8px] transition-colors flex items-center gap-[8px]"
                            >
                                <Play className="size-[16px]" />
                                Continue Learning
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-white/10 mb-[24px]">
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
                {renderTabContent()}
            </div>
        </div>
    );
}