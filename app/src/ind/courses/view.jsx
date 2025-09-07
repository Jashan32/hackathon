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
    Bookmark,
    Save,
    Briefcase
} from 'lucide-react';

export default function IndViewCourse() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [rating, setRating] = useState(null);
    const [savingRating, setSavingRating] = useState(false);
    const [industryRating, setIndustryRating] = useState({
        relevance: 0,
        practicality: 0,
        industryAlignment: 0,
        skillDevelopment: 0,
        overallQuality: 0,
        feedback: ''
    });

    const tabs = [
        { id: 'overview', name: 'Overview', icon: BookOpen },
        { id: 'curriculum', name: 'Curriculum', icon: Video },
        { id: 'reviews', name: 'Reviews', icon: MessageSquare },
        { id: 'rating', name: 'Industry Rating', icon: Star },
        { id: 'instructor', name: 'Instructor', icon: User }
    ];

    const ratingCriteria = [
        { 
            key: 'relevance', 
            label: 'Industry Relevance', 
            description: 'How relevant is this course to current industry needs?'
        },
        { 
            key: 'practicality', 
            label: 'Practical Application', 
            description: 'How practical and applicable are the skills taught?'
        },
        { 
            key: 'industryAlignment', 
            label: 'Industry Standards', 
            description: 'How well does the course align with industry standards?'
        },
        { 
            key: 'skillDevelopment', 
            label: 'Skill Development', 
            description: 'How effectively does the course develop job-ready skills?'
        },
        { 
            key: 'overallQuality', 
            label: 'Overall Quality', 
            description: 'Overall assessment of course quality and content'
        }
    ];

    useEffect(() => {
        if (courseId) {
            fetchCourse();
            fetchExistingRating();
        }
    }, [courseId]);

    const fetchCourse = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/courses/${courseId}`);
            if (response.ok) {
                const data = await response.json();
                setCourse({
                    ...data.course,
                    duration: '12 hours',
                    level: data.course.difficulty,
                    language: 'English',
                    lastUpdated: new Date(data.course.updatedAt).toLocaleDateString(),
                    totalLectures: Math.floor(Math.random() * 25) + 10,
                    totalQuizzes: Math.floor(Math.random() * 8) + 3,
                    totalAssignments: Math.floor(Math.random() * 5) + 2,
                    rating: (Math.random() * 2 + 3).toFixed(1),
                    totalRatings: Math.floor(Math.random() * 500) + 100,
                    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
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
                    ]
                });
            }
        } catch (error) {
            console.error('Failed to fetch course:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchExistingRating = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/courses/${courseId}/industry-rating`, {
                headers: {
                    'authorization': localStorage.getItem('token')
                }
            });
            if (response.ok) {
                const data = await response.json();
                if (data.rating) {
                    setIndustryRating(data.rating);
                    setRating(data.rating);
                }
            }
        } catch (error) {
            console.error('Failed to fetch existing rating:', error);
        }
    };

    const handleRatingChange = (criterion, value) => {
        setIndustryRating(prev => ({
            ...prev,
            [criterion]: value
        }));
    };

    const handleFeedbackChange = (feedback) => {
        setIndustryRating(prev => ({
            ...prev,
            feedback
        }));
    };

    const saveRating = async () => {
        try {
            setSavingRating(true);
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/courses/${courseId}/industry-rating`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('token')
                },
                body: JSON.stringify(industryRating)
            });

            if (response.ok) {
                const data = await response.json();
                setRating(data.rating);
                alert('Rating saved successfully!');
            } else {
                alert('Failed to save rating. Please try again.');
            }
        } catch (error) {
            console.error('Failed to save rating:', error);
            alert('Failed to save rating. Please try again.');
        } finally {
            setSavingRating(false);
        }
    };

    const renderStarRating = (criterion, value, onChange) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => onChange(criterion, star)}
                        className={`p-1 transition-colors ${
                            star <= value 
                                ? 'text-yellow-400 hover:text-yellow-300' 
                                : 'text-gray-600 hover:text-gray-400'
                        }`}
                    >
                        <Star className={`size-6 ${star <= value ? 'fill-current' : ''}`} />
                    </button>
                ))}
            </div>
        );
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-screen">
                <div className="text-white text-lg">Loading course...</div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-xl text-white mb-4">Course not found</h2>
                <button 
                    onClick={() => navigate('/dashboard/ind/courses')}
                    className="px-4 py-2 bg-[#7848ff] text-white rounded-lg hover:bg-[#593cbc]"
                >
                    Back to Courses
                </button>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => navigate('/dashboard/ind/courses')}
                    className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
                >
                    <ArrowLeft className="size-5 text-white" />
                </button>
                <div className="flex items-center gap-3">
                    <Briefcase className="size-6 text-[#7848ff]" />
                    <h1 className="text-2xl font-bold text-white">Course Review</h1>
                </div>
            </div>

            {/* Course Header */}
            <div className="bg-[#1a1a1a] rounded-lg border border-white/10 p-6 mb-6">
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-white mb-2">{course.title}</h1>
                                <p className="text-gray-400 text-lg mb-4">{course.description}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-400">
                                <User className="size-4" />
                                <span>{course.educator?.firstName} {course.educator?.lastName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <Clock className="size-4" />
                                <span>{course.duration}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <Users className="size-4" />
                                <span>{course.enrolledStudents?.length || 0} students</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <Globe className="size-4" />
                                <span>{course.language}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(course.difficulty)}`}>
                                {course.difficulty}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                {course.category}
                            </span>
                        </div>
                    </div>

                    <div className="bg-[#222222] rounded-lg p-4 border border-white/10">
                        <div className="text-center mb-4">
                            <div className="text-3xl font-bold text-[#7848ff] mb-2">
                                ₹{course.price || 'Free'}
                            </div>
                            {rating && (
                                <div className="text-sm text-green-400">
                                    ✓ You have rated this course
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Duration:</span>
                                <span className="text-white">{course.duration}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Lectures:</span>
                                <span className="text-white">{course.totalLectures}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Level:</span>
                                <span className="text-white capitalize">{course.level}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Updated:</span>
                                <span className="text-white">{course.lastUpdated}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-[#1a1a1a] p-1 rounded-lg border border-white/10">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                activeTab === tab.id
                                    ? 'bg-[#7848ff] text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-[#222222]'
                            }`}
                        >
                            <Icon className="size-4" />
                            {tab.name}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                {activeTab === 'overview' && (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-[#1a1a1a] rounded-lg border border-white/10 p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Target className="size-5 text-[#7848ff]" />
                                Learning Objectives
                            </h3>
                            <ul className="space-y-2">
                                {course.objectives?.map((objective, index) => (
                                    <li key={index} className="flex items-start gap-2 text-gray-300">
                                        <CheckCircle className="size-4 text-green-400 mt-0.5 flex-shrink-0" />
                                        <span>{objective}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-[#1a1a1a] rounded-lg border border-white/10 p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <BookOpen className="size-5 text-[#7848ff]" />
                                Requirements
                            </h3>
                            <ul className="space-y-2">
                                {course.requirements?.map((requirement, index) => (
                                    <li key={index} className="flex items-start gap-2 text-gray-300">
                                        <div className="size-2 bg-[#7848ff] rounded-full mt-2 flex-shrink-0"></div>
                                        <span>{requirement}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'rating' && (
                    <div className="bg-[#1a1a1a] rounded-lg border border-white/10 p-6">
                        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <Star className="size-5 text-[#7848ff]" />
                            Industry Expert Rating
                        </h3>

                        <div className="space-y-6">
                            {ratingCriteria.map((criterion) => (
                                <div key={criterion.key} className="border border-white/10 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="text-white font-medium">{criterion.label}</h4>
                                            <p className="text-gray-400 text-sm">{criterion.description}</p>
                                        </div>
                                        {renderStarRating(criterion.key, industryRating[criterion.key], handleRatingChange)}
                                    </div>
                                </div>
                            ))}

                            <div className="border border-white/10 rounded-lg p-4">
                                <h4 className="text-white font-medium mb-2">Additional Feedback</h4>
                                <textarea
                                    value={industryRating.feedback}
                                    onChange={(e) => handleFeedbackChange(e.target.value)}
                                    placeholder="Provide additional feedback about this course's industry relevance and practical value..."
                                    className="w-full h-32 px-3 py-2 bg-[#222222] border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#7848ff] resize-none"
                                />
                            </div>

                            <button
                                onClick={saveRating}
                                disabled={savingRating}
                                className="w-full py-3 bg-[#7848ff] hover:bg-[#593cbc] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Save className="size-4" />
                                {savingRating ? 'Saving...' : rating ? 'Update Rating' : 'Save Rating'}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'curriculum' && (
                    <div className="bg-[#1a1a1a] rounded-lg border border-white/10 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Course Curriculum</h3>
                        <p className="text-gray-400">Curriculum details would be displayed here.</p>
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="bg-[#1a1a1a] rounded-lg border border-white/10 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Student Reviews</h3>
                        <p className="text-gray-400">Student reviews would be displayed here.</p>
                    </div>
                )}

                {activeTab === 'instructor' && (
                    <div className="bg-[#1a1a1a] rounded-lg border border-white/10 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Instructor Information</h3>
                        <div className="flex items-center gap-4">
                            <div className="size-16 bg-[#7848ff]/20 rounded-full flex items-center justify-center">
                                <User className="size-8 text-[#7848ff]" />
                            </div>
                            <div>
                                <h4 className="text-white font-medium text-lg">
                                    {course.educator?.firstName} {course.educator?.lastName}
                                </h4>
                                <p className="text-gray-400">Course Instructor</p>
                                <p className="text-gray-400">{course.educator?.email}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
