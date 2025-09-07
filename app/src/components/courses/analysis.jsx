import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Users, 
    DollarSign, 
    TrendingUp, 
    Eye, 
    Calendar,
    BookOpen,
    Clock,
    Star,
    Download,
    BarChart3,
    PieChart,
    Activity
} from 'lucide-react';

export default function CourseAnalysis() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState({
        totalRevenue: 0,
        enrollmentTrend: [],
        completionRate: 0,
        averageRating: 0,
        viewCount: 0,
        downloadCount: 0
    });

    useEffect(() => {
        fetchCourseData();
    }, [courseId]);

    const fetchCourseData = async () => {
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
                
                // Calculate analytics from course data
                calculateAnalytics(data.course);
            }
        } catch (error) {
            console.error('Failed to fetch course data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateAnalytics = (courseData) => {
        const totalRevenue = courseData.price * courseData.enrolledStudents.length;
        const completionRate = 75; // Mock data - in real app, calculate from progress
        const averageRating = 4.5; // Mock data - calculate from reviews
        const viewCount = courseData.enrolledStudents.length * 15; // Mock calculation
        const downloadCount = courseData.enrolledStudents.length * 8; // Mock calculation

        // Mock enrollment trend data (last 6 months)
        const enrollmentTrend = [
            { month: 'Jul', enrollments: 12 },
            { month: 'Aug', enrollments: 18 },
            { month: 'Sep', enrollments: courseData.enrolledStudents.length },
            { month: 'Oct', enrollments: 0 },
            { month: 'Nov', enrollments: 0 },
            { month: 'Dec', enrollments: 0 }
        ];

        setAnalyticsData({
            totalRevenue,
            enrollmentTrend,
            completionRate,
            averageRating,
            viewCount,
            downloadCount
        });
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

    return (
        <div className="px-[60px] pt-[45px] pb-[30px] min-h-screen bg-[#0d0d0d]">
            {/* Header */}
            <div className="flex items-center justify-between mb-[40px]">
                <div className="flex items-center gap-[16px]">
                    <button 
                        onClick={() => navigate('/dashboard/edu/courses')}
                        className="w-[40px] h-[40px] bg-[#1d1d1d] hover:bg-[#383838] border border-white/10 rounded-[8px] flex items-center justify-center transition-colors"
                    >
                        <ArrowLeft className="size-[20px] text-white" />
                    </button>
                    <div>
                        <h1 className="text-white text-[32px] font-semibold mb-[4px]">Course Analytics</h1>
                        <p className="text-[#888888] text-[16px]">{course.title}</p>
                    </div>
                </div>

                <div className="flex gap-[12px]">
                    <button 
                        onClick={() => navigate(`/dashboard/edu/courses/${courseId}/manage`)}
                        className="flex items-center gap-[8px] bg-[#383838] hover:bg-[#4a4a4a] border border-white/10 text-white px-[20px] py-[12px] rounded-[12px] transition-colors"
                    >
                        <BookOpen className="size-[16px]" />
                        Manage Course
                    </button>
                </div>
            </div>

            {/* Course Overview Card */}
            <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px] mb-[32px]">
                <div className="flex items-start gap-[20px]">
                    <div className="w-[120px] h-[80px] bg-[#383838] rounded-[8px] overflow-hidden flex-shrink-0">
                        {course.thumbnail ? (
                            <img 
                                src={course.thumbnail} 
                                alt={course.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="size-[24px] text-[#888888]" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-white text-[20px] font-semibold mb-[8px]">{course.title}</h2>
                        <p className="text-[#888888] text-[14px] mb-[12px] line-clamp-2">{course.description}</p>
                        <div className="flex items-center gap-[20px]">
                            <div className="flex items-center gap-[4px]">
                                <span className={`px-[8px] py-[4px] rounded-[6px] text-[12px] font-medium ${
                                    course.isPublished 
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                        : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                }`}>
                                    {course.isPublished ? 'Published' : 'Draft'}
                                </span>
                            </div>
                            <span className="text-[#888888] text-[14px]">{course.category}</span>
                            <span className="text-[#888888] text-[14px] capitalize">{course.difficulty}</span>
                            <span className="text-[#e43b58] text-[16px] font-semibold">₹{course.price}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[20px] mb-[32px]">
                <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[20px]">
                    <div className="flex items-center gap-[12px] mb-[12px]">
                        <div className="w-[40px] h-[40px] bg-blue-500/20 rounded-[8px] flex items-center justify-center">
                            <Users className="size-[20px] text-blue-500" />
                        </div>
                        <div>
                            <p className="text-[#888888] text-[12px]">Total Students</p>
                            <p className="text-white text-[24px] font-semibold">{course.enrolledStudents.length}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-[4px]">
                        <TrendingUp className="size-[12px] text-green-500" />
                        <span className="text-green-500 text-[12px]">+12% this month</span>
                    </div>
                </div>

                <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[20px]">
                    <div className="flex items-center gap-[12px] mb-[12px]">
                        <div className="w-[40px] h-[40px] bg-green-500/20 rounded-[8px] flex items-center justify-center">
                            <DollarSign className="size-[20px] text-green-500" />
                        </div>
                        <div>
                            <p className="text-[#888888] text-[12px]">Total Revenue</p>
                            <p className="text-white text-[24px] font-semibold">₹{analyticsData.totalRevenue.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-[4px]">
                        <TrendingUp className="size-[12px] text-green-500" />
                        <span className="text-green-500 text-[12px]">+₹{(course.price * 3).toLocaleString()} this month</span>
                    </div>
                </div>

                <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[20px]">
                    <div className="flex items-center gap-[12px] mb-[12px]">
                        <div className="w-[40px] h-[40px] bg-purple-500/20 rounded-[8px] flex items-center justify-center">
                            <Activity className="size-[20px] text-purple-500" />
                        </div>
                        <div>
                            <p className="text-[#888888] text-[12px]">Completion Rate</p>
                            <p className="text-white text-[24px] font-semibold">{analyticsData.completionRate}%</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-[4px]">
                        <TrendingUp className="size-[12px] text-green-500" />
                        <span className="text-green-500 text-[12px]">+5% this month</span>
                    </div>
                </div>

                <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[20px]">
                    <div className="flex items-center gap-[12px] mb-[12px]">
                        <div className="w-[40px] h-[40px] bg-orange-500/20 rounded-[8px] flex items-center justify-center">
                            <Star className="size-[20px] text-orange-500" />
                        </div>
                        <div>
                            <p className="text-[#888888] text-[12px]">Average Rating</p>
                            <p className="text-white text-[24px] font-semibold">{analyticsData.averageRating}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-[4px]">
                        <Star className="size-[12px] text-orange-500" />
                        <span className="text-[#888888] text-[12px]">Based on 42 reviews</span>
                    </div>
                </div>
            </div>

            {/* Charts and Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px] mb-[32px]">
                {/* Enrollment Trend */}
                <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                    <div className="flex items-center justify-between mb-[20px]">
                        <h3 className="text-white text-[18px] font-semibold">Enrollment Trend</h3>
                        <BarChart3 className="size-[20px] text-[#888888]" />
                    </div>
                    <div className="space-y-[12px]">
                        {analyticsData.enrollmentTrend.map((data, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <span className="text-[#888888] text-[14px] w-[40px]">{data.month}</span>
                                <div className="flex-1 mx-[12px]">
                                    <div className="w-full bg-[#383838] rounded-[4px] h-[8px]">
                                        <div 
                                            className="bg-[#e43b58] h-full rounded-[4px] transition-all duration-300"
                                            style={{ width: `${(data.enrollments / Math.max(...analyticsData.enrollmentTrend.map(d => d.enrollments))) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <span className="text-white text-[14px] w-[30px] text-right">{data.enrollments}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Course Engagement */}
                <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                    <div className="flex items-center justify-between mb-[20px]">
                        <h3 className="text-white text-[18px] font-semibold">Course Engagement</h3>
                        <PieChart className="size-[20px] text-[#888888]" />
                    </div>
                    <div className="space-y-[16px]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-[8px]">
                                <Eye className="size-[16px] text-blue-500" />
                                <span className="text-[#888888] text-[14px]">Total Views</span>
                            </div>
                            <span className="text-white text-[16px] font-medium">{analyticsData.viewCount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-[8px]">
                                <Download className="size-[16px] text-green-500" />
                                <span className="text-[#888888] text-[14px]">Downloads</span>
                            </div>
                            <span className="text-white text-[16px] font-medium">{analyticsData.downloadCount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-[8px]">
                                <Clock className="size-[16px] text-purple-500" />
                                <span className="text-[#888888] text-[14px]">Avg. Watch Time</span>
                            </div>
                            <span className="text-white text-[16px] font-medium">45 min</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-[8px]">
                                <Calendar className="size-[16px] text-orange-500" />
                                <span className="text-[#888888] text-[14px]">Last Updated</span>
                            </div>
                            <span className="text-white text-[16px] font-medium">
                                {new Date(course.updatedAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Student List */}
            <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                <div className="flex items-center justify-between mb-[20px]">
                    <h3 className="text-white text-[18px] font-semibold">Recent Enrollments</h3>
                    <span className="text-[#888888] text-[14px]">{course.enrolledStudents.length} total students</span>
                </div>

                {course.enrolledStudents.length > 0 ? (
                    <div className="space-y-[12px]">
                        {course.enrolledStudents.slice(0, 5).map((enrollment, index) => (
                            <div key={index} className="flex items-center justify-between py-[12px] border-b border-white/5 last:border-b-0">
                                <div className="flex items-center gap-[12px]">
                                    <div className="w-[40px] h-[40px] bg-[#383838] rounded-full flex items-center justify-center">
                                        <span className="text-white text-[14px] font-medium">
                                            {`S${index + 1}`}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-white text-[14px] font-medium">Student {index + 1}</p>
                                        <p className="text-[#888888] text-[12px]">
                                            Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-white text-[14px]">{enrollment.progress || 0}% Complete</p>
                                    <div className="w-[80px] bg-[#383838] rounded-[4px] h-[4px] mt-[4px]">
                                        <div 
                                            className="bg-[#e43b58] h-full rounded-[4px]"
                                            style={{ width: `${enrollment.progress || 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {course.enrolledStudents.length > 5 && (
                            <div className="text-center pt-[12px]">
                                <button className="text-[#e43b58] text-[14px] hover:text-[#c73650] transition-colors">
                                    View all {course.enrolledStudents.length} students
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-[40px]">
                        <Users className="size-[48px] text-[#888888] mx-auto mb-[16px]" />
                        <h4 className="text-white text-[16px] font-medium mb-[4px]">No students enrolled yet</h4>
                        <p className="text-[#888888] text-[14px]">Start promoting your course to get your first students</p>
                    </div>
                )}
            </div>
        </div>
    );
}