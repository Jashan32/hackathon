import { useState, useEffect } from 'react';
import { User, Mail, Lock, Camera, Save, Eye, EyeOff, Briefcase, Bell, Star } from 'lucide-react';

export default function IndSettings() {
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
        profilePicture: '',
        expertise: '',
        company: '',
        experience: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [preferencesData, setPreferencesData] = useState({
        emailNotifications: {
            newCourses: true,
            ratingRequests: true,
            industryUpdates: true,
            platformUpdates: false
        },
        expertise: '',
        preferredLanguage: 'english',
        ratingReminders: true
    });

    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    const tabs = [
        { id: 'profile', name: 'Profile', icon: User },
        { id: 'password', name: 'Password', icon: Lock },
        { id: 'preferences', name: 'Preferences', icon: Bell }
    ];

    useEffect(() => {
        fetchUserProfile();
        fetchPreferences();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/auth/me`, {
                headers: {
                    'authorization': localStorage.getItem('token')
                }
            });
            if (response.ok) {
                const data = await response.json();
                setProfileData({
                    firstName: data.user.firstName || '',
                    lastName: data.user.lastName || '',
                    email: data.user.email || '',
                    bio: data.user.bio || '',
                    profilePicture: data.user.profilePicture || '',
                    expertise: data.user.expertise || '',
                    company: data.user.company || '',
                    experience: data.user.experience || ''
                });
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPreferences = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/auth/preferences`, {
                headers: {
                    'authorization': localStorage.getItem('token')
                }
            });
            if (response.ok) {
                const data = await response.json();
                setPreferencesData(prev => ({
                    ...prev,
                    ...data.preferences
                }));
            }
        } catch (error) {
            console.error('Failed to fetch preferences:', error);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        setSuccessMessage('');

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/auth/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('token')
                },
                body: JSON.stringify(profileData)
            });

            if (response.ok) {
                setSuccessMessage('Profile updated successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                const data = await response.json();
                setErrors({ profile: data.error || 'Failed to update profile' });
            }
        } catch (error) {
            setErrors({ profile: 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        setSuccessMessage('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setErrors({ password: 'New passwords do not match' });
            setSaving(false);
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('token')
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            if (response.ok) {
                setSuccessMessage('Password updated successfully!');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                const data = await response.json();
                setErrors({ password: data.error || 'Failed to update password' });
            }
        } catch (error) {
            setErrors({ password: 'Failed to update password' });
        } finally {
            setSaving(false);
        }
    };

    const handlePreferencesUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        setSuccessMessage('');

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/auth/update-preferences`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('token')
                },
                body: JSON.stringify(preferencesData)
            });

            if (response.ok) {
                setSuccessMessage('Preferences updated successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                const data = await response.json();
                setErrors({ preferences: data.error || 'Failed to update preferences' });
            }
        } catch (error) {
            setErrors({ preferences: 'Failed to update preferences' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-screen">
                <div className="text-white text-lg">Loading settings...</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <Briefcase className="size-8 text-[#7848ff]" />
                    <h1 className="text-2xl font-bold text-white">Industry Expert Settings</h1>
                </div>
                <p className="text-gray-400">Manage your profile and preferences</p>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400">
                    {successMessage}
                </div>
            )}

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
                {activeTab === 'profile' && (
                    <div className="bg-[#1a1a1a] rounded-lg border border-white/10 p-6">
                        <h3 className="text-lg font-semibold text-white mb-6">Profile Information</h3>
                        
                        {errors.profile && (
                            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
                                {errors.profile}
                            </div>
                        )}

                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                            {/* Profile Picture */}
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <div className="size-24 bg-[#222222] rounded-full flex items-center justify-center overflow-hidden">
                                        {profileData.profilePicture ? (
                                            <img 
                                                src={profileData.profilePicture} 
                                                alt="Profile" 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="size-12 text-gray-400" />
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        className="absolute bottom-0 right-0 p-2 bg-[#7848ff] rounded-full hover:bg-[#593cbc] transition-colors"
                                        disabled={uploadingImage}
                                    >
                                        <Camera className="size-4 text-white" />
                                    </button>
                                </div>
                                <div>
                                    <h4 className="text-white font-medium">Profile Picture</h4>
                                    <p className="text-gray-400 text-sm">Upload a professional headshot</p>
                                </div>
                            </div>

                            {/* Basic Information */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.firstName}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                                        className="w-full px-3 py-2 bg-[#222222] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#7848ff]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.lastName}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                                        className="w-full px-3 py-2 bg-[#222222] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#7848ff]"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full px-3 py-2 bg-[#222222] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#7848ff]"
                                    required
                                />
                            </div>

                            {/* Professional Information */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Company/Organization
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.company}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                                        className="w-full px-3 py-2 bg-[#222222] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#7848ff]"
                                        placeholder="Your current company"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Years of Experience
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.experience}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, experience: e.target.value }))}
                                        className="w-full px-3 py-2 bg-[#222222] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#7848ff]"
                                        placeholder="e.g., 5+ years"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Areas of Expertise
                                </label>
                                <input
                                    type="text"
                                    value={profileData.expertise}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, expertise: e.target.value }))}
                                    className="w-full px-3 py-2 bg-[#222222] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#7848ff]"
                                    placeholder="e.g., Software Engineering, Data Science, Product Management"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Professional Bio
                                </label>
                                <textarea
                                    value={profileData.bio}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                                    className="w-full h-32 px-3 py-2 bg-[#222222] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#7848ff] resize-none"
                                    placeholder="Brief description of your professional background and expertise..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-3 bg-[#7848ff] hover:bg-[#593cbc] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Save className="size-4" />
                                {saving ? 'Saving...' : 'Save Profile'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'password' && (
                    <div className="bg-[#1a1a1a] rounded-lg border border-white/10 p-6">
                        <h3 className="text-lg font-semibold text-white mb-6">Change Password</h3>
                        
                        {errors.password && (
                            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
                                {errors.password}
                            </div>
                        )}

                        <form onSubmit={handlePasswordUpdate} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                        className="w-full px-3 py-2 pr-10 bg-[#222222] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#7848ff]"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                    >
                                        {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                        className="w-full px-3 py-2 pr-10 bg-[#222222] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#7848ff]"
                                        required
                                        minLength="6"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                    >
                                        {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        className="w-full px-3 py-2 pr-10 bg-[#222222] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#7848ff]"
                                        required
                                        minLength="6"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                    >
                                        {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-3 bg-[#7848ff] hover:bg-[#593cbc] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Lock className="size-4" />
                                {saving ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'preferences' && (
                    <div className="bg-[#1a1a1a] rounded-lg border border-white/10 p-6">
                        <h3 className="text-lg font-semibold text-white mb-6">Notification Preferences</h3>
                        
                        {errors.preferences && (
                            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
                                {errors.preferences}
                            </div>
                        )}

                        <form onSubmit={handlePreferencesUpdate} className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="text-white font-medium">Email Notifications</h4>
                                
                                <div className="space-y-3">
                                    <label className="flex items-center justify-between">
                                        <div>
                                            <span className="text-white">New Courses</span>
                                            <p className="text-gray-400 text-sm">Get notified when new courses are added</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={preferencesData.emailNotifications.newCourses}
                                            onChange={(e) => setPreferencesData(prev => ({
                                                ...prev,
                                                emailNotifications: {
                                                    ...prev.emailNotifications,
                                                    newCourses: e.target.checked
                                                }
                                            }))}
                                            className="w-4 h-4 text-[#7848ff] bg-[#222222] border-gray-600 rounded focus:ring-[#7848ff]"
                                        />
                                    </label>

                                    <label className="flex items-center justify-between">
                                        <div>
                                            <span className="text-white">Rating Requests</span>
                                            <p className="text-gray-400 text-sm">Reminders to rate courses you haven't reviewed</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={preferencesData.emailNotifications.ratingRequests}
                                            onChange={(e) => setPreferencesData(prev => ({
                                                ...prev,
                                                emailNotifications: {
                                                    ...prev.emailNotifications,
                                                    ratingRequests: e.target.checked
                                                }
                                            }))}
                                            className="w-4 h-4 text-[#7848ff] bg-[#222222] border-gray-600 rounded focus:ring-[#7848ff]"
                                        />
                                    </label>

                                    <label className="flex items-center justify-between">
                                        <div>
                                            <span className="text-white">Industry Updates</span>
                                            <p className="text-gray-400 text-sm">Updates about industry trends and insights</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={preferencesData.emailNotifications.industryUpdates}
                                            onChange={(e) => setPreferencesData(prev => ({
                                                ...prev,
                                                emailNotifications: {
                                                    ...prev.emailNotifications,
                                                    industryUpdates: e.target.checked
                                                }
                                            }))}
                                            className="w-4 h-4 text-[#7848ff] bg-[#222222] border-gray-600 rounded focus:ring-[#7848ff]"
                                        />
                                    </label>

                                    <label className="flex items-center justify-between">
                                        <div>
                                            <span className="text-white">Platform Updates</span>
                                            <p className="text-gray-400 text-sm">News about platform features and updates</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={preferencesData.emailNotifications.platformUpdates}
                                            onChange={(e) => setPreferencesData(prev => ({
                                                ...prev,
                                                emailNotifications: {
                                                    ...prev.emailNotifications,
                                                    platformUpdates: e.target.checked
                                                }
                                            }))}
                                            className="w-4 h-4 text-[#7848ff] bg-[#222222] border-gray-600 rounded focus:ring-[#7848ff]"
                                        />
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Preferred Language
                                </label>
                                <select
                                    value={preferencesData.preferredLanguage}
                                    onChange={(e) => setPreferencesData(prev => ({ ...prev, preferredLanguage: e.target.value }))}
                                    className="w-full px-3 py-2 bg-[#222222] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#7848ff]"
                                >
                                    <option value="english">English</option>
                                    <option value="spanish">Spanish</option>
                                    <option value="french">French</option>
                                    <option value="german">German</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-3 bg-[#7848ff] hover:bg-[#593cbc] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Save className="size-4" />
                                {saving ? 'Saving...' : 'Save Preferences'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
