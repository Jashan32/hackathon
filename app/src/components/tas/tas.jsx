import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Users, 
    Plus, 
    Search, 
    UserCheck, 
    UserMinus, 
    Calendar, 
    MessageSquare, 
    BookOpen, 
    Award,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    Clock
} from 'lucide-react';

export default function Tas() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [allTas, setAllTas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('all');
    const [selectedTaForAction, setSelectedTaForAction] = useState(null);

    useEffect(() => {
        fetchCourses();
        fetchAllTas();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/courses/educator/${localStorage.getItem("userId")}`, {
                headers: {
                    'authorization': localStorage.getItem('token')
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCourses(data.courses);
            }
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        }
    };

    const fetchAllTas = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/tas/educator', {
                headers: {
                    'authorization': localStorage.getItem('token')
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAllTas(data.tas);
            }
        } catch (error) {
            console.error('Failed to fetch TAs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTas = allTas.filter(ta => {
        const matchesSearch = ta.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            ta.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCourse = selectedCourse === 'all' || ta.courseId === selectedCourse;
        return matchesSearch && matchesCourse;
    });

    const totalTas = allTas.length;
    const activeTas = allTas.filter(ta => ta.status === 'active').length;
    const totalSessions = allTas.reduce((sum, ta) => sum + ta.sessionsCompleted, 0);
    const avgRating = allTas.length > 0 ? (allTas.reduce((sum, ta) => sum + ta.rating, 0) / allTas.length).toFixed(1) : 0;

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
                    <h1 className="text-white text-[32px] font-semibold mb-[8px]">Teaching Assistants</h1>
                    <p className="text-[#888888] text-[16px]">Manage TAs and their assigned students across your courses</p>
                </div>
                <button 
                    onClick={() => navigate('/dashboard/edu/addtas')}
                    className="flex items-center gap-[8px] bg-[#e43b58] hover:bg-[#c73650] text-white px-[20px] py-[12px] rounded-[12px] transition-colors"
                >
                    <Plus className="size-[18px]" />
                    Assign New TA
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-[20px] mb-[40px]">
                <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[20px]">
                    <div className="flex items-center gap-[12px]">
                        <div className="w-[40px] h-[40px] bg-blue-500/20 rounded-[8px] flex items-center justify-center">
                            <Users className="size-[20px] text-blue-500" />
                        </div>
                        <div>
                            <p className="text-[#888888] text-[14px]">Total TAs</p>
                            <p className="text-white text-[24px] font-semibold">{totalTas}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[20px]">
                    <div className="flex items-center gap-[12px]">
                        <div className="w-[40px] h-[40px] bg-green-500/20 rounded-[8px] flex items-center justify-center">
                            <UserCheck className="size-[20px] text-green-500" />
                        </div>
                        <div>
                            <p className="text-[#888888] text-[14px]">Active TAs</p>
                            <p className="text-white text-[24px] font-semibold">{activeTas}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[20px]">
                    <div className="flex items-center gap-[12px]">
                        <div className="w-[40px] h-[40px] bg-purple-500/20 rounded-[8px] flex items-center justify-center">
                            <MessageSquare className="size-[20px] text-purple-500" />
                        </div>
                        <div>
                            <p className="text-[#888888] text-[14px]">Total Sessions</p>
                            <p className="text-white text-[24px] font-semibold">{totalSessions}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[20px]">
                    <div className="flex items-center gap-[12px]">
                        <div className="w-[40px] h-[40px] bg-orange-500/20 rounded-[8px] flex items-center justify-center">
                            <Award className="size-[20px] text-orange-500" />
                        </div>
                        <div>
                            <p className="text-[#888888] text-[14px]">Avg Rating</p>
                            <p className="text-white text-[24px] font-semibold">{avgRating}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-[16px] mb-[32px]">
                <div className="flex-1 relative">
                    <Search className="absolute left-[16px] top-1/2 transform -translate-y-1/2 size-[20px] text-[#888888]" />
                    <input
                        type="text"
                        placeholder="Search TAs by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#1d1d1d] border border-white/10 rounded-[12px] pl-[48px] pr-[16px] py-[12px] text-white placeholder-[#888888] focus:border-[#e43b58] focus:outline-none transition-colors"
                    />
                </div>
                <div className="flex gap-[12px]">
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="bg-[#1d1d1d] border border-white/10 rounded-[12px] px-[16px] py-[12px] text-white focus:border-[#e43b58] focus:outline-none transition-colors appearance-none min-w-[200px]"
                    >
                        <option value="all">All Courses</option>
                        {courses.map(course => (
                            <option key={course._id} value={course._id}>{course.title}</option>
                        ))}
                    </select>
                    <button className="bg-[#383838] hover:bg-[#4a4a4a] border border-white/10 text-white px-[16px] py-[12px] rounded-[12px] transition-colors">
                        <Filter className="size-[20px]" />
                    </button>
                </div>
            </div>

            {/* TAs Grid */}
            {filteredTas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px]">
                    {filteredTas.map((ta) => (
                        <TaCard key={ta.id} ta={ta} onAction={setSelectedTaForAction} onRefresh={fetchAllTas} />
                    ))}
                </div>
            ) : (
                <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[40px] text-center">
                    <Users className="size-[64px] text-[#888888] mx-auto mb-[20px]" />
                    <h3 className="text-white text-[20px] font-semibold mb-[8px]">
                        {searchTerm || selectedCourse !== 'all' ? 'No TAs found' : 'No TAs assigned yet'}
                    </h3>
                    <p className="text-[#888888] text-[14px] mb-[24px]">
                        {searchTerm || selectedCourse !== 'all' 
                            ? 'Try adjusting your search or filter criteria'
                            : 'Start by assigning TAs from your enrolled students to help with mentorship sessions'
                        }
                    </p>
                    {!searchTerm && selectedCourse === 'all' && (
                        <button 
                            onClick={() => navigate('/dashboard/edu/addtas')}
                            className="bg-[#e43b58] hover:bg-[#c73650] text-white px-[20px] py-[12px] rounded-[12px] transition-colors"
                        >
                            Assign Your First TA
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

function TaCard({ ta, onAction, onRefresh }) {
    const [showDropdown, setShowDropdown] = useState(false);

    const handleRemoveTA = async () => {
        if (window.confirm(`Are you sure you want to remove ${ta.name} as a TA?`)) {
            try {
                const response = await fetch(`http://localhost:3000/api/tas/${ta.id}/course/${ta.courseId}`, {
                    method: 'DELETE',
                    headers: {
                        'authorization': localStorage.getItem('token')
                    }
                });

                if (response.ok) {
                    onRefresh();
                    setShowDropdown(false);
                } else {
                    const errorData = await response.json();
                    console.error('Failed to remove TA:', errorData.error);
                }
            } catch (error) {
                console.error('Failed to remove TA:', error);
            }
        }
    };

    return (
        <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[20px] hover:border-white/20 transition-colors">
            {/* Header */}
            <div className="flex items-start justify-between mb-[16px]">
                <div className="flex items-center gap-[12px]">
                    <div className="w-[48px] h-[48px] bg-[#383838] rounded-full flex items-center justify-center">
                        <span className="text-white text-[16px] font-medium">
                            {ta.name.split(' ').map(n => n[0]).join('')}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-white text-[16px] font-semibold">{ta.name}</h3>
                        <p className="text-[#888888] text-[12px]">{ta.email}</p>
                    </div>
                </div>
                <div className="relative">
                    <button 
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="w-[32px] h-[32px] bg-[#383838] hover:bg-[#4a4a4a] rounded-[6px] flex items-center justify-center transition-colors"
                    >
                        <MoreVertical className="size-[16px] text-white" />
                    </button>
                    {showDropdown && (
                        <div className="absolute right-0 top-[36px] bg-[#383838] border border-white/10 rounded-[8px] py-[4px] min-w-[140px] z-10">
                            <button className="w-full flex items-center gap-[8px] px-[12px] py-[6px] text-white text-[14px] hover:bg-white/10 transition-colors">
                                <Eye className="size-[14px]" />
                                View Details
                            </button>
                            <button className="w-full flex items-center gap-[8px] px-[12px] py-[6px] text-white text-[14px] hover:bg-white/10 transition-colors">
                                <Edit className="size-[14px]" />
                                Edit Assignment
                            </button>
                            <hr className="border-white/10 my-[4px]" />
                            <button 
                                onClick={handleRemoveTA}
                                className="w-full flex items-center gap-[8px] px-[12px] py-[6px] text-red-400 text-[14px] hover:bg-white/10 transition-colors"
                            >
                                <Trash2 className="size-[14px]" />
                                Remove TA
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Course Info */}
            <div className="mb-[16px]">
                <div className="flex items-center gap-[6px] mb-[8px]">
                    <BookOpen className="size-[14px] text-[#888888]" />
                    <span className="text-[#888888] text-[12px]">Course:</span>
                    <span className="text-white text-[12px] font-medium">{ta.courseName}</span>
                </div>
                <div className="flex items-center gap-[6px]">
                    <Calendar className="size-[14px] text-[#888888]" />
                    <span className="text-[#888888] text-[12px]">Joined:</span>
                    <span className="text-white text-[12px]">{new Date(ta.joinedDate).toLocaleDateString()}</span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-[12px] mb-[16px]">
                <div className="bg-[#383838]/30 rounded-[6px] p-[8px] text-center">
                    <p className="text-white text-[16px] font-semibold">{ta.assignedStudents}</p>
                    <p className="text-[#888888] text-[10px]">Students</p>
                </div>
                <div className="bg-[#383838]/30 rounded-[6px] p-[8px] text-center">
                    <p className="text-white text-[16px] font-semibold">{ta.sessionsCompleted}</p>
                    <p className="text-[#888888] text-[10px]">Sessions</p>
                </div>
            </div>

            {/* Specialties */}
            <div className="mb-[16px]">
                <p className="text-[#888888] text-[12px] mb-[6px]">Specialties:</p>
                <div className="flex flex-wrap gap-[4px]">
                    {ta.specialties.slice(0, 3).map((specialty, index) => (
                        <span key={index} className="bg-[#e43b58]/20 text-[#e43b58] text-[10px] px-[6px] py-[2px] rounded-[4px]">
                            {specialty}
                        </span>
                    ))}
                    {ta.specialties.length > 3 && (
                        <span className="bg-[#383838] text-[#888888] text-[10px] px-[6px] py-[2px] rounded-[4px]">
                            +{ta.specialties.length - 3} more
                        </span>
                    )}
                </div>
            </div>

            {/* Rating and Status */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-[4px]">
                    <Award className="size-[14px] text-orange-500" />
                    <span className="text-white text-[14px] font-medium">{ta.rating}</span>
                    <span className="text-[#888888] text-[12px]">rating</span>
                </div>
                <span className={`px-[8px] py-[4px] rounded-[6px] text-[10px] font-medium ${
                    ta.status === 'active' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-500/20 text-gray-400'
                }`}>
                    {ta.status}
                </span>
            </div>
        </div>
    );
}