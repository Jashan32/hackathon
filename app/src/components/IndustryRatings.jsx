import { useState, useEffect } from 'react';
import { Star, Briefcase, Users, TrendingUp, Award, Target, BarChart3 } from 'lucide-react';

export default function IndustryRatings({ courseId }) {
    const [ratings, setRatings] = useState([]);
    const [averages, setAverages] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAllReviews, setShowAllReviews] = useState(false);

    const ratingCriteria = [
        { 
            key: 'relevance', 
            label: 'Industry Relevance', 
            description: 'How relevant is this course to current industry needs?',
            icon: TrendingUp
        },
        { 
            key: 'practicality', 
            label: 'Practical Application', 
            description: 'How practical and applicable are the skills taught?',
            icon: Target
        },
        { 
            key: 'industryAlignment', 
            label: 'Industry Standards', 
            description: 'How well does the course align with industry standards?',
            icon: BarChart3
        },
        { 
            key: 'skillDevelopment', 
            label: 'Skill Development', 
            description: 'How effectively does the course develop job-ready skills?',
            icon: Award
        },
        { 
            key: 'overallQuality', 
            label: 'Overall Quality', 
            description: 'Overall assessment of course quality and content',
            icon: Star
        }
    ];

    useEffect(() => {
        if (courseId) {
            fetchIndustryRatings();
        }
    }, [courseId]);

    const fetchIndustryRatings = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/courses/${courseId}/industry-ratings`);
            if (response.ok) {
                const data = await response.json();
                setRatings(data.ratings);
                setAverages(data.averages);
            }
        } catch (error) {
            console.error('Failed to fetch industry ratings:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`size-4 ${
                            star <= rating 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-600'
                        }`}
                    />
                ))}
            </div>
        );
    };

    const getRatingColor = (rating) => {
        if (rating >= 4.5) return 'text-green-400';
        if (rating >= 3.5) return 'text-yellow-400';
        if (rating >= 2.5) return 'text-orange-400';
        return 'text-red-400';
    };

    if (loading) {
        return (
            <div className="bg-[#1a1a1a] rounded-lg border border-white/10 p-6">
                <div className="text-center text-gray-400">Loading industry ratings...</div>
            </div>
        );
    }

    if (!averages || ratings.length === 0) {
        return (
            <div className="bg-[#1a1a1a] rounded-lg border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Briefcase className="size-6 text-[#7848ff]" />
                    <h3 className="text-lg font-semibold text-white">Industry Expert Ratings</h3>
                </div>
                <div className="text-center text-gray-400">
                    <Briefcase className="size-12 text-gray-600 mx-auto mb-3" />
                    <p>No industry expert ratings yet for this course.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#1a1a1a] rounded-lg border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Briefcase className="size-6 text-[#7848ff]" />
                    <h3 className="text-lg font-semibold text-white">Industry Expert Ratings</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Users className="size-4" />
                    <span>{averages.totalRatings} expert{averages.totalRatings !== 1 ? 's' : ''}</span>
                </div>
            </div>

            {/* Overall Rating */}
            <div className="bg-[#222222] rounded-lg p-4 mb-6">
                <div className="text-center mb-4">
                    <div className={`text-3xl font-bold ${getRatingColor(averages.overallQuality)} mb-2`}>
                        {averages.overallQuality}/5
                    </div>
                    <div className="flex justify-center mb-2">
                        {renderStars(Math.round(averages.overallQuality))}
                    </div>
                    <p className="text-gray-400 text-sm">Overall Industry Rating</p>
                </div>
            </div>

            {/* Rating Breakdown */}
            <div className="space-y-4 mb-6">
                <h4 className="text-white font-medium mb-3">Rating Breakdown</h4>
                {ratingCriteria.map((criterion) => {
                    const Icon = criterion.icon;
                    const rating = parseFloat(averages[criterion.key]);
                    return (
                        <div key={criterion.key} className="flex items-center justify-between p-3 bg-[#222222] rounded-lg">
                            <div className="flex items-center gap-3">
                                <Icon className="size-5 text-[#7848ff]" />
                                <div>
                                    <div className="text-white font-medium">{criterion.label}</div>
                                    <div className="text-gray-400 text-sm">{criterion.description}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex">
                                    {renderStars(Math.round(rating))}
                                </div>
                                <span className={`font-bold ${getRatingColor(rating)}`}>
                                    {rating}/5
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Expert Reviews */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-medium">Expert Reviews</h4>
                    {ratings.length > 3 && (
                        <button
                            onClick={() => setShowAllReviews(!showAllReviews)}
                            className="text-[#7848ff] hover:text-[#bb86fc] text-sm"
                        >
                            {showAllReviews ? 'Show Less' : `Show All ${ratings.length} Reviews`}
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    {(showAllReviews ? ratings : ratings.slice(0, 3)).map((rating, index) => (
                        <div key={index} className="bg-[#222222] rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 bg-[#7848ff]/20 rounded-full flex items-center justify-center">
                                        <Briefcase className="size-5 text-[#7848ff]" />
                                    </div>
                                    <div>
                                        <div className="text-white font-medium">
                                            {rating.expertId.firstName} {rating.expertId.lastName}
                                        </div>
                                        <div className="text-gray-400 text-sm">
                                            {rating.expertId.expertise && (
                                                <span>{rating.expertId.expertise}</span>
                                            )}
                                            {rating.expertId.company && (
                                                <span> • {rating.expertId.company}</span>
                                            )}
                                            {rating.expertId.experience && (
                                                <span> • {rating.expertId.experience}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 mb-1">
                                        {renderStars(Math.round(rating.ratings.overallQuality))}
                                        <span className="text-white font-medium ml-2">
                                            {rating.ratings.overallQuality}/5
                                        </span>
                                    </div>
                                    <div className="text-gray-400 text-xs">
                                        {new Date(rating.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            {rating.feedback && (
                                <div className="text-gray-300 text-sm bg-[#1a1a1a] rounded p-3">
                                    "{rating.feedback}"
                                </div>
                            )}

                            {/* Individual Ratings */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3 text-xs">
                                {ratingCriteria.map((criterion) => (
                                    <div key={criterion.key} className="text-center">
                                        <div className="text-gray-400 mb-1">{criterion.label.split(' ')[0]}</div>
                                        <div className="text-[#7848ff] font-bold">
                                            {rating.ratings[criterion.key]}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Call to Action for Industry Experts */}
            <div className="mt-6 p-4 bg-gradient-to-r from-[#7848ff]/10 to-[#bb86fc]/10 rounded-lg border border-[#7848ff]/20">
                <div className="flex items-center gap-3 mb-2">
                    <Briefcase className="size-5 text-[#7848ff]" />
                    <span className="text-white font-medium">Are you an industry expert?</span>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                    Help students make informed decisions by sharing your professional insights about this course.
                </p>
                <button className="text-[#7848ff] hover:text-[#bb86fc] text-sm font-medium">
                    Rate This Course →
                </button>
            </div>
        </div>
    );
}
