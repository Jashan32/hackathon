import { useState, useEffect } from 'react';
import { User, Mail, Lock, Camera, Save, Eye, EyeOff, BookOpen, Bell } from 'lucide-react';

export default function StuSettings() {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        bio: '',
        profilePicture: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [preferencesData, setPreferencesData] = useState({
        emailNotifications: {
            courseUpdates: true,
            assignmentReminders: true,
            newCourses: false,
            promotions: false
        },
        learningGoals: '',
        preferredLanguage: 'english',
        studyReminders: false,
        weeklyGoalHours: 5
    });

    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchUserProfile();
        fetchLearningPreferences();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/auth/me', {
                headers: {
                    'authorization': localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setProfileData({
                    firstName: data.user.firstName || '',
                    lastName: data.user.lastName || '',
                    email: data.user.email || '',
                    bio: data.user.bio || '',
                    profilePicture: data.user.profilePicture || ''
                });
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLearningPreferences = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/auth/learning-preferences', {
                headers: {
                    'authorization': localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPreferencesData(data.preferences);
            }
        } catch (error) {
            console.error('Failed to fetch learning preferences:', error);
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
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

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
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

    const handlePreferencesChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.startsWith('emailNotifications.')) {
            const notificationType = name.split('.')[1];
            setPreferencesData(prev => ({
                ...prev,
                emailNotifications: {
                    ...prev.emailNotifications,
                    [notificationType]: checked
                }
            }));
        } else {
            setPreferencesData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
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
                profilePicture: 'Please select a valid image file'
            }));
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({
                ...prev,
                profilePicture: 'Image size must be less than 5MB'
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
                setProfileData(prev => ({
                    ...prev,
                    profilePicture: `http://localhost:3000${data.url}`
                }));
                setErrors(prev => ({
                    ...prev,
                    profilePicture: ''
                }));
            } else {
                const errorData = await response.json();
                setErrors(prev => ({
                    ...prev,
                    profilePicture: errorData.error || 'Failed to upload image'
                }));
            }
        } catch (error) {
            console.error('Image upload error:', error);
            setErrors(prev => ({
                ...prev,
                profilePicture: 'Network error. Please try again.'
            }));
        } finally {
            setUploadingImage(false);
        }
    };

    const validateProfileForm = () => {
        const newErrors = {};

        if (!profileData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!profileData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        if (!profileData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (profileData.bio && profileData.bio.length > 500) {
            newErrors.bio = 'Bio must be less than 500 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validatePasswordForm = () => {
        const newErrors = {};

        if (!passwordData.currentPassword) {
            newErrors.currentPassword = 'Current password is required';
        }

        if (!passwordData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (passwordData.newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters';
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveProfile = async () => {
        if (!validateProfileForm()) return;

        setSaving(true);
        setSuccessMessage('');
        
        try {
            const response = await fetch('http://localhost:3000/api/auth/update-profile', {
                method: 'PUT',
                headers: {
                    'authorization': localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstName: profileData.firstName,
                    lastName: profileData.lastName,
                    email: profileData.email,
                    bio: profileData.bio,
                    profilePicture: profileData.profilePicture
                })
            });

            if (response.ok) {
                setSuccessMessage('Profile updated successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                const errorData = await response.json();
                setErrors({ submit: errorData.error || 'Failed to update profile' });
            }
        } catch (error) {
            console.error('Profile update error:', error);
            setErrors({ submit: 'Network error. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!validatePasswordForm()) return;

        setSaving(true);
        setSuccessMessage('');
        
        try {
            const response = await fetch('http://localhost:3000/api/auth/change-password', {
                method: 'PUT',
                headers: {
                    'authorization': localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            if (response.ok) {
                setSuccessMessage('Password updated successfully!');
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                const errorData = await response.json();
                setErrors({ submit: errorData.error || 'Failed to update password' });
            }
        } catch (error) {
            console.error('Password update error:', error);
            setErrors({ submit: 'Network error. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    const handleSavePreferences = async () => {
        setSaving(true);
        setSuccessMessage('');
        
        try {
            const response = await fetch('http://localhost:3000/api/auth/learning-preferences', {
                method: 'PUT',
                headers: {
                    'authorization': localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(preferencesData)
            });

            if (response.ok) {
                const data = await response.json();
                setPreferencesData(data.preferences);
                setSuccessMessage('Preferences updated successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                const errorData = await response.json();
                setErrors({ submit: errorData.error || 'Failed to update preferences' });
            }
        } catch (error) {
            console.error('Preferences update error:', error);
            setErrors({ submit: 'Network error. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    const handleResetPreferences = async () => {
        if (!confirm('Are you sure you want to reset all learning preferences to default? This action cannot be undone.')) {
            return;
        }

        setSaving(true);
        setSuccessMessage('');
        
        try {
            const response = await fetch('http://localhost:3000/api/auth/learning-preferences/reset', {
                method: 'POST',
                headers: {
                    'authorization': localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPreferencesData(data.preferences);
                setSuccessMessage('Preferences reset to default successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                const errorData = await response.json();
                setErrors({ submit: errorData.error || 'Failed to reset preferences' });
            }
        } catch (error) {
            console.error('Reset preferences error:', error);
            setErrors({ submit: 'Network error. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="px-[60px] pt-[45px] pb-[30px] min-h-screen bg-[#0d0d0d] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-[40px] h-[40px] border-4 border-white/20 border-t-[#e43b58] rounded-full animate-spin mx-auto mb-[16px]"></div>
                    <p className="text-white">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-[60px] pt-[45px] pb-[30px] min-h-screen bg-[#0d0d0d]">
            {/* Header */}
            <div className="mb-[40px]">
                <h1 className="text-white text-[32px] font-semibold mb-[4px]">Settings</h1>
                <p className="text-[#888888] text-[16px]">Manage your account settings and learning preferences</p>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="mb-[24px] bg-green-500/10 border border-green-500/20 rounded-[12px] p-[16px]">
                    <p className="text-green-400 text-[14px]">✓ {successMessage}</p>
                </div>
            )}

            {/* Error Message */}
            {errors.submit && (
                <div className="mb-[24px] bg-red-500/10 border border-red-500/20 rounded-[12px] p-[16px]">
                    <p className="text-red-400 text-[14px]">{errors.submit}</p>
                </div>
            )}

            <div className="flex gap-[32px]">
                {/* Sidebar Navigation */}
                <div className="w-[250px] flex-shrink-0">
                    <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[8px]">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`w-full flex items-center gap-[12px] px-[16px] py-[12px] rounded-[8px] text-left transition-colors ${
                                activeTab === 'profile' 
                                    ? 'bg-[#e43b58] text-white' 
                                    : 'text-[#888888] hover:text-white hover:bg-[#383838]'
                            }`}
                        >
                            <User className="size-[18px]" />
                            Profile Settings
                        </button>
                        <button
                            onClick={() => setActiveTab('password')}
                            className={`w-full flex items-center gap-[12px] px-[16px] py-[12px] rounded-[8px] text-left transition-colors ${
                                activeTab === 'password' 
                                    ? 'bg-[#e43b58] text-white' 
                                    : 'text-[#888888] hover:text-white hover:bg-[#383838]'
                            }`}
                        >
                            <Lock className="size-[18px]" />
                            Password & Security
                        </button>
                        <button
                            onClick={() => setActiveTab('preferences')}
                            className={`w-full flex items-center gap-[12px] px-[16px] py-[12px] rounded-[8px] text-left transition-colors ${
                                activeTab === 'preferences' 
                                    ? 'bg-[#e43b58] text-white' 
                                    : 'text-[#888888] hover:text-white hover:bg-[#383838]'
                            }`}
                        >
                            <Bell className="size-[18px]" />
                            Learning Preferences
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {activeTab === 'profile' && (
                        <div className="space-y-[24px]">
                            {/* Profile Picture Section */}
                            <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                                <h3 className="text-white text-[20px] font-semibold mb-[24px]">Profile Picture</h3>
                                
                                <div className="flex items-center gap-[24px]">
                                    <div className="relative">
                                        <div className="w-[100px] h-[100px] rounded-full overflow-hidden bg-[#383838] border border-white/10">
                                            {uploadingImage ? (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <div className="w-[30px] h-[30px] border-4 border-white/20 border-t-[#e43b58] rounded-full animate-spin"></div>
                                                </div>
                                            ) : profileData.profilePicture ? (
                                                <img 
                                                    src={profileData.profilePicture} 
                                                    alt="Profile" 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <User className="size-[40px] text-[#888888]" />
                                                </div>
                                            )}
                                        </div>
                                        {!uploadingImage && (
                                            <label className="absolute bottom-0 right-0 w-[32px] h-[32px] bg-[#e43b58] hover:bg-[#c73650] rounded-full flex items-center justify-center cursor-pointer transition-colors">
                                                <Camera className="size-[16px] text-white" />
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                />
                                            </label>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <h4 className="text-white text-[16px] font-medium mb-[4px]">Update Profile Picture</h4>
                                        <p className="text-[#888888] text-[14px] mb-[12px]">
                                            Upload a square image (recommended: 400x400px, max 5MB)
                                        </p>
                                        {!uploadingImage && (
                                            <label className="inline-flex items-center gap-[8px] bg-[#383838] hover:bg-[#4a4a4a] text-white px-[16px] py-[8px] rounded-[8px] cursor-pointer transition-colors">
                                                <Camera className="size-[16px]" />
                                                Choose Image
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                />
                                            </label>
                                        )}
                                        {errors.profilePicture && (
                                            <p className="text-red-400 text-[12px] mt-[8px]">{errors.profilePicture}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Basic Information */}
                            <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                                <h3 className="text-white text-[20px] font-semibold mb-[24px]">Basic Information</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] mb-[20px]">
                                    <div>
                                        <label className="block text-white text-[14px] font-medium mb-[8px]">
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={profileData.firstName}
                                            onChange={handleProfileChange}
                                            className={`w-full bg-[#0d0d0d] border rounded-[8px] px-[16px] py-[12px] text-white placeholder-[#888888] focus:outline-none transition-colors ${
                                                errors.firstName ? 'border-red-500' : 'border-white/10 focus:border-[#e43b58]'
                                            }`}
                                        />
                                        {errors.firstName && <p className="text-red-400 text-[12px] mt-[4px]">{errors.firstName}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-white text-[14px] font-medium mb-[8px]">
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={profileData.lastName}
                                            onChange={handleProfileChange}
                                            className={`w-full bg-[#0d0d0d] border rounded-[8px] px-[16px] py-[12px] text-white placeholder-[#888888] focus:outline-none transition-colors ${
                                                errors.lastName ? 'border-red-500' : 'border-white/10 focus:border-[#e43b58]'
                                            }`}
                                        />
                                        {errors.lastName && <p className="text-red-400 text-[12px] mt-[4px]">{errors.lastName}</p>}
                                    </div>
                                </div>

                                <div className="mb-[20px]">
                                    <label className="block text-white text-[14px] font-medium mb-[8px]">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profileData.email}
                                        onChange={handleProfileChange}
                                        className={`w-full bg-[#0d0d0d] border rounded-[8px] px-[16px] py-[12px] text-white placeholder-[#888888] focus:outline-none transition-colors ${
                                            errors.email ? 'border-red-500' : 'border-white/10 focus:border-[#e43b58]'
                                        }`}
                                    />
                                    {errors.email && <p className="text-red-400 text-[12px] mt-[4px]">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-white text-[14px] font-medium mb-[8px]">
                                        About Me
                                    </label>
                                    <textarea
                                        name="bio"
                                        value={profileData.bio}
                                        onChange={handleProfileChange}
                                        rows={4}
                                        placeholder="Tell others about your learning goals, interests, and background..."
                                        className={`w-full bg-[#0d0d0d] border rounded-[8px] px-[16px] py-[12px] text-white placeholder-[#888888] focus:outline-none transition-colors resize-none ${
                                            errors.bio ? 'border-red-500' : 'border-white/10 focus:border-[#e43b58]'
                                        }`}
                                    />
                                    <div className="flex justify-between items-center mt-[4px]">
                                        {errors.bio && <p className="text-red-400 text-[12px]">{errors.bio}</p>}
                                        <p className="text-[#888888] text-[12px] ml-auto">
                                            {profileData.bio.length}/500 characters
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end mt-[24px]">
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={saving}
                                        className="flex items-center gap-[8px] bg-[#e43b58] hover:bg-[#c73650] disabled:opacity-50 disabled:cursor-not-allowed text-white px-[24px] py-[12px] rounded-[8px] transition-colors"
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
                        </div>
                    )}

                    {activeTab === 'password' && (
                        <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                            <h3 className="text-white text-[20px] font-semibold mb-[24px]">Change Password</h3>
                            
                            <div className="space-y-[20px]">
                                <div>
                                    <label className="block text-white text-[14px] font-medium mb-[8px]">
                                        Current Password *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            name="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            className={`w-full bg-[#0d0d0d] border rounded-[8px] px-[16px] py-[12px] pr-[48px] text-white placeholder-[#888888] focus:outline-none transition-colors ${
                                                errors.currentPassword ? 'border-red-500' : 'border-white/10 focus:border-[#e43b58]'
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-[16px] top-1/2 transform -translate-y-1/2 text-[#888888] hover:text-white transition-colors"
                                        >
                                            {showCurrentPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
                                        </button>
                                    </div>
                                    {errors.currentPassword && <p className="text-red-400 text-[12px] mt-[4px]">{errors.currentPassword}</p>}
                                </div>

                                <div>
                                    <label className="block text-white text-[14px] font-medium mb-[8px]">
                                        New Password *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            className={`w-full bg-[#0d0d0d] border rounded-[8px] px-[16px] py-[12px] pr-[48px] text-white placeholder-[#888888] focus:outline-none transition-colors ${
                                                errors.newPassword ? 'border-red-500' : 'border-white/10 focus:border-[#e43b58]'
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-[16px] top-1/2 transform -translate-y-1/2 text-[#888888] hover:text-white transition-colors"
                                        >
                                            {showNewPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
                                        </button>
                                    </div>
                                    {errors.newPassword && <p className="text-red-400 text-[12px] mt-[4px]">{errors.newPassword}</p>}
                                </div>

                                <div>
                                    <label className="block text-white text-[14px] font-medium mb-[8px]">
                                        Confirm New Password *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            className={`w-full bg-[#0d0d0d] border rounded-[8px] px-[16px] py-[12px] pr-[48px] text-white placeholder-[#888888] focus:outline-none transition-colors ${
                                                errors.confirmPassword ? 'border-red-500' : 'border-white/10 focus:border-[#e43b58]'
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-[16px] top-1/2 transform -translate-y-1/2 text-[#888888] hover:text-white transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <p className="text-red-400 text-[12px] mt-[4px]">{errors.confirmPassword}</p>}
                                </div>

                                <div className="bg-[#0d0d0d] border border-white/10 rounded-[8px] p-[16px]">
                                    <h4 className="text-white text-[14px] font-medium mb-[8px]">Password Requirements:</h4>
                                    <ul className="text-[#888888] text-[12px] space-y-[2px]">
                                        <li>• At least 6 characters long</li>
                                        <li>• Mix of letters and numbers recommended</li>
                                        <li>• Avoid using common passwords</li>
                                    </ul>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={handleChangePassword}
                                        disabled={saving}
                                        className="flex items-center gap-[8px] bg-[#e43b58] hover:bg-[#c73650] disabled:opacity-50 disabled:cursor-not-allowed text-white px-[24px] py-[12px] rounded-[8px] transition-colors"
                                    >
                                        {saving ? (
                                            <div className="w-[16px] h-[16px] border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <Lock className="size-[16px]" />
                                        )}
                                        {saving ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div className="space-y-[24px]">
                            {/* Notification Preferences */}
                            <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                                <h3 className="text-white text-[20px] font-semibold mb-[24px]">Notification Preferences</h3>
                                
                                <div className="space-y-[16px]">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-white text-[16px] font-medium">Course Updates</h4>
                                            <p className="text-[#888888] text-[14px]">Get notified about new lectures and course announcements</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="emailNotifications.courseUpdates"
                                                checked={preferencesData.emailNotifications.courseUpdates}
                                                onChange={handlePreferencesChange}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-[#383838] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e43b58]"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-white text-[16px] font-medium">Assignment Reminders</h4>
                                            <p className="text-[#888888] text-[14px]">Receive reminders about upcoming assignment deadlines</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="emailNotifications.assignmentReminders"
                                                checked={preferencesData.emailNotifications.assignmentReminders}
                                                onChange={handlePreferencesChange}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-[#383838] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e43b58]"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-white text-[16px] font-medium">New Course Recommendations</h4>
                                            <p className="text-[#888888] text-[14px]">Get suggestions for new courses based on your interests</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="emailNotifications.newCourses"
                                                checked={preferencesData.emailNotifications.newCourses}
                                                onChange={handlePreferencesChange}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-[#383838] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e43b58]"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-white text-[16px] font-medium">Promotions & Offers</h4>
                                            <p className="text-[#888888] text-[14px]">Receive emails about discounts and special offers</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="emailNotifications.promotions"
                                                checked={preferencesData.emailNotifications.promotions}
                                                onChange={handlePreferencesChange}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-[#383838] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e43b58]"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-white text-[16px] font-medium">Study Reminders</h4>
                                            <p className="text-[#888888] text-[14px]">Get daily reminders to maintain your learning streak</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="studyReminders"
                                                checked={preferencesData.studyReminders}
                                                onChange={handlePreferencesChange}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-[#383838] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e43b58]"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Learning Preferences */}
                            <div className="bg-[#1d1d1d] border border-white/10 rounded-[12px] p-[24px]">
                                <h3 className="text-white text-[20px] font-semibold mb-[24px]">Learning Preferences</h3>
                                
                                <div className="space-y-[20px]">
                                    <div>
                                        <label className="block text-white text-[14px] font-medium mb-[8px]">
                                            Learning Goals
                                        </label>
                                        <textarea
                                            name="learningGoals"
                                            value={preferencesData.learningGoals}
                                            onChange={handlePreferencesChange}
                                            rows={3}
                                            placeholder="What do you want to achieve with your learning? (e.g., career change, skill improvement, hobby)"
                                            className="w-full bg-[#0d0d0d] border border-white/10 rounded-[8px] px-[16px] py-[12px] text-white placeholder-[#888888] focus:outline-none focus:border-[#e43b58] transition-colors resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-white text-[14px] font-medium mb-[8px]">
                                            Preferred Language
                                        </label>
                                        <select
                                            name="preferredLanguage"
                                            value={preferencesData.preferredLanguage}
                                            onChange={handlePreferencesChange}
                                            className="w-full bg-[#0d0d0d] border border-white/10 rounded-[8px] px-[16px] py-[12px] text-white focus:outline-none focus:border-[#e43b58] transition-colors"
                                        >
                                            <option value="english">English</option>
                                            <option value="spanish">Spanish</option>
                                            <option value="french">French</option>
                                            <option value="german">German</option>
                                            <option value="chinese">Chinese</option>
                                            <option value="japanese">Japanese</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-white text-[14px] font-medium mb-[8px]">
                                            Weekly Learning Goal (Hours)
                                        </label>
                                        <input
                                            type="number"
                                            name="weeklyGoalHours"
                                            value={preferencesData.weeklyGoalHours}
                                            onChange={handlePreferencesChange}
                                            min="0"
                                            max="168"
                                            className="w-full bg-[#0d0d0d] border border-white/10 rounded-[8px] px-[16px] py-[12px] text-white focus:outline-none focus:border-[#e43b58] transition-colors"
                                        />
                                        <p className="text-[#888888] text-[12px] mt-[4px]">
                                            Set your weekly learning time goal (0-168 hours)
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-[24px]">
                                    <button
                                        onClick={handleResetPreferences}
                                        className="flex items-center gap-[8px] bg-[#383838] hover:bg-[#4a4a4a] text-white px-[20px] py-[12px] rounded-[8px] transition-colors"
                                    >
                                        Reset to Default
                                    </button>
                                    <button
                                        onClick={handleSavePreferences}
                                        disabled={saving}
                                        className="flex items-center gap-[8px] bg-[#e43b58] hover:bg-[#c73650] disabled:opacity-50 disabled:cursor-not-allowed text-white px-[24px] py-[12px] rounded-[8px] transition-colors"
                                    >
                                        {saving ? (
                                            <div className="w-[16px] h-[16px] border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <Save className="size-[16px]" />
                                        )}
                                        {saving ? 'Saving...' : 'Save Preferences'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}