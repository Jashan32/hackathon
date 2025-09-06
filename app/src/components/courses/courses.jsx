import { useEffect, useState } from "react"
import { Plus, MoreVertical, Users, DollarSign, BookOpen, Edit, BarChart3, Eye, Globe, FileText } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function Courses(){
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(null);

    useEffect(() => {
        const fetchCourses = async() => {
            try {
                const res = await fetch(`http://localhost:3000/api/courses/educator/${localStorage.getItem("userId")}`, {
                    headers: {
                        authorization: localStorage.getItem("token")
                    },
                    method: "GET",
                });
                const data = await res.json();
                console.log(data);
                setCourses(data.courses);
            } catch (error) {
                console.error("Error fetching courses:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchCourses()
    }, [])

    const togglePublishStatus = async (courseId, currentStatus) => {
        try {
            const res = await fetch(`http://localhost:3000/api/courses/${courseId}/publish`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: localStorage.getItem("token")
                },
                body: JSON.stringify({ isPublished: !currentStatus })
            });
            
            if (res.ok) {
                setCourses(courses.map(course => 
                    course._id === courseId 
                        ? { ...course, isPublished: !currentStatus }
                        : course
                ));
                setDropdownOpen(null);
            }
        } catch (error) {
            console.error("Error toggling publish status:", error);
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
                    <h1 className="text-white text-[32px] font-semibold mb-[8px]">My Courses</h1>
                    <p className="text-[#888888] text-[16px]">Manage your courses, lectures, and students</p>
                </div>
                <button 
                    onClick={() => navigate('/dashboard/edu/courses/create')}
                    className="flex items-center gap-[8px] bg-[#e43b58] hover:bg-[#c73650] text-white px-[20px] py-[12px] rounded-[12px] transition-colors"
                >
                    <Plus className="size-[18px]" />
                    Create Course
                </button>
            </div>

            {/* Course Stats */}
            <div className="grid grid-cols-4 gap-[20px] mb-[40px]">
                <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[20px]">
                    <div className="flex items-center gap-[12px]">
                        <div className="w-[40px] h-[40px] bg-[#e43b58]/20 rounded-[8px] flex items-center justify-center">
                            <BookOpen className="size-[20px] text-[#e43b58]" />
                        </div>
                        <div>
                            <p className="text-[#888888] text-[14px]">Total Courses</p>
                            <p className="text-white text-[24px] font-semibold">{courses.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[20px]">
                    <div className="flex items-center gap-[12px]">
                        <div className="w-[40px] h-[40px] bg-blue-500/20 rounded-[8px] flex items-center justify-center">
                            <Users className="size-[20px] text-blue-500" />
                        </div>
                        <div>
                            <p className="text-[#888888] text-[14px]">Total Students</p>
                            <p className="text-white text-[24px] font-semibold">
                                {courses.reduce((total, course) => total + course.enrolledStudents.length, 0)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[20px]">
                    <div className="flex items-center gap-[12px]">
                        <div className="w-[40px] h-[40px] bg-green-500/20 rounded-[8px] flex items-center justify-center">
                            <DollarSign className="size-[20px] text-green-500" />
                        </div>
                        <div>
                            <p className="text-[#888888] text-[14px]">Revenue</p>
                            <p className="text-white text-[24px] font-semibold">
                                ${courses.reduce((total, course) => total + (course.price * course.enrolledStudents.length), 0)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[20px]">
                    <div className="flex items-center gap-[12px]">
                        <div className="w-[40px] h-[40px] bg-purple-500/20 rounded-[8px] flex items-center justify-center">
                            <Globe className="size-[20px] text-purple-500" />
                        </div>
                        <div>
                            <p className="text-[#888888] text-[14px]">Published</p>
                            <p className="text-white text-[24px] font-semibold">
                                {courses.filter(course => course.isPublished).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Courses Grid */}
            {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px]">
                    {courses.map((course) => (
                        <div key={course._id} className="bg-[#1d1d1d] border border-white/10 rounded-[12px] overflow-hidden hover:border-white/20 transition-colors group">
                            {/* Course Thumbnail */}
                            <div className="relative h-[160px] bg-[#383838]">
                                {course.thumbnail ? (
                                    <img 
                                        src={course.thumbnail} 
                                        alt={course.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <BookOpen className="size-[40px] text-[#888888]" />
                                    </div>
                                )}
                                
                                {/* Status Badge */}
                                <div className="absolute top-[12px] left-[12px]">
                                    <span className={`px-[8px] py-[4px] rounded-[6px] text-[12px] font-medium ${
                                        course.isPublished 
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                            : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                    }`}>
                                        {course.isPublished ? 'Published' : 'Draft'}
                                    </span>
                                </div>

                                {/* Dropdown Menu */}
                                <div className="absolute top-[12px] right-[12px]">
                                    <div className="relative">
                                        <button 
                                            onClick={() => setDropdownOpen(dropdownOpen === course._id ? null : course._id)}
                                            className="w-[32px] h-[32px] bg-black/50 hover:bg-black/70 rounded-[6px] flex items-center justify-center transition-colors"
                                        >
                                            <MoreVertical className="size-[16px] text-white" />
                                        </button>
                                        
                                        {dropdownOpen === course._id && (
                                            <div className="absolute top-[36px] right-0 bg-[#383838] border border-white/10 rounded-[8px] py-[4px] min-w-[140px] z-10">
                                                <button 
                                                    onClick={() => navigate(`/dashboard/edu/courses/${course._id}/edit`)}
                                                    className="w-full flex items-center gap-[8px] px-[12px] py-[6px] text-white text-[14px] hover:bg-white/10 transition-colors"
                                                >
                                                    <Edit className="size-[14px]" />
                                                    Edit Course
                                                </button>
                                                <button 
                                                    onClick={() => navigate(`/dashboard/edu/courses/${course._id}/view`)}
                                                    className="w-full flex items-center gap-[8px] px-[12px] py-[6px] text-white text-[14px] hover:bg-white/10 transition-colors"
                                                >
                                                    <Eye className="size-[14px]" />
                                                    View Course
                                                </button>
                                                <button 
                                                    onClick={() => navigate(`/dashboard/edu/courses/${course._id}/analytics`)}
                                                    className="w-full flex items-center gap-[8px] px-[12px] py-[6px] text-white text-[14px] hover:bg-white/10 transition-colors"
                                                >
                                                    <BarChart3 className="size-[14px]" />
                                                    Analytics
                                                </button>
                                                <hr className="border-white/10 my-[4px]" />
                                                <button 
                                                    onClick={() => togglePublishStatus(course._id, course.isPublished)}
                                                    className="w-full flex items-center gap-[8px] px-[12px] py-[6px] text-white text-[14px] hover:bg-white/10 transition-colors"
                                                >
                                                    <Globe className="size-[14px]" />
                                                    {course.isPublished ? 'Unpublish' : 'Publish'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Course Info */}
                            <div className="p-[16px]">
                                <h3 className="text-white text-[18px] font-semibold mb-[8px] line-clamp-2">{course.title}</h3>
                                <p className="text-[#888888] text-[14px] mb-[12px] line-clamp-2">{course.description}</p>
                                
                                {/* Course Meta */}
                                <div className="flex items-center justify-between mb-[16px]">
                                    <div className="flex items-center gap-[12px]">
                                        <div className="flex items-center gap-[4px]">
                                            <Users className="size-[14px] text-[#888888]" />
                                            <span className="text-[#888888] text-[12px]">{course.enrolledStudents.length} students</span>
                                        </div>
                                        <div className="text-[#888888] text-[12px]">•</div>
                                        <span className="text-[#888888] text-[12px] capitalize">{course.difficulty}</span>
                                    </div>
                                    <span className="text-[#e43b58] text-[16px] font-semibold">${course.price}</span>
                                </div>

                                {/* Category */}
                                <div className="mb-[16px]">
                                    <span className="bg-[#383838] text-[#888888] text-[12px] px-[8px] py-[4px] rounded-[6px]">
                                        {course.category}
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-[8px]">
                                    <button 
                                        onClick={() => navigate(`/dashboard/edu/courses/${course._id}/manage`)}
                                        className="flex-1 bg-[#e43b58] hover:bg-[#c73650] text-white text-[14px] py-[8px] rounded-[8px] transition-colors"
                                    >
                                        Manage
                                    </button>
                                    <button 
                                        onClick={() => navigate(`/dashboard/edu/courses/${course._id}/analytics`)}
                                        className="px-[12px] bg-[#383838] hover:bg-[#4a4a4a] text-white text-[14px] py-[8px] rounded-[8px] transition-colors"
                                    >
                                        <BarChart3 className="size-[16px]" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // Empty State
                <div className="flex flex-col items-center justify-center h-[400px] bg-[#1d1d1d] border border-white/10 rounded-[12px]">
                    <div className="w-[80px] h-[80px] bg-[#383838] rounded-full flex items-center justify-center mb-[20px]">
                        <BookOpen className="size-[40px] text-[#888888]" />
                    </div>
                    <h3 className="text-white text-[20px] font-semibold mb-[8px]">No courses yet</h3>
                    <p className="text-[#888888] text-[14px] mb-[24px] text-center max-w-[300px]">
                        Create your first course and start sharing your knowledge with students worldwide.
                    </p>
                    <button 
                        onClick={() => navigate('/dashboard/edu/courses/create')}
                        className="flex items-center gap-[8px] bg-[#e43b58] hover:bg-[#c73650] text-white px-[20px] py-[12px] rounded-[12px] transition-colors"
                    >
                        <Plus className="size-[18px]" />
                        Create Your First Course
                    </button>
                </div>
            )}
        </div>
    )
}