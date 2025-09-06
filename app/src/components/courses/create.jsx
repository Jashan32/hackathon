import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, ImageIcon, Plus, X, Save } from 'lucide-react';

export default function CreateCourse() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        difficulty: '',
        price: '',
        thumbnail: ''
    });
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [errors, setErrors] = useState({});

    const categories = [
        'Programming', 'Design', 'Business', 'Marketing', 
        'Photography', 'Music', 'Health & Fitness', 'Language',
        'Personal Development', 'Technology', 'Science', 'Arts'
    ];

    const difficulties = ['beginner', 'intermediate', 'advanced'];

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

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setErrors(prev => ({
                ...prev,
                thumbnail: 'Please select a valid image file'
            }));
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({
                ...prev,
                thumbnail: 'Image size must be less than 5MB'
            }));
            return;
        }

        setUploadingImage(true);
        
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('http://localhost:3000/api/upload/image', {
                method: 'POST',
                headers: {
                    'authorization': localStorage.getItem('token')
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                setFormData(prev => ({
                    ...prev,
                    thumbnail: `http://localhost:3000${data.url}`
                }));
                // Clear any previous errors
                setErrors(prev => ({
                    ...prev,
                    thumbnail: ''
                }));
            } else {
                const errorData = await response.json();
                setErrors(prev => ({
                    ...prev,
                    thumbnail: errorData.error || 'Failed to upload image'
                }));
            }
        } catch (error) {
            console.error('Image upload error:', error);
            setErrors(prev => ({
                ...prev,
                thumbnail: 'Network error. Please try again.'
            }));
        } finally {
            setUploadingImage(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Course title is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Course description is required';
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
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/courses/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('token')
                },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price)
                })
            });

            if (response.ok) {
                const data = await response.json();
                // Redirect to manage course to add curriculum
                navigate(`/dashboard/edu/courses/${data.course._id}/manage`);
            } else {
                const errorData = await response.json();
                setErrors({ submit: errorData.error || 'Failed to create course' });
            }
        } catch (error) {
            setErrors({ submit: 'Network error. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

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
                        <h1 className="text-white text-[32px] font-semibold mb-[4px]">Create New Course</h1>
                        <p className="text-[#888888] text-[16px]">Share your knowledge and build your student community</p>
                    </div>
                </div>

                <div className="flex gap-[12px]">
                    <button 
                        onClick={() => navigate('/dashboard/edu/courses')}
                        className="flex items-center gap-[8px] bg-[#383838] hover:bg-[#4a4a4a] border border-white/10 text-white px-[20px] py-[12px] rounded-[12px] transition-colors"
                    >
                        <X className="size-[16px]" />
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-[8px] bg-[#e43b58] hover:bg-[#c73650] disabled:opacity-50 disabled:cursor-not-allowed text-white px-[20px] py-[12px] rounded-[12px] transition-colors"
                    >
                        {loading ? (
                            <div className="w-[16px] h-[16px] border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Save className="size-[16px]" />
                        )}
                        {loading ? 'Creating...' : 'Create Course'}
                    </button>
                </div>
            </div>

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
                                    rows="4"
                                    className={`w-full bg-[#0d0d0d] border rounded-[8px] px-[16px] py-[12px] text-white placeholder-[#888888] focus:outline-none transition-colors resize-none ${
                                        errors.description ? 'border-red-500' : 'border-white/10 focus:border-[#e43b58]'
                                    }`}
                                />
                                {errors.description && <p className="text-red-400 text-[12px] mt-[4px]">{errors.description}</p>}
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
                                    Course Price (USD) *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-[16px] top-1/2 transform -translate-y-1/2 text-[#888888] text-[16px]">$</span>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        min="0"
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
                            {uploadingImage ? (
                                <div className="space-y-[16px]">
                                    <div className="w-[80px] h-[80px] bg-[#383838] rounded-full flex items-center justify-center mx-auto">
                                        <div className="w-[40px] h-[40px] border-4 border-white/20 border-t-[#e43b58] rounded-full animate-spin"></div>
                                    </div>
                                    <div>
                                        <h3 className="text-white text-[16px] font-medium mb-[4px]">Uploading Image...</h3>
                                        <p className="text-[#888888] text-[14px]">Please wait while we upload your thumbnail</p>
                                    </div>
                                </div>
                            ) : formData.thumbnail ? (
                                <div className="space-y-[16px]">
                                    <img 
                                        src={formData.thumbnail} 
                                        alt="Course thumbnail preview" 
                                        className="w-[200px] h-[120px] object-cover rounded-[8px] mx-auto border border-white/10"
                                    />
                                    <div className="space-y-[8px]">
                                        <p className="text-green-400 text-[14px]">✓ Thumbnail uploaded successfully</p>
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
                                            Recommended: 1280x720 pixels (16:9 aspect ratio), Max 5MB
                                        </p>
                                    </div>
                                </div>
                            )}
                            
                            {!uploadingImage && (
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
                            )}
                            
                            {errors.thumbnail && (
                                <p className="text-red-400 text-[12px] mt-[8px]">{errors.thumbnail}</p>
                            )}
                        </div>
                    </div>

                    {/* Next Steps Preview */}
                    <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                        <h2 className="text-white text-[20px] font-semibold mb-[16px]">What's Next?</h2>
                        <div className="space-y-[12px]">
                            <div className="flex items-center gap-[12px] text-[#888888] text-[14px]">
                                <div className="w-[6px] h-[6px] bg-[#e43b58] rounded-full"></div>
                                <span>Add lectures and course content</span>
                            </div>
                            <div className="flex items-center gap-[12px] text-[#888888] text-[14px]">
                                <div className="w-[6px] h-[6px] bg-[#e43b58] rounded-full"></div>
                                <span>Upload course materials and documents</span>
                            </div>
                            <div className="flex items-center gap-[12px] text-[#888888] text-[14px]">
                                <div className="w-[6px] h-[6px] bg-[#e43b58] rounded-full"></div>
                                <span>Set up assignments and assessments</span>
                            </div>
                            <div className="flex items-center gap-[12px] text-[#888888] text-[14px]">
                                <div className="w-[6px] h-[6px] bg-[#e43b58] rounded-full"></div>
                                <span>Publish your course to start enrolling students</span>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
