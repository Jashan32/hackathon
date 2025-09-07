import { useState, useEffect } from 'react';
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
    ChevronDown,
    Heart,
    Share2,
    Plus,
    Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function IndCourses() {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [showFilters, setShowFilters] = useState(false);
    const [ratedCourses, setRatedCourses] = useState([]);
    const navigate = useNavigate();

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
        fetchRatedCourses();
    }, []);

    useEffect(() => {
        filterCourses();
    }, [courses, selectedCategory, selectedDifficulty, searchTerm]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/courses/`);
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

    const fetchRatedCourses = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/courses/industry-ratings`, {
                headers: {
                    'authorization': localStorage.getItem('token')
                }
            });
            if (response.ok) {
                const data = await response.json();
                setRatedCourses(data.ratings.map(rating => rating.courseId));
            }
        } catch (error) {
            console.error('Failed to fetch rated courses:', error);
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

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const formatPrice = (price) => {
        return price === 0 ? 'Free' : `₹${price}`;
    };

    const handleViewCourse = (courseId) => {
        navigate(`/dashboard/ind/courses/view/${courseId}`);
    };

    const isRated = (courseId) => {
        return ratedCourses.includes(courseId);
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-screen">
                <div className="text-white text-lg">Loading courses...</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <Briefcase className="size-8 text-[#7848ff]" />
                    <h1 className="text-2xl font-bold text-white">Industry Expert Dashboard</h1>
                </div>
                <p className="text-gray-400">Review and rate courses to help students make informed decisions</p>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-[#222222] border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#7848ff]"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#222222] border border-white/10 rounded-lg text-white hover:bg-[#2b2b2b]"
                        >
                            <Filter className="size-4" />
                            Filters
                            <ChevronDown className={`size-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>
                        <button
                            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                            className="flex items-center gap-2 px-4 py-2 bg-[#222222] border border-white/10 rounded-lg text-white hover:bg-[#2b2b2b]"
                        >
                            {viewMode === 'grid' ? <List className="size-4" /> : <Grid3X3 className="size-4" />}
                        </button>
                    </div>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="flex flex-wrap gap-4 p-4 bg-[#1a1a1a] rounded-lg border border-white/10">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-3 py-2 bg-[#222222] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#7848ff]"
                            >
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Difficulty</label>
                            <select
                                value={selectedDifficulty}
                                onChange={(e) => setSelectedDifficulty(e.target.value)}
                                className="px-3 py-2 bg-[#222222] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#7848ff]"
                            >
                                {difficulties.map(difficulty => (
                                    <option key={difficulty.id} value={difficulty.id}>{difficulty.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Course Grid */}
            <div className={`grid gap-6 ${viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
                {filteredCourses.map((course) => (
                    <div key={course._id} className="bg-[#1a1a1a] rounded-lg border border-white/10 overflow-hidden hover:border-[#7848ff]/50 transition-all group">
                        {/* Course Image */}
                        <div className="relative h-48 bg-gradient-to-br from-[#7848ff]/20 to-[#bb86fc]/20">
                            {course.thumbnail ? (
                                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <BookOpen className="size-16 text-[#7848ff]/50" />
                                </div>
                            )}
                            <div className="absolute top-3 right-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(course.difficulty)}`}>
                                    {course.difficulty}
                                </span>
                            </div>
                            {isRated(course._id) && (
                                <div className="absolute top-3 left-3">
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                                        Rated
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Course Content */}
                        <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="text-lg font-semibold text-white group-hover:text-[#7848ff] transition-colors line-clamp-1">
                                    {course.title}
                                </h3>
                                <span className="text-lg font-bold text-[#7848ff]">
                                    {formatPrice(course.price)}
                                </span>
                            </div>

                            <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                                {course.description}
                            </p>

                            <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                                <div className="flex items-center gap-1">
                                    <Users className="size-4" />
                                    <span>{course.enrolledStudents?.length || 0}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Star className="size-4" />
                                    <span>{course.averageRating || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <User className="size-4" />
                                    <span>{course.educator?.firstName} {course.educator?.lastName}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleViewCourse(course._id)}
                                className="w-full py-2 bg-[#7848ff] hover:bg-[#593cbc] text-white rounded-lg font-medium transition-colors"
                            >
                                {isRated(course._id) ? 'View & Update Rating' : 'View & Rate Course'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredCourses.length === 0 && (
                <div className="text-center py-12">
                    <BookOpen className="size-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-400 mb-2">No courses found</h3>
                    <p className="text-gray-500">Try adjusting your search criteria</p>
                </div>
            )}
        </div>
    );
}
