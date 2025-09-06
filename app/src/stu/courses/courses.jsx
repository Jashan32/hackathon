import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    BookOpen, 
    Users, 
    Clock, 
    Star, 
    Filter, 
    Search, 
    Grid3X3, 
    List,
    TrendingUp,
    Award,
    PlayCircle,
    User,
    DollarSign,
    ChevronDown,
    Heart,
    Share2,
    Plus
} from 'lucide-react';

export default function StuCourses() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [showFilters, setShowFilters] = useState(false);
    const [enrolledCourses, setEnrolledCourses] = useState([]);

    const categories = [
        { id: 'all', name: 'All Courses', icon: BookOpen },
        { id: 'programming', name: 'Programming', icon: BookOpen },
        { id: 'design', name: 'Design', icon: BookOpen },
        { id: 'business', name: 'Business', icon: TrendingUp },
        { id: 'marketing', name: 'Marketing', icon: TrendingUp },
        { id: 'data-science', name: 'Data Science', icon: Award },
        { id: 'technology', name: 'Technology', icon: BookOpen }
    ];

    const difficulties = [
        { id: 'all', name: 'All Levels' },
        { id: 'beginner', name: 'Beginner' },
        { id: 'intermediate', name: 'Intermediate' },
        { id: 'advanced', name: 'Advanced' }
    ];

    useEffect(() => {
        fetchCourses();
        fetchEnrolledCourses();
    }, []);

    useEffect(() => {
        filterCourses();
    }, [courses, selectedCategory, selectedDifficulty, searchTerm]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/api/courses/');
            if (response.ok) {
                const data = await response.json();
                setCourses(data.courses);
            }
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEnrolledCourses = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/courses/student/enrolled', {
                headers: {
                    'authorization': localStorage.getItem('token')
                }
            });
            if (response.ok) {
                const data = await response.json();
                setEnrolledCourses(data.courses.map(course => course._id));
            }
        } catch (error) {
            console.error('Failed to fetch enrolled courses:', error);
        }
    };

    const filterCourses = () => {
        let filtered = [...courses];

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(course => course.category === selectedCategory);
        }

        // Filter by difficulty
        if (selectedDifficulty !== 'all') {
            filtered = filtered.filter(course => course.difficulty === selectedDifficulty);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(course =>
                course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredCourses(filtered);
    };

    const handleEnroll = async (courseId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/courses/${courseId}/enroll`, {
                method: 'POST',
                headers: {
                    'authorization': localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setEnrolledCourses([...enrolledCourses, courseId]);
                // Show success message or refresh
            } else {
                const errorData = await response.json();
                console.error('Enrollment failed:', errorData.error);
            }
        } catch (error) {
            console.error('Enrollment error:', error);
        }
    };

    const handleViewCourse = (courseId) => {
        navigate(`/dashboard/stu/courses/view/${courseId}`);
    };

    const isEnrolled = (courseId) => enrolledCourses.includes(courseId);

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'beginner': return 'text-green-400 bg-green-400/20';
            case 'intermediate': return 'text-yellow-400 bg-yellow-400/20';
            case 'advanced': return 'text-red-400 bg-red-400/20';
            default: return 'text-gray-400 bg-gray-400/20';
        }
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

    return (
        <div className="px-[60px] pt-[45px] pb-[30px] min-h-screen bg-[#0d0d0d]">
            {/* Header */}
            <div className="flex justify-between items-start mb-[40px]">
                <div>
                    <h1 className="text-white text-[32px] font-semibold mb-[8px]">Discover Courses</h1>
                    <p className="text-[#888888] text-[16px]">
                        Explore {courses.length} courses across various categories and skill levels
                    </p>
                </div>
                <div className="flex items-center gap-[12px]">
                    <button
                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                        className="w-[40px] h-[40px] bg-[#1d1d1d] hover:bg-[#383838] border border-white/10 rounded-[8px] flex items-center justify-center transition-colors"
                    >
                        {viewMode === 'grid' ? 
                            <List className="size-[20px] text-white" /> : 
                            <Grid3X3 className="size-[20px] text-white" />
                        }
                    </button>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-[8px] bg-[#1d1d1d] hover:bg-[#383838] border border-white/10 text-white px-[16px] py-[12px] rounded-[8px] transition-colors"
                    >
                        <Filter className="size-[16px]" />
                        Filters
                        <ChevronDown className={`size-[16px] transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-[32px]">
                <Search className="absolute left-[16px] top-1/2 transform -translate-y-1/2 size-[20px] text-[#888888]" />
                <input
                    type="text"
                    placeholder="Search courses, topics, instructors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#1d1d1d] border border-white/10 rounded-[12px] pl-[52px] pr-[20px] py-[16px] text-white placeholder-[#888888] focus:border-[#e43b58] focus:outline-none transition-colors"
                />
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px] mb-[32px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                        {/* Categories */}
                        <div>
                            <h3 className="text-white text-[16px] font-semibold mb-[12px]">Categories</h3>
                            <div className="flex flex-wrap gap-[8px]">
                                {categories.map(category => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`flex items-center gap-[6px] px-[12px] py-[6px] rounded-[6px] text-[14px] transition-colors ${
                                            selectedCategory === category.id
                                                ? 'bg-[#e43b58] text-white'
                                                : 'bg-[#383838] text-[#888888] hover:text-white hover:bg-[#4a4a4a]'
                                        }`}
                                    >
                                        <category.icon className="size-[14px]" />
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Difficulty */}
                        <div>
                            <h3 className="text-white text-[16px] font-semibold mb-[12px]">Difficulty Level</h3>
                            <div className="flex flex-wrap gap-[8px]">
                                {difficulties.map(difficulty => (
                                    <button
                                        key={difficulty.id}
                                        onClick={() => setSelectedDifficulty(difficulty.id)}
                                        className={`px-[12px] py-[6px] rounded-[6px] text-[14px] transition-colors ${
                                            selectedDifficulty === difficulty.id
                                                ? 'bg-[#e43b58] text-white'
                                                : 'bg-[#383838] text-[#888888] hover:text-white hover:bg-[#4a4a4a]'
                                        }`}
                                    >
                                        {difficulty.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Results Header */}
            <div className="flex items-center justify-between mb-[24px]">
                <p className="text-[#888888] text-[14px]">
                    Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
                    {selectedCategory !== 'all' && (
                        <span> in {categories.find(c => c.id === selectedCategory)?.name}</span>
                    )}
                    {selectedDifficulty !== 'all' && (
                        <span> • {difficulties.find(d => d.id === selectedDifficulty)?.name} level</span>
                    )}
                </p>
                {(selectedCategory !== 'all' || selectedDifficulty !== 'all' || searchTerm) && (
                    <button
                        onClick={() => {
                            setSelectedCategory('all');
                            setSelectedDifficulty('all');
                            setSearchTerm('');
                        }}
                        className="text-[#e43b58] text-[14px] hover:text-[#c73650] transition-colors"
                    >
                        Clear all filters
                    </button>
                )}
            </div>

            {/* Courses Grid/List */}
            {filteredCourses.length > 0 ? (
                <div className={viewMode === 'grid' ? 
                    'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]' : 
                    'space-y-[16px]'
                }>
                    {filteredCourses.map(course => (
                        <CourseCard 
                            key={course._id}
                            course={course}
                            viewMode={viewMode}
                            isEnrolled={isEnrolled(course._id)}
                            onEnroll={() => handleEnroll(course._id)}
                            onViewCourse={() => handleViewCourse(course._id)}
                            getDifficultyColor={getDifficultyColor}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-[80px]">
                    <BookOpen className="size-[64px] text-[#888888] mx-auto mb-[24px]" />
                    <h3 className="text-white text-[24px] font-semibold mb-[8px]">No courses found</h3>
                    <p className="text-[#888888] text-[16px] mb-[24px]">
                        {searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all'
                            ? 'Try adjusting your search or filter criteria'
                            : 'No courses are available at the moment'
                        }
                    </p>
                    {(selectedCategory !== 'all' || selectedDifficulty !== 'all' || searchTerm) && (
                        <button
                            onClick={() => {
                                setSelectedCategory('all');
                                setSelectedDifficulty('all');
                                setSearchTerm('');
                            }}
                            className="bg-[#e43b58] hover:bg-[#c73650] text-white px-[20px] py-[12px] rounded-[8px] transition-colors"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

function CourseCard({ course, viewMode, isEnrolled, onEnroll, onViewCourse, getDifficultyColor }) {
    const [liked, setLiked] = useState(false);

    if (viewMode === 'list') {
        return (
            <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[20px] hover:border-white/20 transition-colors">
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
                                <PlayCircle className="size-[32px] text-[#888888]" />
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <div className="flex items-start justify-between mb-[8px]">
                            <div>
                                <h3 className="text-white text-[18px] font-semibold mb-[4px] line-clamp-1">
                                    {course.title}
                                </h3>
                                <p className="text-[#888888] text-[14px] line-clamp-2 mb-[8px]">
                                    {course.description}
                                </p>
                            </div>
                            <div className="flex items-center gap-[8px]">
                                <button
                                    onClick={() => setLiked(!liked)}
                                    className={`w-[32px] h-[32px] rounded-[6px] flex items-center justify-center transition-colors ${
                                        liked ? 'bg-red-500/20 text-red-400' : 'bg-[#383838] text-[#888888] hover:text-white'
                                    }`}
                                >
                                    <Heart className={`size-[16px] ${liked ? 'fill-current' : ''}`} />
                                </button>
                                <button className="w-[32px] h-[32px] bg-[#383838] hover:bg-[#4a4a4a] rounded-[6px] flex items-center justify-center transition-colors">
                                    <Share2 className="size-[16px] text-[#888888] hover:text-white" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-[16px] text-[12px]">
                                <div className="flex items-center gap-[4px]">
                                    <User className="size-[14px] text-[#888888]" />
                                    <span className="text-[#888888]">
                                        {course.educator.firstName} {course.educator.lastName}
                                    </span>
                                </div>
                                <div className="flex items-center gap-[4px]">
                                    <Users className="size-[14px] text-[#888888]" />
                                    <span className="text-[#888888]">
                                        {course.enrolledStudents?.length || 0} students
                                    </span>
                                </div>
                                <div className={`px-[8px] py-[2px] rounded-[4px] text-[10px] font-medium ${getDifficultyColor(course.difficulty)}`}>
                                    {course.difficulty}
                                </div>
                            </div>

                            <div className="flex items-center gap-[12px]">
                                <div className="text-right">
                                    <p className="text-white text-[18px] font-semibold">${course.price}</p>
                                </div>
                                <button
                                    onClick={onViewCourse}
                                    className="px-[16px] py-[8px] rounded-[6px] text-[14px] font-medium bg-[#7848ff] hover:bg-[#593cbc] text-white transition-colors"
                                >
                                    View Course
                                </button>
                                <button
                                    onClick={onEnroll}
                                    disabled={isEnrolled}
                                    className={`px-[16px] py-[8px] rounded-[6px] text-[14px] font-medium transition-colors ${
                                        isEnrolled
                                            ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                                            : 'bg-[#e43b58] hover:bg-[#c73650] text-white'
                                    }`}
                                >
                                    {isEnrolled ? 'Enrolled' : 'Enroll Now'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] overflow-hidden hover:border-white/20 transition-colors">
            {/* Thumbnail */}
            <div className="relative h-[180px] bg-[#383838] overflow-hidden">
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
                <div className="absolute top-[12px] right-[12px] flex gap-[8px]">
                    <button
                        onClick={() => setLiked(!liked)}
                        className={`w-[32px] h-[32px] rounded-[6px] flex items-center justify-center backdrop-blur-sm transition-colors ${
                            liked ? 'bg-red-500/20 text-red-400' : 'bg-black/40 text-[#888888] hover:text-white'
                        }`}
                    >
                        <Heart className={`size-[16px] ${liked ? 'fill-current' : ''}`} />
                    </button>
                </div>
                <div className={`absolute top-[12px] left-[12px] px-[8px] py-[4px] rounded-[6px] text-[12px] font-medium backdrop-blur-sm ${getDifficultyColor(course.difficulty)}`}>
                    {course.difficulty}
                </div>
            </div>

            {/* Content */}
            <div className="p-[20px]">
                <div className="mb-[12px]">
                    <h3 className="text-white text-[16px] font-semibold mb-[8px] line-clamp-2">
                        {course.title}
                    </h3>
                    <p className="text-[#888888] text-[14px] line-clamp-3 mb-[12px]">
                        {course.description}
                    </p>
                </div>

                <div className="flex items-center gap-[8px] mb-[12px] text-[12px]">
                    <div className="flex items-center gap-[4px]">
                        <User className="size-[14px] text-[#888888]" />
                        <span className="text-[#888888]">
                            {course.educator.firstName} {course.educator.lastName}
                        </span>
                    </div>
                    <span className="text-[#888888]">•</span>
                    <div className="flex items-center gap-[4px]">
                        <Users className="size-[14px] text-[#888888]" />
                        <span className="text-[#888888]">
                            {course.enrolledStudents?.length || 0} students
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-[8px]">
                    <button
                        onClick={onViewCourse}
                        className="w-full px-[16px] py-[8px] rounded-[8px] text-[14px] font-medium bg-[#7848ff] hover:bg-[#593cbc] text-white transition-colors"
                    >
                        View Course
                    </button>
                    <div className="flex items-center justify-between">
                        <div className="text-white text-[20px] font-semibold">
                            ${course.price}
                        </div>
                        <button
                            onClick={onEnroll}
                            disabled={isEnrolled}
                            className={`flex items-center gap-[6px] px-[16px] py-[8px] rounded-[8px] text-[14px] font-medium transition-colors ${
                                isEnrolled
                                    ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                                    : 'bg-[#e43b58] hover:bg-[#c73650] text-white'
                            }`}
                        >
                            {isEnrolled ? (
                                <>
                                    <Award className="size-[16px]" />
                                    Enrolled
                                </>
                            ) : (
                                <>
                                    <Plus className="size-[16px]" />
                                    Enroll
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}