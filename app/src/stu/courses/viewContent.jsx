import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft,
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    Maximize,
    CheckCircle,
    Circle,
    Lock,
    FileText,
    Video,
    Download,
    BookOpen,
    MessageSquare,
    Star,
    Clock,
    Users,
    Award,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    Settings,
    Bookmark,
    Share2,
    MoreVertical,
    Eye,
    EyeOff
} from 'lucide-react';

export default function ViewContent() {
    const { courseId, lectureId } = useParams();
    const navigate = useNavigate();
    
    const [course, setCourse] = useState(null);
    const [currentLecture, setCurrentLecture] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [lectureProgress, setLectureProgress] = useState({});
    const [notes, setNotes] = useState('');
    const [showNotes, setShowNotes] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    // Mock course data - Replace with API call
    const mockCourse = {
        _id: courseId,
        title: "Advanced React Development",
        description: "Master advanced React concepts and build professional applications",
        educator: {
            firstName: "John",
            lastName: "Doe",
            avatar: null
        },
        curriculum: [
            {
                _id: "section1",
                title: "Getting Started",
                lectures: [
                    {
                        _id: "lec1",
                        title: "Introduction to Advanced React",
                        duration: "15:30",
                        type: "video",
                        videoUrl: "https://example.com/video1.mp4",
                        completed: true,
                        locked: false
                    },
                    {
                        _id: "lec2", 
                        title: "Setting Up Development Environment",
                        duration: "12:45",
                        type: "video",
                        videoUrl: "https://example.com/video2.mp4",
                        completed: true,
                        locked: false
                    }
                ]
            },
            {
                _id: "section2",
                title: "Advanced Hooks",
                lectures: [
                    {
                        _id: "lec3",
                        title: "Custom Hooks Deep Dive",
                        duration: "22:15",
                        type: "video", 
                        videoUrl: "https://example.com/video3.mp4",
                        completed: false,
                        locked: false
                    },
                    {
                        _id: "lec4",
                        title: "useReducer vs useState",
                        duration: "18:30",
                        type: "video",
                        videoUrl: "https://example.com/video4.mp4",
                        completed: false,
                        locked: false
                    }
                ]
            }
        ]
    };

    useEffect(() => {
        fetchCourseContent();
    }, [courseId]);

    useEffect(() => {
        if (lectureId && course) {
            const lecture = findLectureById(lectureId);
            setCurrentLecture(lecture);
        } else if (course && course.curriculum.length > 0) {
            // Default to first lecture
            const firstLecture = course.curriculum[0].lectures[0];
            setCurrentLecture(firstLecture);
            navigate(`/dashboard/stu/courses/${courseId}/content/${firstLecture._id}`, { replace: true });
        }
    }, [lectureId, course, courseId, navigate]);

    const fetchCourseContent = async () => {
        try {
            setLoading(true);
            // Replace with actual API call
            // const response = await fetch(`http://localhost:3000/api/courses/${courseId}/content`);
            // const data = await response.json();
            setCourse(mockCourse);
        } catch (error) {
            console.error('Failed to fetch course content:', error);
        } finally {
            setLoading(false);
        }
    };

    const findLectureById = (id) => {
        for (const section of course.curriculum) {
            for (const lecture of section.lectures) {
                if (lecture._id === id) {
                    return lecture;
                }
            }
        }
        return null;
    };

    const getAllLectures = () => {
        if (!course) return [];
        return course.curriculum.flatMap(section => section.lectures);
    };

    const getCurrentLectureIndex = () => {
        const allLectures = getAllLectures();
        return allLectures.findIndex(lecture => lecture._id === currentLecture?._id);
    };

    const goToNextLecture = () => {
        const allLectures = getAllLectures();
        const currentIndex = getCurrentLectureIndex();
        if (currentIndex < allLectures.length - 1) {
            const nextLecture = allLectures[currentIndex + 1];
            navigate(`/dashboard/stu/courses/${courseId}/content/${nextLecture._id}`);
        }
    };

    const goToPreviousLecture = () => {
        const allLectures = getAllLectures();
        const currentIndex = getCurrentLectureIndex();
        if (currentIndex > 0) {
            const prevLecture = allLectures[currentIndex - 1];
            navigate(`/dashboard/stu/courses/${courseId}/content/${prevLecture._id}`);
        }
    };

    const markLectureComplete = () => {
        // Update lecture completion status
        setLectureProgress(prev => ({
            ...prev,
            [currentLecture._id]: { completed: true, progress: 100 }
        }));
    };

    const getCompletedLectures = () => {
        return getAllLectures().filter(lecture => 
            lecture.completed || lectureProgress[lecture._id]?.completed
        ).length;
    };

    const getTotalLectures = () => {
        return getAllLectures().length;
    };

    const getCourseProgress = () => {
        const total = getTotalLectures();
        const completed = getCompletedLectures();
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    };

    if (loading) {
        return (
            <div className="h-screen bg-[#0d0d0d] flex items-center justify-center">
                <div className="text-white">Loading course content...</div>
            </div>
        );
    }

    if (!course || !currentLecture) {
        return (
            <div className="h-screen bg-[#0d0d0d] flex items-center justify-center">
                <div className="text-white">Course content not found</div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-[#0d0d0d] flex flex-col">
            {/* Header */}
            <div className="bg-[#1d1d1d] border-b border-white/10 px-[24px] py-[16px] flex items-center justify-between">
                <div className="flex items-center gap-[16px]">
                    <button
                        onClick={() => navigate(`/dashboard/stu/courses/${courseId}`)}
                        className="w-[40px] h-[40px] bg-[#383838] hover:bg-[#4a4a4a] rounded-[8px] flex items-center justify-center transition-colors"
                    >
                        <ArrowLeft className="size-[20px] text-white" />
                    </button>
                    <div>
                        <h1 className="text-white text-[18px] font-semibold">{course.title}</h1>
                        <p className="text-[#888888] text-[14px]">
                            {getCompletedLectures()}/{getTotalLectures()} lectures completed • {getCourseProgress()}% complete
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-[12px]">
                    <button
                        onClick={() => setBookmarked(!bookmarked)}
                        className={`w-[40px] h-[40px] rounded-[8px] flex items-center justify-center transition-colors ${
                            bookmarked ? 'bg-[#e43b58] text-white' : 'bg-[#383838] hover:bg-[#4a4a4a] text-[#888888]'
                        }`}
                    >
                        <Bookmark className="size-[18px]" />
                    </button>
                    <button className="w-[40px] h-[40px] bg-[#383838] hover:bg-[#4a4a4a] rounded-[8px] flex items-center justify-center transition-colors">
                        <Share2 className="size-[18px] text-[#888888]" />
                    </button>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-[40px] h-[40px] bg-[#383838] hover:bg-[#4a4a4a] rounded-[8px] flex items-center justify-center transition-colors"
                    >
                        {sidebarOpen ? <EyeOff className="size-[18px] text-[#888888]" /> : <Eye className="size-[18px] text-[#888888]" />}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex">
                {/* Main Content */}
                <div className={`flex-1 flex flex-col ${sidebarOpen ? 'mr-[400px]' : ''}`}>
                    {/* Video Player */}
                    <div className="bg-black aspect-video flex items-center justify-center relative">
                        <div className="text-white text-center">
                            <Video className="size-[64px] mx-auto mb-[16px] text-[#888888]" />
                            <h3 className="text-[20px] font-semibold mb-[8px]">{currentLecture.title}</h3>
                            <p className="text-[#888888] mb-[16px]">Duration: {currentLecture.duration}</p>
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="bg-[#e43b58] hover:bg-[#c73650] text-white px-[24px] py-[12px] rounded-[8px] flex items-center gap-[8px] mx-auto transition-colors"
                            >
                                {isPlaying ? <Pause className="size-[20px]" /> : <Play className="size-[20px]" />}
                                {isPlaying ? 'Pause' : 'Play'}
                            </button>
                        </div>

                        {/* Video Controls */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-[16px]">
                            <div className="flex items-center gap-[12px] text-white">
                                <button onClick={goToPreviousLecture} disabled={getCurrentLectureIndex() === 0}>
                                    <SkipBack className="size-[20px]" />
                                </button>
                                <button onClick={() => setIsPlaying(!isPlaying)}>
                                    {isPlaying ? <Pause className="size-[24px]" /> : <Play className="size-[24px]" />}
                                </button>
                                <button onClick={goToNextLecture} disabled={getCurrentLectureIndex() === getAllLectures().length - 1}>
                                    <SkipForward className="size-[20px]" />
                                </button>
                                <div className="flex-1 mx-[16px]">
                                    <div className="h-[4px] bg-white/20 rounded-full">
                                        <div className="h-full bg-[#e43b58] rounded-full" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                                <span className="text-[14px]">0:00 / {currentLecture.duration}</span>
                            </div>
                        </div>
                    </div>

                    {/* Lecture Navigation */}
                    <div className="bg-[#1d1d1d] border-t border-white/10 px-[24px] py-[16px] flex items-center justify-between">
                        <button
                            onClick={goToPreviousLecture}
                            disabled={getCurrentLectureIndex() === 0}
                            className="flex items-center gap-[8px] px-[16px] py-[8px] bg-[#383838] hover:bg-[#4a4a4a] disabled:opacity-50 disabled:cursor-not-allowed rounded-[6px] text-white transition-colors"
                        >
                            <ChevronLeft className="size-[16px]" />
                            Previous
                        </button>

                        <button
                            onClick={markLectureComplete}
                            className="flex items-center gap-[8px] px-[16px] py-[8px] bg-green-500 hover:bg-green-600 rounded-[6px] text-white transition-colors"
                        >
                            <CheckCircle className="size-[16px]" />
                            Mark Complete
                        </button>

                        <button
                            onClick={goToNextLecture}
                            disabled={getCurrentLectureIndex() === getAllLectures().length - 1}
                            className="flex items-center gap-[8px] px-[16px] py-[8px] bg-[#383838] hover:bg-[#4a4a4a] disabled:opacity-50 disabled:cursor-not-allowed rounded-[6px] text-white transition-colors"
                        >
                            Next
                            <ChevronRight className="size-[16px]" />
                        </button>
                    </div>

                    {/* Notes Section */}
                    <div className="flex-1 bg-[#1d1d1d] p-[24px]">
                        <div className="flex items-center justify-between mb-[16px]">
                            <h3 className="text-white text-[18px] font-semibold">Lecture Notes</h3>
                            <button
                                onClick={() => setShowNotes(!showNotes)}
                                className="text-[#e43b58] text-[14px] hover:underline"
                            >
                                {showNotes ? 'Hide Notes' : 'Show Notes'}
                            </button>
                        </div>

                        {showNotes && (
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Take notes about this lecture..."
                                className="w-full h-[200px] bg-[#383838] text-white border border-white/10 rounded-[8px] p-[16px] resize-none focus:outline-none focus:border-[#e43b58]"
                            />
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                {sidebarOpen && (
                    <div className="w-[400px] bg-[#1d1d1d] border-l border-white/10 flex flex-col absolute right-0 top-[72px] bottom-0">
                        <div className="p-[24px] border-b border-white/10">
                            <h3 className="text-white text-[18px] font-semibold mb-[8px]">Course Progress</h3>
                            <div className="flex items-center gap-[12px] mb-[16px]">
                                <div className="flex-1 h-[8px] bg-[#383838] rounded-full">
                                    <div className="h-full bg-[#e43b58] rounded-full" style={{ width: `${getCourseProgress()}%` }}></div>
                                </div>
                                <span className="text-[#888888] text-[14px]">{getCourseProgress()}%</span>
                            </div>
                            <p className="text-[#888888] text-[14px]">
                                {getCompletedLectures()} of {getTotalLectures()} lectures completed
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {course.curriculum.map((section, sectionIndex) => (
                                <div key={section._id} className="border-b border-white/10">
                                    <div className="p-[16px] bg-[#383838]">
                                        <h4 className="text-white text-[16px] font-medium">
                                            {sectionIndex + 1}. {section.title}
                                        </h4>
                                    </div>
                                    <div>
                                        {section.lectures.map((lecture, lectureIndex) => (
                                            <button
                                                key={lecture._id}
                                                onClick={() => navigate(`/dashboard/stu/courses/${courseId}/content/${lecture._id}`)}
                                                className={`w-full p-[16px] text-left hover:bg-[#383838] border-b border-white/5 transition-colors ${
                                                    currentLecture._id === lecture._id ? 'bg-[#383838] border-l-4 border-l-[#e43b58]' : ''
                                                }`}
                                            >
                                                <div className="flex items-center gap-[12px]">
                                                    <div className="w-[24px] h-[24px] flex items-center justify-center">
                                                        {lecture.completed || lectureProgress[lecture._id]?.completed ? (
                                                            <CheckCircle className="size-[20px] text-green-500" />
                                                        ) : lecture.locked ? (
                                                            <Lock className="size-[16px] text-[#888888]" />
                                                        ) : (
                                                            <Circle className="size-[16px] text-[#888888]" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-white text-[14px] font-medium mb-[4px]">
                                                            {lectureIndex + 1}. {lecture.title}
                                                        </p>
                                                        <div className="flex items-center gap-[8px] text-[12px] text-[#888888]">
                                                            <Video className="size-[12px]" />
                                                            <span>{lecture.duration}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}