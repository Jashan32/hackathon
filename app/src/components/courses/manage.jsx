import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Edit, 
    Eye, 
    EyeOff, 
    Save, 
    Plus, 
    Play, 
    FileText, 
    Users, 
    BarChart3, 
    Settings,
    BookOpen,
    Video,
    Upload,
    Trash2,
    Download,
    Calendar,
    Clock,
    Star,
    MessageSquare
} from 'lucide-react';

export default function ManageCourse() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [publishLoading, setPublishLoading] = useState(false);

    useEffect(() => {
        fetchCourse();
    }, [courseId]);

    const fetchCourse = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/courses/${courseId}`, {
                headers: {
                    'authorization': localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCourse(data.course);
            }
        } catch (error) {
            console.error('Failed to fetch course:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePublish = async () => {
        setPublishLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/api/courses/${courseId}/publish`, {
                method: 'PATCH',
                headers: {
                    'authorization': localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                fetchCourse();
            }
        } catch (error) {
            console.error('Failed to toggle publish status:', error);
        } finally {
            setPublishLoading(false);
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

    if (!course) {
        return (
            <div className="px-[60px] pt-[45px] pb-[30px] min-h-screen bg-[#0d0d0d]">
                <div className="text-center py-16">
                    <h1 className="text-2xl font-bold text-white mb-4">Course not found</h1>
                    <button 
                        onClick={() => navigate('/dashboard/edu/courses')}
                        className="bg-[#e43b58] hover:bg-[#c73650] text-white px-6 py-3 rounded-[12px] transition-colors"
                    >
                        Back to Courses
                    </button>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" /> },
        { id: 'content', label: 'Content', icon: <Play className="w-4 h-4" /> },
        { id: 'students', label: 'Students', icon: <Users className="w-4 h-4" /> },
        { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
        { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
    ];

    return (
        <div className="px-[60px] pt-[45px] pb-[30px] min-h-screen bg-[#0d0d0d]">
            {/* Header */}
            <div className="flex items-center justify-between mb-[32px]">
                <div className="flex items-center gap-[16px]">
                    <button 
                        onClick={() => navigate('/dashboard/edu/courses')}
                        className="w-[40px] h-[40px] bg-[#1d1d1d] hover:bg-[#383838] border border-white/10 rounded-[8px] flex items-center justify-center transition-colors"
                    >
                        <ArrowLeft className="size-[20px] text-white" />
                    </button>
                    <div>
                        <h1 className="text-white text-[32px] font-semibold mb-[4px]">{course.title}</h1>
                        <div className="flex items-center gap-[16px]">
                            <span className={`px-[8px] py-[4px] rounded-[6px] text-[12px] font-medium ${
                                course.isPublished 
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                    : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            }`}>
                                {course.isPublished ? 'Published' : 'Draft'}
                            </span>
                            <span className="text-[#888888] text-[14px]">
                                {course.enrolledStudents?.length || 0} students enrolled
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-[12px]">
                    <button 
                        onClick={handleTogglePublish}
                        disabled={publishLoading}
                        className={`flex items-center gap-[8px] px-[20px] py-[12px] rounded-[12px] transition-colors ${
                            course.isPublished 
                                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                        } disabled:opacity-50`}
                    >
                        {publishLoading ? (
                            <div className="w-[16px] h-[16px] border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : course.isPublished ? (
                            <EyeOff className="size-[16px]" />
                        ) : (
                            <Eye className="size-[16px]" />
                        )}
                        {course.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button 
                        onClick={() => navigate(`/dashboard/edu/courses/${courseId}/edit`)}
                        className="flex items-center gap-[8px] bg-[#e43b58] hover:bg-[#c73650] text-white px-[20px] py-[12px] rounded-[12px] transition-colors"
                    >
                        <Edit className="size-[16px]" />
                        Edit Course
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-white/10 mb-[32px]">
                <div className="flex gap-[32px]">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-[8px] pb-[16px] border-b-2 transition-colors ${
                                activeTab === tab.id
                                    ? 'border-[#e43b58] text-[#e43b58]'
                                    : 'border-transparent text-[#888888] hover:text-white'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-[1200px]">
                {activeTab === 'overview' && <OverviewTab course={course} />}
                {activeTab === 'content' && <ContentTab course={course} />}
                {activeTab === 'students' && <StudentsTab course={course} />}
                {activeTab === 'analytics' && <AnalyticsTab course={course} />}
                {activeTab === 'settings' && <SettingsTab course={course} onUpdate={fetchCourse} />}
            </div>
        </div>
    );
}

function OverviewTab({ course }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-[24px]">
                <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                    <h3 className="text-white text-[18px] font-semibold mb-[16px]">Course Description</h3>
                    <p className="text-[#888888] text-[14px] leading-relaxed">{course.description}</p>
                </div>

                <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                    <h3 className="text-white text-[18px] font-semibold mb-[16px]">Course Details</h3>
                    <div className="grid grid-cols-2 gap-[16px]">
                        <div>
                            <label className="text-[#888888] text-[12px] block mb-[4px]">Category</label>
                            <p className="text-white text-[14px]">{course.category}</p>
                        </div>
                        <div>
                            <label className="text-[#888888] text-[12px] block mb-[4px]">Difficulty</label>
                            <p className="text-white text-[14px] capitalize">{course.difficulty}</p>
                        </div>
                        <div>
                            <label className="text-[#888888] text-[12px] block mb-[4px]">Price</label>
                            <p className="text-white text-[14px]">${course.price}</p>
                        </div>
                        <div>
                            <label className="text-[#888888] text-[12px] block mb-[4px]">Students</label>
                            <p className="text-white text-[14px]">{course.enrolledStudents?.length || 0}</p>
                        </div>
                        <div>
                            <label className="text-[#888888] text-[12px] block mb-[4px]">Created</label>
                            <p className="text-white text-[14px]">{new Date(course.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <label className="text-[#888888] text-[12px] block mb-[4px]">Last Updated</label>
                            <p className="text-white text-[14px]">{new Date(course.updatedAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-[24px]">
                <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                    <h3 className="text-white text-[18px] font-semibold mb-[16px]">Course Thumbnail</h3>
                    <div className="aspect-video bg-[#383838] rounded-[8px] overflow-hidden">
                        {course.thumbnail ? (
                            <img 
                                src={course.thumbnail} 
                                alt={course.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="size-[48px] text-[#888888]" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                    <h3 className="text-white text-[18px] font-semibold mb-[16px]">Quick Stats</h3>
                    <div className="space-y-[12px]">
                        <div className="flex justify-between">
                            <span className="text-[#888888] text-[14px]">Revenue</span>
                            <span className="text-white text-[14px] font-medium">${(course.price * course.enrolledStudents.length).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#888888] text-[14px]">Avg Rating</span>
                            <span className="text-white text-[14px] font-medium">4.5 ⭐</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#888888] text-[14px]">Completion</span>
                            <span className="text-white text-[14px] font-medium">75%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ContentTab({ course }) {
    const [curriculum, setCurriculum] = useState(course.curriculum || []);
    const [showAddSection, setShowAddSection] = useState(false);
    const [showAddLecture, setShowAddLecture] = useState(null);
    const [loading, setLoading] = useState(false);

    const addSection = async (sectionData) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/api/courses/${course._id}/curriculum/sections`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(sectionData)
            });

            if (response.ok) {
                // Refresh course data
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed to add section:', error);
        } finally {
            setLoading(false);
        }
    };

    const addLecture = async (sectionId, lectureData) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/api/courses/${course._id}/curriculum/sections/${sectionId}/lectures`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(lectureData)
            });

            if (response.ok) {
                // Refresh course data
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed to add lecture:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTotalLectures = () => {
        return curriculum.reduce((total, section) => total + section.lectures.length, 0);
    };

    const getTotalDuration = () => {
        let totalSeconds = 0;
        curriculum.forEach(section => {
            section.lectures.forEach(lecture => {
                const [minutes, seconds] = lecture.duration.split(':').map(Number);
                totalSeconds += (minutes * 60) + seconds;
            });
        });
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="space-y-[24px]">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-white text-[20px] font-semibold">Course Curriculum</h3>
                    <p className="text-[#888888] text-[14px]">
                        {curriculum.length} sections • {getTotalLectures()} lectures • {getTotalDuration()}
                    </p>
                </div>
                <button 
                    onClick={() => setShowAddSection(true)}
                    className="flex items-center gap-[8px] bg-[#e43b58] hover:bg-[#c73650] text-white px-[16px] py-[8px] rounded-[8px] transition-colors"
                >
                    <Plus className="size-[16px]" />
                    Add Section
                </button>
            </div>

            {/* Add Section Modal */}
            {showAddSection && (
                <AddSectionModal 
                    onAdd={addSection}
                    onCancel={() => setShowAddSection(false)}
                    loading={loading}
                />
            )}

            {/* Add Lecture Modal */}
            {showAddLecture && (
                <AddLectureModal 
                    sectionId={showAddLecture}
                    onAdd={(lectureData) => addLecture(showAddLecture, lectureData)}
                    onCancel={() => setShowAddLecture(null)}
                    loading={loading}
                />
            )}

            {/* Curriculum Sections */}
            {curriculum.length > 0 ? (
                <div className="space-y-[16px]">
                    {curriculum.map((section, sectionIndex) => (
                        <div key={section._id} className="bg-[#1d1d1d] border border-white/10 rounded-[12px] overflow-hidden">
                            {/* Section Header */}
                            <div className="bg-[#383838] p-[20px]">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-white text-[16px] font-semibold mb-[4px]">
                                            Section {sectionIndex + 1}: {section.title}
                                        </h4>
                                        {section.description && (
                                            <p className="text-[#888888] text-[14px]">{section.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-[12px]">
                                        <span className="text-[#888888] text-[12px]">
                                            {section.lectures.length} lectures
                                        </span>
                                        <button 
                                            onClick={() => setShowAddLecture(section._id)}
                                            className="flex items-center gap-[6px] bg-[#e43b58] hover:bg-[#c73650] text-white px-[12px] py-[6px] rounded-[6px] text-[12px] transition-colors"
                                        >
                                            <Plus className="size-[12px]" />
                                            Add Lecture
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Lectures */}
                            <div className="divide-y divide-white/10">
                                {section.lectures.length > 0 ? (
                                    section.lectures.map((lecture, lectureIndex) => (
                                        <div key={lecture._id} className="p-[20px] hover:bg-[#383838]/20 transition-colors">
                                            <div className="flex items-center gap-[16px]">
                                                <div className="w-[32px] h-[32px] bg-[#0d0d0d] rounded-[6px] flex items-center justify-center">
                                                    <Video className="size-[16px] text-[#888888]" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-[8px] mb-[4px]">
                                                        <h5 className="text-white text-[14px] font-medium">
                                                            {lectureIndex + 1}. {lecture.title}
                                                        </h5>
                                                        {lecture.isPreview && (
                                                            <span className="bg-[#e43b58] text-white text-[10px] px-[6px] py-[1px] rounded-full">
                                                                Preview
                                                            </span>
                                                        )}
                                                        <span className={`text-[10px] px-[6px] py-[1px] rounded-full ${
                                                            lecture.isPublished 
                                                                ? 'bg-green-500/20 text-green-400' 
                                                                : 'bg-orange-500/20 text-orange-400'
                                                        }`}>
                                                            {lecture.isPublished ? 'Published' : 'Draft'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-[12px] text-[12px] text-[#888888]">
                                                        <span>{lecture.duration}</span>
                                                        <span>•</span>
                                                        <span className="capitalize">{lecture.type}</span>
                                                        {lecture.description && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="truncate max-w-[200px]">{lecture.description}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-[8px]">
                                                    <button className="w-[32px] h-[32px] bg-[#383838] hover:bg-[#4a4a4a] rounded-[6px] flex items-center justify-center transition-colors">
                                                        <Edit className="size-[14px] text-white" />
                                                    </button>
                                                    <button className="w-[32px] h-[32px] bg-red-600 hover:bg-red-700 rounded-[6px] flex items-center justify-center transition-colors">
                                                        <Trash2 className="size-[14px] text-white" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-[20px] text-center">
                                        <p className="text-[#888888] text-[14px]">No lectures in this section yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[40px] text-center">
                    <BookOpen className="size-[48px] text-[#888888] mx-auto mb-[16px]" />
                    <h4 className="text-white text-[16px] font-semibold mb-[8px]">No curriculum yet</h4>
                    <p className="text-[#888888] text-[14px] mb-[20px]">
                        Start building your course by adding sections and lectures
                    </p>
                    <button 
                        onClick={() => setShowAddSection(true)}
                        className="bg-[#e43b58] hover:bg-[#c73650] text-white px-[20px] py-[12px] rounded-[8px] transition-colors"
                    >
                        Add First Section
                    </button>
                </div>
            )}
        </div>
    );
}

// Add Section Modal Component
function AddSectionModal({ onAdd, onCancel, loading }) {
    const [formData, setFormData] = useState({
        title: '',
        description: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.title.trim()) {
            onAdd(formData);
            setFormData({ title: '', description: '' });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px] w-[500px] max-w-[90vw]">
                <h3 className="text-white text-[18px] font-semibold mb-[20px]">Add New Section</h3>
                
                <form onSubmit={handleSubmit} className="space-y-[16px]">
                    <div>
                        <label className="block text-white text-[14px] font-medium mb-[8px]">
                            Section Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="e.g., Introduction to React"
                            className="w-full bg-[#0d0d0d] border border-white/10 rounded-[8px] px-[16px] py-[12px] text-white placeholder-[#888888] focus:border-[#e43b58] focus:outline-none"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-white text-[14px] font-medium mb-[8px]">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Brief description of this section"
                            rows="3"
                            className="w-full bg-[#0d0d0d] border border-white/10 rounded-[8px] px-[16px] py-[12px] text-white placeholder-[#888888] focus:border-[#e43b58] focus:outline-none resize-none"
                        />
                    </div>
                    
                    <div className="flex gap-[12px] pt-[16px]">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 bg-[#383838] hover:bg-[#4a4a4a] text-white py-[12px] rounded-[8px] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.title.trim()}
                            className="flex-1 bg-[#e43b58] hover:bg-[#c73650] disabled:opacity-50 text-white py-[12px] rounded-[8px] transition-colors"
                        >
                            {loading ? 'Adding...' : 'Add Section'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Add Lecture Modal Component
function AddLectureModal({ sectionId, onAdd, onCancel, loading }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: '',
        type: 'video',
        videoUrl: '',
        documentUrl: '',
        isPreview: false
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.title.trim() && formData.duration.trim()) {
            onAdd(formData);
            setFormData({
                title: '',
                description: '',
                duration: '',
                type: 'video',
                videoUrl: '',
                documentUrl: '',
                isPreview: false
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px] w-[600px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
                <h3 className="text-white text-[18px] font-semibold mb-[20px]">Add New Lecture</h3>
                
                <form onSubmit={handleSubmit} className="space-y-[16px]">
                    <div className="grid grid-cols-2 gap-[16px]">
                        <div className="col-span-2">
                            <label className="block text-white text-[14px] font-medium mb-[8px]">
                                Lecture Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="e.g., Introduction to Hooks"
                                className="w-full bg-[#0d0d0d] border border-white/10 rounded-[8px] px-[16px] py-[12px] text-white placeholder-[#888888] focus:border-[#e43b58] focus:outline-none"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-white text-[14px] font-medium mb-[8px]">
                                Duration *
                            </label>
                            <input
                                type="text"
                                value={formData.duration}
                                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                                placeholder="e.g., 12:30"
                                pattern="[0-9]+:[0-5][0-9]"
                                className="w-full bg-[#0d0d0d] border border-white/10 rounded-[8px] px-[16px] py-[12px] text-white placeholder-[#888888] focus:border-[#e43b58] focus:outline-none"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-white text-[14px] font-medium mb-[8px]">
                                Type
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                className="w-full bg-[#0d0d0d] border border-white/10 rounded-[8px] px-[16px] py-[12px] text-white focus:border-[#e43b58] focus:outline-none"
                            >
                                <option value="video">Video</option>
                                <option value="document">Document</option>
                                <option value="quiz">Quiz</option>
                                <option value="assignment">Assignment</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-white text-[14px] font-medium mb-[8px]">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Brief description of this lecture"
                            rows="2"
                            className="w-full bg-[#0d0d0d] border border-white/10 rounded-[8px] px-[16px] py-[12px] text-white placeholder-[#888888] focus:border-[#e43b58] focus:outline-none resize-none"
                        />
                    </div>
                    
                    {formData.type === 'video' && (
                        <div>
                            <label className="block text-white text-[14px] font-medium mb-[8px]">
                                Video URL
                            </label>
                            <input
                                type="url"
                                value={formData.videoUrl}
                                onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                                placeholder="https://example.com/video.mp4"
                                className="w-full bg-[#0d0d0d] border border-white/10 rounded-[8px] px-[16px] py-[12px] text-white placeholder-[#888888] focus:border-[#e43b58] focus:outline-none"
                            />
                        </div>
                    )}
                    
                    {formData.type === 'document' && (
                        <div>
                            <label className="block text-white text-[14px] font-medium mb-[8px]">
                                Document URL
                            </label>
                            <input
                                type="url"
                                value={formData.documentUrl}
                                onChange={(e) => setFormData(prev => ({ ...prev, documentUrl: e.target.value }))}
                                placeholder="https://example.com/document.pdf"
                                className="w-full bg-[#0d0d0d] border border-white/10 rounded-[8px] px-[16px] py-[12px] text-white placeholder-[#888888] focus:border-[#e43b58] focus:outline-none"
                            />
                        </div>
                    )}
                    
                    <div className="flex items-center gap-[8px]">
                        <input
                            type="checkbox"
                            id="isPreview"
                            checked={formData.isPreview}
                            onChange={(e) => setFormData(prev => ({ ...prev, isPreview: e.target.checked }))}
                            className="w-[16px] h-[16px] bg-[#0d0d0d] border border-white/10 rounded-[4px] text-[#e43b58] focus:ring-[#e43b58]"
                        />
                        <label htmlFor="isPreview" className="text-white text-[14px]">
                            Make this a preview lecture (free for everyone)
                        </label>
                    </div>
                    
                    <div className="flex gap-[12px] pt-[16px]">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 bg-[#383838] hover:bg-[#4a4a4a] text-white py-[12px] rounded-[8px] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.title.trim() || !formData.duration.trim()}
                            className="flex-1 bg-[#e43b58] hover:bg-[#c73650] disabled:opacity-50 text-white py-[12px] rounded-[8px] transition-colors"
                        >
                            {loading ? 'Adding...' : 'Add Lecture'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function StudentsTab({ course }) {
    return (
        <div className="space-y-[24px]">
            <div className="flex justify-between items-center">
                <h3 className="text-white text-[20px] font-semibold">Enrolled Students</h3>
                <span className="text-[#888888] text-[14px]">{course.enrolledStudents?.length || 0} students</span>
            </div>

            {course.enrolledStudents?.length > 0 ? (
                <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] overflow-hidden">
                    <div className="grid grid-cols-4 gap-[16px] p-[16px] border-b border-white/10 bg-[#383838]/20">
                        <div className="text-[#888888] text-[12px] font-medium">Student</div>
                        <div className="text-[#888888] text-[12px] font-medium">Enrolled Date</div>
                        <div className="text-[#888888] text-[12px] font-medium">Progress</div>
                        <div className="text-[#888888] text-[12px] font-medium">Actions</div>
                    </div>
                    <div className="divide-y divide-white/10">
                        {course.enrolledStudents.map((enrollment, index) => (
                            <div key={index} className="grid grid-cols-4 gap-[16px] p-[16px] items-center">
                                <div className="flex items-center gap-[8px]">
                                    <div className="w-[32px] h-[32px] bg-[#383838] rounded-full flex items-center justify-center">
                                        <span className="text-white text-[12px] font-medium">S{index + 1}</span>
                                    </div>
                                    <span className="text-white text-[14px]">Student {index + 1}</span>
                                </div>
                                <div className="text-[#888888] text-[14px]">
                                    {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-[8px]">
                                    <div className="flex-1 bg-[#383838] rounded-[4px] h-[6px]">
                                        <div 
                                            className="bg-[#e43b58] h-full rounded-[4px]"
                                            style={{ width: `${enrollment.progress || 0}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-[#888888] text-[12px]">{enrollment.progress || 0}%</span>
                                </div>
                                <button className="bg-[#383838] hover:bg-[#4a4a4a] text-white px-[12px] py-[6px] rounded-[6px] text-[12px] transition-colors">
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px] text-center">
                    <Users className="size-[48px] text-[#888888] mx-auto mb-[16px]" />
                    <h4 className="text-white text-[16px] font-medium mb-[8px]">No students enrolled yet</h4>
                    <p className="text-[#888888] text-[14px]">Students will appear here once they enroll in your course</p>
                </div>
            )}
        </div>
    );
}

function AnalyticsTab({ course }) {
    const navigate = useNavigate();
    
    return (
        <div className="space-y-[24px]">
            <div className="flex justify-between items-center">
                <h3 className="text-white text-[20px] font-semibold">Course Analytics</h3>
                <button 
                    onClick={() => navigate(`/dashboard/edu/courses/${course._id}/analytics`)}
                    className="bg-[#e43b58] hover:bg-[#c73650] text-white px-[16px] py-[8px] rounded-[8px] transition-colors"
                >
                    View Full Analytics
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
                <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[20px]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#888888] text-[12px]">Total Revenue</p>
                            <p className="text-white text-[24px] font-semibold">
                                ${((course.enrolledStudents?.length || 0) * course.price).toLocaleString()}
                            </p>
                        </div>
                        <BarChart3 className="size-[32px] text-green-500" />
                    </div>
                </div>

                <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[20px]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#888888] text-[12px]">Completion Rate</p>
                            <p className="text-white text-[24px] font-semibold">75%</p>
                        </div>
                        <BarChart3 className="size-[32px] text-blue-500" />
                    </div>
                </div>

                <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[20px]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#888888] text-[12px]">Avg Rating</p>
                            <p className="text-white text-[24px] font-semibold">4.5</p>
                        </div>
                        <Star className="size-[32px] text-orange-500" />
                    </div>
                </div>
            </div>

            <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                <h4 className="text-white text-[16px] font-medium mb-[16px]">Recent Activity</h4>
                <div className="space-y-[12px]">
                    <div className="flex items-center gap-[12px] p-[12px] bg-[#383838]/20 rounded-[8px]">
                        <Users className="size-[16px] text-blue-500" />
                        <span className="text-white text-[14px]">3 new students enrolled this week</span>
                    </div>
                    <div className="flex items-center gap-[12px] p-[12px] bg-[#383838]/20 rounded-[8px]">
                        <Star className="size-[16px] text-orange-500" />
                        <span className="text-white text-[14px]">2 new reviews received</span>
                    </div>
                    <div className="flex items-center gap-[12px] p-[12px] bg-[#383838]/20 rounded-[8px]">
                        <MessageSquare className="size-[16px] text-green-500" />
                        <span className="text-white text-[14px]">5 questions asked in discussions</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SettingsTab({ course, onUpdate }) {
    const [formData, setFormData] = useState({
        title: course.title,
        description: course.description,
        category: course.category,
        difficulty: course.difficulty,
        price: course.price.toString(),
        thumbnail: course.thumbnail || ''
    });
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file');
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB');
            return;
        }

        setUploadingImage(true);
        
        try {
            const uploadFormData = new FormData();
            uploadFormData.append('image', file);

            const response = await fetch('http://localhost:3000/api/upload/image', {
                method: 'POST',
                headers: {
                    'authorization': localStorage.getItem('token')
                },
                body: uploadFormData
            });

            if (response.ok) {
                const data = await response.json();
                setFormData(prev => ({
                    ...prev,
                    thumbnail: `http://localhost:3000${data.url}`
                }));
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Failed to upload image');
            }
        } catch (error) {
            console.error('Image upload error:', error);
            alert('Network error. Please try again.');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch(`http://localhost:3000/api/courses/${course._id}`, {
                method: 'PUT',
                headers: {
                    'authorization': localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price)
                })
            });

            if (response.ok) {
                onUpdate();
            }
        } catch (error) {
            console.error('Failed to update course:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-[24px]">
            <div className="flex justify-between items-center">
                <h3 className="text-white text-[20px] font-semibold">Course Settings</h3>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-[8px] bg-[#e43b58] hover:bg-[#c73650] disabled:opacity-50 text-white px-[16px] py-[8px] rounded-[8px] transition-colors"
                >
                    {saving ? (
                        <div className="w-[16px] h-[16px] border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <Save className="size-[16px]" />
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px]">
                <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                    <label className="block text-white text-[14px] font-medium mb-[8px]">Course Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full bg-[#0d0d0d] border border-white/10 rounded-[8px] px-[16px] py-[12px] text-white focus:border-[#e43b58] focus:outline-none transition-colors"
                    />
                </div>

                <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                    <label className="block text-white text-[14px] font-medium mb-[8px]">Price (USD)</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full bg-[#0d0d0d] border border-white/10 rounded-[8px] px-[16px] py-[12px] text-white focus:border-[#e43b58] focus:outline-none transition-colors"
                    />
                </div>
            </div>

            <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                <label className="block text-white text-[14px] font-medium mb-[8px]">Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full bg-[#0d0d0d] border border-white/10 rounded-[8px] px-[16px] py-[12px] text-white focus:border-[#e43b58] focus:outline-none transition-colors resize-none"
                />
            </div>

            {/* Thumbnail Upload Section */}
            <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                <label className="block text-white text-[14px] font-medium mb-[16px]">Course Thumbnail</label>
                
                <div className="border-2 border-dashed border-white/20 rounded-[12px] p-[24px] text-center">
                    {uploadingImage ? (
                        <div className="space-y-[16px]">
                            <div className="w-[60px] h-[60px] bg-[#383838] rounded-full flex items-center justify-center mx-auto">
                                <div className="w-[30px] h-[30px] border-4 border-white/20 border-t-[#e43b58] rounded-full animate-spin"></div>
                            </div>
                            <p className="text-white text-[14px]">Uploading thumbnail...</p>
                        </div>
                    ) : formData.thumbnail ? (
                        <div className="space-y-[16px]">
                            <img 
                                src={formData.thumbnail} 
                                alt="Course thumbnail preview" 
                                className="w-[160px] h-[90px] object-cover rounded-[8px] mx-auto border border-white/10"
                            />
                            <div className="space-y-[8px]">
                                <p className="text-green-400 text-[14px]">✓ Thumbnail updated</p>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, thumbnail: '' }))}
                                    className="text-red-400 hover:text-red-300 text-[12px] transition-colors"
                                >
                                    Remove Thumbnail
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-[16px]">
                            <div className="w-[60px] h-[60px] bg-[#383838] rounded-full flex items-center justify-center mx-auto">
                                <Upload className="size-[30px] text-[#888888]" />
                            </div>
                            <p className="text-[#888888] text-[14px]">
                                Upload a new thumbnail (Recommended: 1280x720px, Max 5MB)
                            </p>
                        </div>
                    )}
                    
                    {!uploadingImage && (
                        <label className="inline-flex items-center gap-[8px] bg-[#383838] hover:bg-[#4a4a4a] text-white px-[16px] py-[8px] rounded-[8px] cursor-pointer transition-colors">
                            <Upload className="size-[14px]" />
                            {formData.thumbnail ? 'Change Thumbnail' : 'Upload Thumbnail'}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>
            </div>

            <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                <h4 className="text-red-400 text-[16px] font-medium mb-[16px]">Danger Zone</h4>
                <div className="border border-red-500/20 rounded-[8px] p-[16px]">
                    <h5 className="text-white text-[14px] font-medium mb-[8px]">Delete Course</h5>
                    <p className="text-[#888888] text-[12px] mb-[16px]">
                        Once you delete a course, there is no going back. This will permanently delete all course content and student data.
                    </p>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-[16px] py-[8px] rounded-[8px] text-[14px] transition-colors">
                        Delete Course
                    </button>
                </div>
            </div>
        </div>
    );
}