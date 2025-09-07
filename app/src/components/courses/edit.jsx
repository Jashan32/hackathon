import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, Upload, ImageIcon, Trash2 } from 'lucide-react';

export default function EditCourse() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        difficulty: '',
        price: '',
        thumbnail: ''
    });
    const [originalData, setOriginalData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [hasChanges, setHasChanges] = useState(false);

    const categories = [
        'Programming', 'Design', 'Business', 'Marketing', 
        'Photography', 'Music', 'Health & Fitness', 'Language',
        'Personal Development', 'Technology', 'Science', 'Arts'
    ];

    const difficulties = ['beginner', 'intermediate', 'advanced'];

    useEffect(() => {
        fetchCourse();
    }, [courseId]);

    useEffect(() => {
        // Check if form data has changed from original
        const dataChanged = Object.keys(formData).some(key => {
            if (key === 'price') {
                return parseFloat(formData[key]) !== originalData[key];
            }
            return formData[key] !== originalData[key];
        });
        setHasChanges(dataChanged);
    }, [formData, originalData]);

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
                const courseData = {
                    title: data.course.title,
                    description: data.course.description,
                    category: data.course.category,
                    difficulty: data.course.difficulty,
                    price: data.course.price.toString(),
                    thumbnail: data.course.thumbnail || ''
                };
                setFormData(courseData);
                setOriginalData({
                    ...courseData,
                    price: data.course.price // Keep original price as number for comparison
                });
            } else {
                navigate('/dashboard/edu/courses');
            }
        } catch (error) {
            console.error('Failed to fetch course:', error);
            navigate('/dashboard/edu/courses');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({
                    ...prev,
                    thumbnail: 'Image size must be less than 5MB'
                }));
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({
                    ...prev,
                    thumbnail: 'Please select a valid image file'
                }));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setFormData(prev => ({
                    ...prev,
                    thumbnail: e.target.result
                }));
                setErrors(prev => ({
                    ...prev,
                    thumbnail: ''
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Course title is required';
        } else if (formData.title.length < 3) {
            newErrors.title = 'Title must be at least 3 characters long';
        } else if (formData.title.length > 100) {
            newErrors.title = 'Title must be less than 100 characters';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Course description is required';
        } else if (formData.description.length < 50) {
            newErrors.description = 'Description must be at least 50 characters long';
        } else if (formData.description.length > 2000) {
            newErrors.description = 'Description must be less than 2000 characters';
        }

        if (!formData.category) {
            newErrors.category = 'Please select a category';
        }

        if (!formData.difficulty) {
            newErrors.difficulty = 'Please select a difficulty level';
        }

        if (!formData.price.trim()) {
            newErrors.price = 'Price is required';
        } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
            newErrors.price = 'Please enter a valid price';
        } else if (parseFloat(formData.price) > 999999) {
            newErrors.price = 'Price cannot exceed ₹999,999';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setSaving(true);
        try {
            const response = await fetch(`http://localhost:3000/api/courses/${courseId}`, {
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
                navigate(`/dashboard/edu/courses/${courseId}/manage`);
            } else {
                const errorData = await response.json();
                setErrors({ submit: errorData.error || 'Failed to update course' });
            }
        } catch (error) {
            setErrors({ submit: 'Network error. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (hasChanges) {
            if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                navigate(`/dashboard/edu/courses/${courseId}/manage`);
            }
        } else {
            navigate(`/dashboard/edu/courses/${courseId}/manage`);
        }
    };

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset all changes?')) {
            setFormData({
                title: originalData.title,
                description: originalData.description,
                category: originalData.category,
                difficulty: originalData.difficulty,
                price: originalData.price.toString(),
                thumbnail: originalData.thumbnail
            });
            setErrors({});
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
            <div className="flex items-center justify-between mb-[40px]">
                <div className="flex items-center gap-[16px]">
                    <button 
                        onClick={handleCancel}
                        className="w-[40px] h-[40px] bg-[#1d1d1d] hover:bg-[#383838] border border-white/10 rounded-[8px] flex items-center justify-center transition-colors"
                    >
                        <ArrowLeft className="size-[20px] text-white" />
                    </button>
                    <div>
                        <h1 className="text-white text-[32px] font-semibold mb-[4px]">Edit Course</h1>
                        <p className="text-[#888888] text-[16px]">Update your course information and settings</p>
                    </div>
                </div>

                <div className="flex gap-[12px]">
                    {hasChanges && (
                        <button 
                            onClick={handleReset}
                            className="flex items-center gap-[8px] bg-[#383838] hover:bg-[#4a4a4a] border border-white/10 text-white px-[20px] py-[12px] rounded-[12px] transition-colors"
                        >
                            <Trash2 className="size-[16px]" />
                            Reset Changes
                        </button>
                    )}
                    <button 
                        onClick={handleCancel}
                        className="flex items-center gap-[8px] bg-[#383838] hover:bg-[#4a4a4a] border border-white/10 text-white px-[20px] py-[12px] rounded-[12px] transition-colors"
                    >
                        <X className="size-[16px]" />
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={saving || !hasChanges}
                        className="flex items-center gap-[8px] bg-[#e43b58] hover:bg-[#c73650] disabled:opacity-50 disabled:cursor-not-allowed text-white px-[20px] py-[12px] rounded-[12px] transition-colors"
                    >
                        {saving ? (
                            <div className="w-[16px] h-[16px] border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Save className="size-[16px]" />
                        )}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Change Indicator */}
            {hasChanges && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-[12px] p-[16px] mb-[32px]">
                    <p className="text-blue-400 text-[14px]">
                        You have unsaved changes. Don't forget to save your updates!
                    </p>
                </div>
            )}

            {/* Form */}
            <div className="max-w-[800px] mx-auto">
                <form onSubmit={handleSubmit} className="space-y-[32px]">
                    {/* Error Message */}
                    {errors.submit && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-[12px] p-[16px]">
                            <p className="text-red-400 text-[14px]">{errors.submit}</p>
                        </div>
                    )}

                    {/* Basic Information */}
                    <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                        <h2 className="text-white text-[20px] font-semibold mb-[24px]">Basic Information</h2>
                        
                        <div className="space-y-[20px]">
                            {/* Course Title */}
                            <div>
                                <label className="block text-white text-[14px] font-medium mb-[8px]">
                                    Course Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter a clear and descriptive course title"
                                    className={`w-full bg-[#0d0d0d] border rounded-[8px] px-[16px] py-[12px] text-white placeholder-[#888888] focus:outline-none transition-colors ${
                                        errors.title ? 'border-red-500' : 'border-white/10 focus:border-[#e43b58]'
                                    }`}
                                />
                                {errors.title && <p className="text-red-400 text-[12px] mt-[4px]">{errors.title}</p>}
                                <p className="text-[#888888] text-[12px] mt-[4px]">
                                    {formData.title.length}/100 characters
                                </p>
                            </div>

                            {/* Course Description */}
                            <div>
                                <label className="block text-white text-[14px] font-medium mb-[8px]">
                                    Course Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe what students will learn in this course, what skills they'll gain, and what makes your course unique"
                                    rows="5"
                                    className={`w-full bg-[#0d0d0d] border rounded-[8px] px-[16px] py-[12px] text-white placeholder-[#888888] focus:outline-none transition-colors resize-none ${
                                        errors.description ? 'border-red-500' : 'border-white/10 focus:border-[#e43b58]'
                                    }`}
                                />
                                {errors.description && <p className="text-red-400 text-[12px] mt-[4px]">{errors.description}</p>}
                                <p className="text-[#888888] text-[12px] mt-[4px]">
                                    {formData.description.length}/2000 characters (minimum 50)
                                </p>
                            </div>

                            {/* Category and Difficulty */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                                <div>
                                    <label className="block text-white text-[14px] font-medium mb-[8px]">
                                        Category *
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className={`w-full bg-[#0d0d0d] border rounded-[8px] px-[16px] py-[12px] text-white focus:outline-none transition-colors appearance-none ${
                                            errors.category ? 'border-red-500' : 'border-white/10 focus:border-[#e43b58]'
                                        }`}
                                    >
                                        <option value="" className="bg-[#0d0d0d]">Select a category</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat} className="bg-[#0d0d0d]">{cat}</option>
                                        ))}
                                    </select>
                                    {errors.category && <p className="text-red-400 text-[12px] mt-[4px]">{errors.category}</p>}
                                </div>

                                <div>
                                    <label className="block text-white text-[14px] font-medium mb-[8px]">
                                        Difficulty Level *
                                    </label>
                                    <select
                                        name="difficulty"
                                        value={formData.difficulty}
                                        onChange={handleInputChange}
                                        className={`w-full bg-[#0d0d0d] border rounded-[8px] px-[16px] py-[12px] text-white focus:outline-none transition-colors appearance-none ${
                                            errors.difficulty ? 'border-red-500' : 'border-white/10 focus:border-[#e43b58]'
                                        }`}
                                    >
                                        <option value="" className="bg-[#0d0d0d]">Select difficulty</option>
                                        {difficulties.map(diff => (
                                            <option key={diff} value={diff} className="bg-[#0d0d0d]">
                                                {diff.charAt(0).toUpperCase() + diff.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.difficulty && <p className="text-red-400 text-[12px] mt-[4px]">{errors.difficulty}</p>}
                                </div>
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-white text-[14px] font-medium mb-[8px]">
                                    Course Price (INR) *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-[16px] top-1/2 transform -translate-y-1/2 text-[#888888] text-[16px]">₹</span>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        min="0"
                                        max="999999"
                                        step="0.01"
                                        className={`w-full bg-[#0d0d0d] border rounded-[8px] pl-[40px] pr-[16px] py-[12px] text-white placeholder-[#888888] focus:outline-none transition-colors ${
                                            errors.price ? 'border-red-500' : 'border-white/10 focus:border-[#e43b58]'
                                        }`}
                                    />
                                </div>
                                {errors.price && <p className="text-red-400 text-[12px] mt-[4px]">{errors.price}</p>}
                                <p className="text-[#888888] text-[12px] mt-[4px]">Set to 0 to make this a free course</p>
                            </div>
                        </div>
                    </div>

                    {/* Course Thumbnail */}
                    <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                        <h2 className="text-white text-[20px] font-semibold mb-[24px]">Course Thumbnail</h2>
                        
                        <div className="border-2 border-dashed border-white/20 rounded-[12px] p-[32px] text-center">
                            {formData.thumbnail ? (
                                <div className="space-y-[16px]">
                                    <img 
                                        src={formData.thumbnail} 
                                        alt="Course thumbnail preview" 
                                        className="w-[200px] h-[120px] object-cover rounded-[8px] mx-auto"
                                    />
                                    <div className="space-y-[8px]">
                                        <p className="text-white text-[14px]">Thumbnail uploaded successfully</p>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, thumbnail: '' }))}
                                            className="text-red-400 hover:text-red-300 text-[12px] transition-colors"
                                        >
                                            Remove Image
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-[16px]">
                                    <div className="w-[80px] h-[80px] bg-[#383838] rounded-full flex items-center justify-center mx-auto">
                                        <ImageIcon className="size-[40px] text-[#888888]" />
                                    </div>
                                    <div>
                                        <h3 className="text-white text-[16px] font-medium mb-[4px]">Upload Course Thumbnail</h3>
                                        <p className="text-[#888888] text-[14px] mb-[16px]">
                                            Recommended: 1280x720 pixels (16:9 aspect ratio), Max size: 5MB
                                        </p>
                                    </div>
                                </div>
                            )}
                            
                            <label className="inline-flex items-center gap-[8px] bg-[#383838] hover:bg-[#4a4a4a] text-white px-[20px] py-[12px] rounded-[8px] cursor-pointer transition-colors">
                                <Upload className="size-[16px]" />
                                {formData.thumbnail ? 'Change Thumbnail' : 'Upload Thumbnail'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>
                            {errors.thumbnail && <p className="text-red-400 text-[12px] mt-[8px]">{errors.thumbnail}</p>}
                        </div>
                    </div>

                    {/* Preview Changes */}
                    {hasChanges && (
                        <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                            <h2 className="text-white text-[20px] font-semibold mb-[16px]">Preview Changes</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px] text-[14px]">
                                {formData.title !== originalData.title && (
                                    <div>
                                        <p className="text-[#888888] mb-[4px]">Title:</p>
                                        <p className="text-red-400 mb-[2px]">- {originalData.title}</p>
                                        <p className="text-green-400">+ {formData.title}</p>
                                    </div>
                                )}
                                {parseFloat(formData.price) !== originalData.price && (
                                    <div>
                                        <p className="text-[#888888] mb-[4px]">Price:</p>
                                        <p className="text-red-400 mb-[2px]">- ₹{originalData.price}</p>
                                        <p className="text-green-400">+ ₹{formData.price}</p>
                                    </div>
                                )}
                                {formData.category !== originalData.category && (
                                    <div>
                                        <p className="text-[#888888] mb-[4px]">Category:</p>
                                        <p className="text-red-400 mb-[2px]">- {originalData.category}</p>
                                        <p className="text-green-400">+ {formData.category}</p>
                                    </div>
                                )}
                                {formData.difficulty !== originalData.difficulty && (
                                    <div>
                                        <p className="text-[#888888] mb-[4px]">Difficulty:</p>
                                        <p className="text-red-400 mb-[2px]">- {originalData.difficulty}</p>
                                        <p className="text-green-400">+ {formData.difficulty}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}