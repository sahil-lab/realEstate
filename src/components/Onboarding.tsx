import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Home, TrendingUp, Phone, MessageCircle, MapPin, DollarSign, Building, Users, Factory, TreePine } from 'lucide-react';
import { OnboardingData } from '../types/User';

const Onboarding: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const [formData, setFormData] = useState<OnboardingData>({
        displayName: auth.currentUser?.displayName || '',
        phone: '',
        whatsapp: '',
        interests: [],
        budgetRange: { min: 0, max: 10000000 },
        location: ''
    });

    const propertyTypes = [
        { id: 'residential', label: 'Residential', icon: Home, color: 'bg-blue-500' },
        { id: 'commercial', label: 'Commercial', icon: Building, color: 'bg-green-500' },
        { id: 'agricultural', label: 'Agricultural', icon: TreePine, color: 'bg-emerald-500' },
        { id: 'industrial', label: 'Industrial', icon: Factory, color: 'bg-orange-500' }
    ];

    const budgetRanges = [
        { min: 0, max: 1000000, label: 'Under ₹10 Lakh' },
        { min: 1000000, max: 2500000, label: '₹10 Lakh - ₹25 Lakh' },
        { min: 2500000, max: 5000000, label: '₹25 Lakh - ₹50 Lakh' },
        { min: 5000000, max: 10000000, label: '₹50 Lakh - ₹1 Crore' },
        { min: 10000000, max: 25000000, label: '₹1 Crore - ₹2.5 Crore' },
        { min: 25000000, max: 100000000, label: '₹2.5 Crore+' }
    ];

    const popularLocations = [
        'Bangalore', 'Hyderabad', 'Chennai', 'Mumbai', 'Delhi', 'Pune',
        'Kochi', 'Coimbatore', 'Mysore', 'Mangalore', 'Hubli', 'Other'
    ];

    const handleInterestToggle = (interest: string) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }));
    };

    const handleBudgetSelect = (range: { min: number; max: number }) => {
        setFormData(prev => ({
            ...prev,
            budgetRange: range
        }));
    };

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        if (!auth.currentUser) return;

        setLoading(true);
        setError('');

        try {
            const userRef = doc(db, 'realEstateUsers', auth.currentUser.uid);
            await updateDoc(userRef, {
                displayName: formData.displayName,
                phone: formData.phone,
                whatsapp: formData.whatsapp,
                interests: formData.interests,
                budgetRange: formData.budgetRange,
                location: formData.location,
                isOnboarded: true,
                onboardedAt: new Date(),
            });

            navigate('/');
        } catch (err: any) {
            console.error('Error updating user profile:', err);
            setError('Failed to save your preferences. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">Personal Information</h2>
                            <p className="text-gray-300">Help us personalize your experience</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-white font-medium mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.displayName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors"
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-white font-medium mb-2">Phone Number</label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 pl-12 text-white placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors"
                                        placeholder="Enter your phone number"
                                        required
                                    />
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-white font-medium mb-2">WhatsApp Number</label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        value={formData.whatsapp}
                                        onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 pl-12 text-white placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors"
                                        placeholder="Enter your WhatsApp number"
                                    />
                                    <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );

            case 2:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">Property Interests</h2>
                            <p className="text-gray-300">What type of properties are you interested in?</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {propertyTypes.map((type) => {
                                const Icon = type.icon;
                                const isSelected = formData.interests.includes(type.id);

                                return (
                                    <motion.button
                                        key={type.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleInterestToggle(type.id)}
                                        className={`p-4 rounded-lg border transition-all duration-300 ${isSelected
                                                ? 'bg-white/20 border-green-400 text-white'
                                                : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className="flex flex-col items-center space-y-2">
                                            <div className={`p-3 rounded-lg ${type.color}`}>
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <span className="font-medium">{type.label}</span>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                );

            case 3:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">Budget Range</h2>
                            <p className="text-gray-300">What's your budget for property investment?</p>
                        </div>

                        <div className="space-y-3">
                            {budgetRanges.map((range) => {
                                const isSelected = formData.budgetRange.min === range.min && formData.budgetRange.max === range.max;

                                return (
                                    <motion.button
                                        key={`${range.min}-${range.max}`}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        onClick={() => handleBudgetSelect(range)}
                                        className={`w-full p-4 rounded-lg border transition-all duration-300 flex items-center space-x-3 ${isSelected
                                                ? 'bg-white/20 border-green-400 text-white'
                                                : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
                                            }`}
                                    >
                                        <DollarSign className="w-5 h-5" />
                                        <span className="font-medium">{range.label}</span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                );

            case 4:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">Preferred Location</h2>
                            <p className="text-gray-300">Where are you looking to invest?</p>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                {popularLocations.map((location) => (
                                    <motion.button
                                        key={location}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setFormData(prev => ({ ...prev, location }))}
                                        className={`p-3 rounded-lg border transition-all duration-300 ${formData.location === location
                                                ? 'bg-white/20 border-green-400 text-white'
                                                : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
                                            }`}
                                    >
                                        <span className="text-sm font-medium">{location}</span>
                                    </motion.button>
                                ))}
                            </div>

                            <div>
                                <label className="block text-white font-medium mb-2">Or specify your preferred location</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 pl-12 text-white placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors"
                                        placeholder="Enter your preferred location"
                                    />
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
            {/* Background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-green-950 via-blue-950 to-indigo-950"></div>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-green-500/30 via-blue-500/20 to-transparent rounded-full filter blur-3xl animate-float opacity-70"></div>
                <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-radial from-blue-500/30 via-indigo-500/20 to-transparent rounded-full filter blur-3xl animate-float-reverse opacity-60"></div>
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-radial from-emerald-500/30 via-green-500/20 to-transparent rounded-full filter blur-3xl animate-pulse-slow opacity-50"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-lg relative z-10"
            >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center justify-center gap-2 mb-4"
                        >
                            <Home className="w-8 h-8 text-green-400" />
                            <TrendingUp className="w-8 h-8 text-blue-400" />
                        </motion.div>
                        <h1 className="text-3xl font-bold text-white mb-2">Welcome to Bhargavi Real Estate</h1>
                        <p className="text-gray-200">Let's personalize your property search experience</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-300">Step {currentStep} of 4</span>
                            <span className="text-sm text-gray-300">{Math.round((currentStep / 4) * 100)}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(currentStep / 4) * 100}%` }}
                                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-6"
                        >
                            <p className="text-red-300 text-sm">{error}</p>
                        </motion.div>
                    )}

                    {/* Step Content */}
                    {renderStep()}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handlePrevious}
                            disabled={currentStep === 1}
                            className="px-6 py-3 rounded-lg border border-white/20 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                        >
                            Previous
                        </motion.button>

                        {currentStep < 4 ? (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleNext}
                                className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-medium transition-all duration-300"
                            >
                                Next
                            </motion.button>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-medium transition-all duration-300 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Saving...' : 'Complete Setup'}
                            </motion.button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Onboarding; 