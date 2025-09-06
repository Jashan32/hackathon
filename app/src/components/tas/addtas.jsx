import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    UserPlus, 
    Users, 
    BookOpen, 
    Mail,
    User,
    CheckCircle,
    AlertCircle,
    Search,
    Plus
} from 'lucide-react';

export default function AddTas() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [availableStudents, setAvailableStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [newTaName, setNewTaName] = useState('');
    const [newTaEmail, setNewTaEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            fetchAvailableStudents();
        } else {
            setAvailableStudents([]);
            setSelectedStudents([]);
        }
    }, [selectedCourse]);

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
            setErrors({ general: 'Failed to load courses' });
        } finally {
            setLoadingCourses(false);
        }
    };

    const fetchAvailableStudents = async () => {
        if (!selectedCourse) return;
        
        setLoadingStudents(true);
        try {
            const response = await fetch(`http://localhost:3000/api/tas/course/${selectedCourse}/available-students`, {
                headers: {
                    'authorization': localStorage.getItem('token')
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAvailableStudents(data.students);
            }
        } catch (error) {
            console.error('Failed to fetch students:', error);
            setErrors({ students: 'Failed to load students' });
        } finally {
            setLoadingStudents(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!newTaName.trim()) {
            newErrors.name = 'TA name is required';
        } else if (newTaName.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (!newTaEmail.trim()) {
            newErrors.email = 'TA email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newTaEmail)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!selectedCourse) {
            newErrors.course = 'Please select a course';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setErrors({});
        setSuccess('');

        try {
            const response = await fetch('http://localhost:3000/api/tas/assign', {
                method: 'POST',
                headers: {
                    'authorization': localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: newTaName,
                    taEmail: newTaEmail,
                    courseId: selectedCourse,
                    assignedStudents: selectedStudents
                })
            });

            if (response.ok) {
                const data = await response.json();
                setSuccess(`Successfully assigned ${newTaName} as a TA!`);
                
                // Reset form
                setNewTaName('');
                setNewTaEmail('');
                setSelectedCourse('');
                setSelectedStudents([]);
                
                // Redirect after success
                setTimeout(() => {
                    navigate('/dashboard/edu/tas');
                }, 2000);
            } else {
                const errorData = await response.json();
                setErrors({ submit: errorData.error || 'Failed to assign TA' });
            }
        } catch (error) {
            setErrors({ submit: 'Network error. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleStudentToggle = (studentId) => {
        setSelectedStudents(prev => 
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const filteredStudents = availableStudents.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedCourseData = courses.find(course => course._id === selectedCourse);

    if (loadingCourses) {
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
            <div className="flex items-center gap-[16px] mb-[40px]">
                <button 
                    onClick={() => navigate('/dashboard/edu/tas')}
                    className="w-[40px] h-[40px] bg-[#1d1d1d] hover:bg-[#383838] border border-white/10 rounded-[8px] flex items-center justify-center transition-colors"
                >
                    <ArrowLeft className="size-[20px] text-white" />
                </button>
                <div>
                    <h1 className="text-white text-[32px] font-semibold mb-[4px]">Assign Teaching Assistant</h1>
                    <p className="text-[#888888] text-[16px]">Add a new TA to help manage your courses and mentor students</p>
                </div>
            </div>

            {/* Success Message */}
            {success && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-[12px] p-[16px] mb-[32px]">
                    <div className="flex items-center gap-[8px]">
                        <CheckCircle className="size-[20px] text-green-400" />
                        <p className="text-green-400 text-[14px]">{success}</p>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {errors.submit && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-[12px] p-[16px] mb-[32px]">
                    <div className="flex items-center gap-[8px]">
                        <AlertCircle className="size-[20px] text-red-400" />
                        <p className="text-red-400 text-[14px]">{errors.submit}</p>
                    </div>
                </div>
            )}

            <div className="max-w-[800px] mx-auto">
                <form onSubmit={handleAssign} className="space-y-[32px]">
                    {/* TA Information */}
                    <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                        <div className="flex items-center gap-[8px] mb-[20px]">
                            <UserPlus className="size-[20px] text-[#e43b58]" />
                            <h2 className="text-white text-[18px] font-semibold">TA Information</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                            <div>
                                <label className="block text-white text-[14px] font-medium mb-[8px]">
                                    Full Name *
                                </label>
                                <div className="relative">
                                    <User className="absolute left-[16px] top-1/2 transform -translate-y-1/2 size-[16px] text-[#888888]" />
                                    <input
                                        type="text"
                                        value={newTaName}
                                        onChange={(e) => setNewTaName(e.target.value)}
                                        placeholder="Enter TA's full name"
                                        className={`w-full bg-[#0d0d0d] border rounded-[8px] pl-[48px] pr-[16px] py-[12px] text-white placeholder-[#888888] focus:outline-none transition-colors ${
                                            errors.name ? 'border-red-500' : 'border-white/10 focus:border-[#e43b58]'
                                        }`}
                                    />
                                </div>
                                {errors.name && <p className="text-red-400 text-[12px] mt-[4px]">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-white text-[14px] font-medium mb-[8px]">
                                    Email Address *
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-[16px] top-1/2 transform -translate-y-1/2 size-[16px] text-[#888888]" />
                                    <input
                                        type="email"
                                        value={newTaEmail}
                                        onChange={(e) => setNewTaEmail(e.target.value)}
                                        placeholder="Enter TA's email address"
                                        className={`w-full bg-[#0d0d0d] border rounded-[8px] pl-[48px] pr-[16px] py-[12px] text-white placeholder-[#888888] focus:outline-none transition-colors ${
                                            errors.email ? 'border-red-500' : 'border-white/10 focus:border-[#e43b58]'
                                        }`}
                                    />
                                </div>
                                {errors.email && <p className="text-red-400 text-[12px] mt-[4px]">{errors.email}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Course Selection */}
                    <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                        <div className="flex items-center gap-[8px] mb-[20px]">
                            <BookOpen className="size-[20px] text-[#e43b58]" />
                            <h2 className="text-white text-[18px] font-semibold">Course Assignment</h2>
                        </div>
                        
                        <div>
                            <label className="block text-white text-[14px] font-medium mb-[8px]">
                                Select Course *
                            </label>
                            <select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                className={`w-full bg-[#0d0d0d] border rounded-[8px] px-[16px] py-[12px] text-white focus:outline-none transition-colors appearance-none ${
                                    errors.course ? 'border-red-500' : 'border-white/10 focus:border-[#e43b58]'
                                }`}
                            >
                                <option value="">Choose a course to assign TA to</option>
                                {courses.map(course => (
                                    <option key={course._id} value={course._id}>
                                        {course.title} ({course.enrolledStudents?.length || 0} students)
                                    </option>
                                ))}
                            </select>
                            {errors.course && <p className="text-red-400 text-[12px] mt-[4px]">{errors.course}</p>}
                        </div>

                        {selectedCourseData && (
                            <div className="mt-[16px] p-[16px] bg-[#383838]/20 rounded-[8px]">
                                <h4 className="text-white text-[14px] font-medium mb-[8px]">Course Details</h4>
                                <div className="grid grid-cols-2 gap-[12px] text-[12px]">
                                    <div>
                                        <span className="text-[#888888]">Category:</span>
                                        <span className="text-white ml-[8px]">{selectedCourseData.category}</span>
                                    </div>
                                    <div>
                                        <span className="text-[#888888]">Difficulty:</span>
                                        <span className="text-white ml-[8px] capitalize">{selectedCourseData.difficulty}</span>
                                    </div>
                                    <div>
                                        <span className="text-[#888888]">Students:</span>
                                        <span className="text-white ml-[8px]">{selectedCourseData.enrolledStudents?.length || 0}</span>
                                    </div>
                                    <div>
                                        <span className="text-[#888888]">Price:</span>
                                        <span className="text-white ml-[8px]">${selectedCourseData.price}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Student Assignment */}
                    {selectedCourse && (
                        <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                            <div className="flex items-center gap-[8px] mb-[20px]">
                                <Users className="size-[20px] text-[#e43b58]" />
                                <h2 className="text-white text-[18px] font-semibold">Student Assignment (Optional)</h2>
                            </div>
                            
                            <p className="text-[#888888] text-[14px] mb-[16px]">
                                Select specific students for this TA to mentor. You can skip this and assign students later.
                            </p>

                            {loadingStudents ? (
                                <div className="flex items-center justify-center py-[40px]">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e43b58]"></div>
                                </div>
                            ) : availableStudents.length > 0 ? (
                                <>
                                    {/* Search Students */}
                                    <div className="relative mb-[16px]">
                                        <Search className="absolute left-[16px] top-1/2 transform -translate-y-1/2 size-[16px] text-[#888888]" />
                                        <input
                                            type="text"
                                            placeholder="Search students..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full bg-[#0d0d0d] border border-white/10 rounded-[8px] pl-[48px] pr-[16px] py-[12px] text-white placeholder-[#888888] focus:border-[#e43b58] focus:outline-none transition-colors"
                                        />
                                    </div>

                                    {/* Students List */}
                                    <div className="max-h-[300px] overflow-y-auto space-y-[8px]">
                                        <div className="flex items-center justify-between p-[12px] bg-[#383838]/30 rounded-[8px] mb-[8px]">
                                            <span className="text-white text-[14px] font-medium">
                                                {selectedStudents.length} of {filteredStudents.length} students selected
                                            </span>
                                            {filteredStudents.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const allIds = filteredStudents.map(s => s.id);
                                                        setSelectedStudents(
                                                            selectedStudents.length === allIds.length ? [] : allIds
                                                        );
                                                    }}
                                                    className="text-[#e43b58] text-[12px] hover:text-[#c73650] transition-colors"
                                                >
                                                    {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
                                                </button>
                                            )}
                                        </div>

                                        {filteredStudents.map(student => (
                                            <label 
                                                key={student.id} 
                                                className="flex items-center gap-[12px] p-[12px] bg-[#383838]/20 rounded-[8px] cursor-pointer hover:bg-[#383838]/40 transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStudents.includes(student.id)}
                                                    onChange={() => handleStudentToggle(student.id)}
                                                    className="w-[16px] h-[16px] bg-[#0d0d0d] border border-white/10 rounded-[4px] checked:bg-[#e43b58] checked:border-[#e43b58]"
                                                />
                                                <div className="w-[32px] h-[32px] bg-[#383838] rounded-full flex items-center justify-center">
                                                    <span className="text-white text-[12px] font-medium">
                                                        {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-white text-[14px] font-medium">{student.name}</p>
                                                    <p className="text-[#888888] text-[12px]">
                                                        {student.email} • {student.progress}% progress
                                                    </p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-[40px]">
                                    <Users className="size-[48px] text-[#888888] mx-auto mb-[16px]" />
                                    <p className="text-[#888888] text-[14px]">No students enrolled in this course yet</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-[16px] justify-end">
                        <button 
                            type="button"
                            onClick={() => navigate('/dashboard/edu/tas')}
                            className="bg-[#383838] hover:bg-[#4a4a4a] text-white px-[24px] py-[12px] rounded-[8px] transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="bg-[#e43b58] hover:bg-[#c73650] disabled:opacity-50 disabled:cursor-not-allowed text-white px-[24px] py-[12px] rounded-[8px] transition-colors flex items-center gap-[8px]"
                        >
                            {loading ? (
                                <>
                                    <div className="w-[16px] h-[16px] border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    Assigning...
                                </>
                            ) : (
                                <>
                                    <Plus className="size-[16px]" />
                                    Assign TA
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}