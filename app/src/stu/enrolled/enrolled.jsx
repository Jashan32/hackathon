import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    BookOpen, 
    Play, 
    Clock, 
    CheckCircle, 
    Users, 
    Calendar,
    Award,
    BarChart3,
    FileText,
    Download,
    MessageSquare,
    Star,
    TrendingUp,
    Target,
    Bookmark,
    Filter,
    Search,
    Grid3X3,
    List,
    MoreVertical,
    Eye,
    Archive
} from 'lucide-react';

export default function Enrolled() {
    const navigate = useNavigate();
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [progressFilter, setProgressFilter] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('recent'); // recent, progress, name
    const [filteredCourses, setFilteredCourses] = useState([]);

    const categories = [
        { id: 'all', name: 'All Courses' },
        { id: 'programming', name: 'Programming' },
        { id: 'design', name: 'Design' },
        { id: 'business', name: 'Business' },
        { id: 'marketing', name: 'Marketing' },
        { id: 'data-science', name: 'Data Science' },
        { id: 'technology', name: 'Technology' }
    ];

    const progressFilters = [
        { id: 'all', name: 'All Progress' },
        { id: 'not-started', name: 'Not Started' },
        { id: 'in-progress', name: 'In Progress' },
        { id: 'completed', name: 'Completed' }
    ];

    useEffect(() => {
        fetchEnrolledCourses();
    }, []);

    useEffect(() => {
        filterAndSortCourses();
    }, [enrolledCourses, searchTerm, selectedCategory, progressFilter, sortBy]);

    const fetchEnrolledCourses = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/api/courses/student/enrolled', {
                headers: {
                    'authorization': localStorage.getItem('token')
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Add mock progress data since it's not in the backend yet
                const coursesWithProgress = data.courses.map(course => ({
                    ...course,
                    progress: Math.floor(Math.random() * 100),
                    totalLectures: Math.floor(Math.random() * 20) + 5,
                    completedLectures: Math.floor(Math.random() * 15),
                    lastAccessed: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                    timeSpent: Math.floor(Math.random() * 50) + 5, // hours
                    certificateEarned: Math.random() > 0.7
                }));
                setEnrolledCourses(coursesWithProgress);
            }
        } catch (error) {
            console.error('Failed to fetch enrolled courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortCourses = () => {
        let filtered = [...enrolledCourses];

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(course =>
                course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(course => course.category === selectedCategory);
        }

        // Filter by progress
        if (progressFilter !== 'all') {
            filtered = filtered.filter(course => {
                if (progressFilter === 'not-started') return course.progress === 0;
                if (progressFilter === 'in-progress') return course.progress > 0 && course.progress < 100;
                if (progressFilter === 'completed') return course.progress === 100;
                return true;
            });
        }

        // Sort courses
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'recent':
                    return new Date(b.lastAccessed) - new Date(a.lastAccessed);
                case 'progress':
                    return b.progress - a.progress;
                case 'name':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });

        setFilteredCourses(filtered);
    };

    const getProgressStatus = (progress) => {
        if (progress === 0) return { label: 'Not Started', color: 'text-gray-400' };
        if (progress === 100) return { label: 'Completed', color: 'text-green-400' };
        return { label: 'In Progress', color: 'text-yellow-400' };
    };

    const getProgressColor = (progress) => {
        if (progress < 30) return 'bg-red-500';
        if (progress < 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const totalProgress = enrolledCourses.length > 0 
        ? Math.round(enrolledCourses.reduce((sum, course) => sum + course.progress, 0) / enrolledCourses.length)
        : 0;

    const completedCourses = enrolledCourses.filter(course => course.progress === 100).length;
    const inProgressCourses = enrolledCourses.filter(course => course.progress > 0 && course.progress < 100).length;
    const totalTimeSpent = enrolledCourses.reduce((sum, course) => sum + (course.timeSpent || 0), 0);

    if (loading) {
        return (
            <div className="px-[60px] pt-[45px] pb-[30px] min-h-screen bg-[#0d0d0d]">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e43b58]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="px-[60px] pt-[45px] pb-[30px] min-h-screen bg-[#0d0d0d]">
            {/* Header */}
            <div className="flex justify-between items-start mb-[40px]">
                <div>
                    <h1 className="text-white text-[32px] font-semibold mb-[8px]">My Enrolled Courses</h1>
                    <p className="text-[#888888] text-[16px]">
                        Continue your learning journey with {enrolledCourses.length} enrolled course{enrolledCourses.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div className="flex items-center gap-[12px]">
                    <button
                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                        className="w-[40px] h-[40px] bg-[#1d1d1d] hover:bg-[#383838] border border-white/10 rounded-[8px] flex items-center justify-center transition-colors cursor-pointer"
                    >
                        {viewMode === 'grid' ? 
                            <List className="size-[20px] text-white" /> : 
                            <Grid3X3 className="size-[20px] text-white" />
                        }
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            {enrolledCourses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-[20px] mb-[40px]">
                    <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[20px]">
                        <div className="flex items-center gap-[12px]">
                            <div className="w-[40px] h-[40px] bg-blue-500/20 rounded-[8px] flex items-center justify-center">
                                <BookOpen className="size-[20px] text-blue-500" />
                            </div>
                            <div>
                                <p className="text-[#888888] text-[14px]">Total Courses</p>
                                <p className="text-white text-[24px] font-semibold">{enrolledCourses.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[20px]">
                        <div className="flex items-center gap-[12px]">
                            <div className="w-[40px] h-[40px] bg-green-500/20 rounded-[8px] flex items-center justify-center">
                                <CheckCircle className="size-[20px] text-green-500" />
                            </div>
                            <div>
                                <p className="text-[#888888] text-[14px]">Completed</p>
                                <p className="text-white text-[24px] font-semibold">{completedCourses}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[20px]">
                        <div className="flex items-center gap-[12px]">
                            <div className="w-[40px] h-[40px] bg-yellow-500/20 rounded-[8px] flex items-center justify-center">
                                <TrendingUp className="size-[20px] text-yellow-500" />
                            </div>
                            <div>
                                <p className="text-[#888888] text-[14px]">In Progress</p>
                                <p className="text-white text-[24px] font-semibold">{inProgressCourses}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[20px]">
                        <div className="flex items-center gap-[12px]">
                            <div className="w-[40px] h-[40px] bg-purple-500/20 rounded-[8px] flex items-center justify-center">
                                <Clock className="size-[20px] text-purple-500" />
                            </div>
                            <div>
                                <p className="text-[#888888] text-[14px]">Hours Spent</p>
                                <p className="text-white text-[24px] font-semibold">{totalTimeSpent}h</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Overall Progress */}
            {enrolledCourses.length > 0 && (
                <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px] mb-[32px]">
                    <div className="flex items-center justify-between mb-[16px]">
                        <div>
                            <h3 className="text-white text-[18px] font-semibold mb-[4px]">Overall Progress</h3>
                            <p className="text-[#888888] text-[14px]">Your learning progress across all courses</p>
                        </div>
                        <div className="text-right">
                            <p className="text-white text-[24px] font-semibold">{totalProgress}%</p>
                            <p className="text-[#888888] text-[12px]">Average completion</p>
                        </div>
                    </div>
                    <div className="w-full bg-[#383838] rounded-full h-[8px] overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-300 ${getProgressColor(totalProgress)}`}
                            style={{ width: `${totalProgress}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Search and Filters */}
            <div className="flex flex-col gap-[16px] mb-[32px]">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-[16px] top-1/2 transform -translate-y-1/2 size-[20px] text-[#888888]" />
                    <input
                        type="text"
                        placeholder="Search your enrolled courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#1d1d1d] border border-white/10 rounded-[12px] pl-[52px] pr-[20px] py-[14px] text-white placeholder-[#888888] focus:border-[#e43b58] focus:outline-none transition-colors"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-[12px]">
                    {/* Category Filter */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-[#1d1d1d] border border-white/10 rounded-[8px] px-[12px] py-[8px] text-white text-[14px] focus:border-[#e43b58] focus:outline-none"
                    >
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                    </select>

                    {/* Progress Filter */}
                    <select
                        value={progressFilter}
                        onChange={(e) => setProgressFilter(e.target.value)}
                        className="bg-[#1d1d1d] border border-white/10 rounded-[8px] px-[12px] py-[8px] text-white text-[14px] focus:border-[#e43b58] focus:outline-none"
                    >
                        {progressFilters.map(filter => (
                            <option key={filter.id} value={filter.id}>{filter.name}</option>
                        ))}
                    </select>

                    {/* Sort By */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-[#1d1d1d] border border-white/10 rounded-[8px] px-[12px] py-[8px] text-white text-[14px] focus:border-[#e43b58] focus:outline-none"
                    >
                        <option value="recent">Recently Accessed</option>
                        <option value="progress">Progress</option>
                        <option value="name">Course Name</option>
                    </select>
                </div>
            </div>

            {/* Courses List */}
            {filteredCourses.length > 0 ? (
                <div className={viewMode === 'grid' ? 
                    'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]' : 
                    'space-y-[16px]'
                }>
                    {filteredCourses.map(course => (
                        <EnrolledCourseCard 
                            key={course._id}
                            course={course}
                            viewMode={viewMode}
                            navigate={navigate}
                            getProgressStatus={getProgressStatus}
                            getProgressColor={getProgressColor}
                        />
                    ))}
                </div>
            ) : enrolledCourses.length === 0 ? (
                <div className="text-center py-[80px]">
                    <BookOpen className="size-[64px] text-[#888888] mx-auto mb-[24px]" />
                    <h3 className="text-white text-[24px] font-semibold mb-[8px]">No enrolled courses yet</h3>
                    <p className="text-[#888888] text-[16px] mb-[24px]">
                        Start your learning journey by enrolling in courses that interest you
                    </p>
                    <button 
                        onClick={() => navigate('/dashboard/stu/courses')}
                        className="bg-[#e43b58] hover:bg-[#c73650] text-white px-[24px] py-[12px] rounded-[8px] transition-colors cursor-pointer"
                    >
                        Browse Courses
                    </button>
                </div>
            ) : (
                <div className="text-center py-[80px]">
                    <Search className="size-[64px] text-[#888888] mx-auto mb-[24px]" />
                    <h3 className="text-white text-[24px] font-semibold mb-[8px]">No courses found</h3>
                    <p className="text-[#888888] text-[16px] mb-[24px]">
                        Try adjusting your search or filter criteria
                    </p>
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setSelectedCategory('all');
                            setProgressFilter('all');
                        }}
                        className="bg-[#e43b58] hover:bg-[#c73650] text-white px-[20px] py-[12px] rounded-[8px] transition-colors cursor-pointer"
                    >
                        Clear Filters
                    </button>
                </div>
            )}
        </div>
    );
}

function EnrolledCourseCard({ course, viewMode, navigate, getProgressStatus, getProgressColor }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const progressStatus = getProgressStatus(course.progress);

    const handleContinueLearning = () => {
        // Navigate to course detail view where they can access content
        navigate(`/dashboard/stu/enrolled/${course._id}`);
    };

    const handleViewCertificate = () => {
        // Navigate to certificate view - for now, go to course detail
        navigate(`/dashboard/stu/enrolled/${course._id}`);
    };

    if (viewMode === 'list') {
        return (
            <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[20px] hover:border-white/20 transition-colors cursor-pointer"
                 onClick={() => navigate(`/dashboard/stu/enrolled/${course._id}`)}>
                <div className="flex gap-[20px]">
                    {/* Thumbnail */}
                    <div className="w-[120px] h-[80px] bg-[#383838] rounded-[8px] flex-shrink-0 overflow-hidden">
                        {course.thumbnail ? (
                            <img 
                                src={course.thumbnail} 
                                alt={course.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Play className="size-[32px] text-[#888888]" />
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <div className="flex items-start justify-between mb-[12px]">
                            <div className="flex-1">
                                <h3 className="text-white text-[18px] font-semibold mb-[4px] hover:text-[#e43b58] transition-colors">{course.title}</h3>
                                <div className="flex items-center gap-[16px] text-[12px] mb-[8px]">
                                    <span className="text-[#888888]">
                                        By {course.educator.firstName} {course.educator.lastName}
                                    </span>
                                    <span className={`px-[8px] py-[2px] rounded-[4px] ${progressStatus.color} bg-current/20`}>
                                        {progressStatus.label}
                                    </span>
                                    {course.certificateEarned && (
                                        <span className="text-yellow-400">
                                            <Award className="size-[12px] inline mr-[4px]" />
                                            Certificate Earned
                                        </span>
                                    )}
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-[8px]">
                                    <div className="flex items-center justify-between text-[12px] mb-[4px]">
                                        <span className="text-[#888888]">Progress</span>
                                        <span className="text-white">{course.progress}%</span>
                                    </div>
                                    <div className="w-full bg-[#383838] rounded-full h-[6px] overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-300 ${getProgressColor(course.progress)}`}
                                            style={{ width: `${course.progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-[16px] text-[12px] text-[#888888]">
                                    <span>{course.completedLectures}/{course.totalLectures} lectures</span>
                                    <span>{course.timeSpent}h spent</span>
                                    <span>Last accessed {course.lastAccessed.toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-[8px]" onClick={(e) => e.stopPropagation()}>
                                {course.certificateEarned && (
                                    <button
                                        onClick={handleViewCertificate}
                                        className="bg-yellow-500/20 text-yellow-400 px-[12px] py-[6px] rounded-[6px] text-[12px] hover:bg-yellow-500/30 transition-colors cursor-pointer"
                                    >
                                        View Certificate
                                    </button>
                                )}
                                <button
                                    onClick={handleContinueLearning}
                                    className="bg-[#e43b58] hover:bg-[#c73650] text-white px-[16px] py-[8px] rounded-[6px] text-[14px] transition-colors cursor-pointer"
                                >
                                    {course.progress === 0 ? 'Start Learning' : 'Continue Learning'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] overflow-hidden hover:border-white/20 transition-colors cursor-pointer"
             onClick={() => navigate(`/dashboard/stu/enrolled/${course._id}`)}>
            {/* Thumbnail */}
            <div className="relative h-[160px] bg-[#383838] overflow-hidden">
                {course.thumbnail ? (
                    <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Play className="size-[48px] text-[#888888]" />
                    </div>
                )}
                
                {/* Progress Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-[12px]">
                    <div className="flex items-center justify-between text-[12px] mb-[4px]">
                        <span className="text-white font-medium">{course.progress}% Complete</span>
                        <span className={progressStatus.color}>{progressStatus.label}</span>
                    </div>
                    <div className="w-full bg-black/40 rounded-full h-[4px] overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-300 ${getProgressColor(course.progress)}`}
                            style={{ width: `${course.progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Certificate Badge */}
                {course.certificateEarned && (
                    <div className="absolute top-[12px] right-[12px] bg-yellow-500/20 backdrop-blur-sm rounded-[6px] px-[8px] py-[4px]">
                        <Award className="size-[16px] text-yellow-400" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-[20px]">
                <div className="mb-[12px]">
                    <h3 className="text-white text-[16px] font-semibold mb-[8px] line-clamp-2 hover:text-[#e43b58] transition-colors">
                        {course.title}
                    </h3>
                    <p className="text-[#888888] text-[12px] mb-[8px]">
                        By {course.educator.firstName} {course.educator.lastName}
                    </p>
                </div>

                <div className="flex items-center justify-between text-[12px] text-[#888888] mb-[16px]">
                    <span>{course.completedLectures}/{course.totalLectures} lectures</span>
                    <span>{course.timeSpent}h spent</span>
                </div>

                <div className="flex gap-[8px]" onClick={(e) => e.stopPropagation()}>
                    {course.certificateEarned && (
                        <button
                            onClick={handleViewCertificate}
                            className="flex-1 bg-yellow-500/20 text-yellow-400 py-[8px] rounded-[6px] text-[12px] hover:bg-yellow-500/30 transition-colors cursor-pointer"
                        >
                            Certificate
                        </button>
                    )}
                    <button
                        onClick={handleContinueLearning}
                        className={`${course.certificateEarned ? 'flex-1' : 'w-full'} bg-[#e43b58] hover:bg-[#c73650] text-white py-[8px] rounded-[6px] text-[14px] transition-colors cursor-pointer`}
                    >
                        {course.progress === 0 ? 'Start' : 'Continue'}
                    </button>
                </div>
            </div>
        </div>
    );
}