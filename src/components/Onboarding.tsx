import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Home, TrendingUp, Phone, MessageCircle, MapPin, DollarSign, Building, Users, Factory, TreePine, User, ChevronRight, ChevronLeft } from 'lucide-react';
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

    // Particles effect for background
    useEffect(() => {
        const canvas = document.getElementById('onboarding-particles') as HTMLCanvasElement;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: Array<{
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            opacity: number;
        }> = [];

        // Create particles
        for (let i = 0; i < 40; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((particle, i) => {
                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Wrap around edges
                if (particle.x < 0) particle.x = canvas.width;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = canvas.height;
                if (particle.y > canvas.height) particle.y = 0;

                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 215, 0, ${particle.opacity})`;
                ctx.fill();

                // Draw connections
                particles.slice(i + 1).forEach(otherParticle => {
                    const dx = particle.x - otherParticle.x;
                    const dy = particle.y - otherParticle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / 100)})`;
                        ctx.stroke();
                    }
                });
            });

            requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const propertyTypes = [
        { id: 'residential', label: 'Residential', icon: Home, color: 'from-accent-gold to-primary-burgundy' },
        { id: 'commercial', label: 'Commercial', icon: Building, color: 'from-primary-burgundy to-secondary-burgundy' },
        { id: 'agricultural', label: 'Agricultural', icon: TreePine, color: 'from-accent-gold to-secondary-burgundy' },
        { id: 'industrial', label: 'Industrial', icon: Factory, color: 'from-secondary-burgundy to-accent-gold' }
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
        'Koramangala', 'Whitefield', 'Indiranagar', 'HSR Layout', 'Electronic City', 'Bannerghatta Road',
        'Sarjapur Road', 'Marathahalli', 'JP Nagar', 'BTM Layout', 'Jayanagar', 'Other Location'
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
                onboardedAt: serverTimestamp(),
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
                            <h2 className="text-3xl font-bold text-luxury text-gradient-gold mb-3">Personal Information</h2>
                            <p className="text-subtle text-lg">Help us personalize your luxury property experience</p>
                        </div>

                        <div className="space-y-6">
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gold w-5 h-5" />
                                <input
                                    type="text"
                                    value={formData.displayName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                                    className="input-luxury w-full pl-12"
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>

                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gold w-5 h-5" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    className="input-luxury w-full pl-12"
                                    placeholder="Enter your phone number"
                                    required
                                />
                            </div>

                            <div className="relative">
                                <MessageCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gold w-5 h-5" />
                                <input
                                    type="tel"
                                    value={formData.whatsapp}
                                    onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                                    className="input-luxury w-full pl-12"
                                    placeholder="Enter your WhatsApp number (optional)"
                                />
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
                            <h2 className="text-3xl font-bold text-luxury text-gradient-gold mb-3">Property Interests</h2>
                            <p className="text-subtle text-lg">What type of premium properties interest you?</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {propertyTypes.map((type) => {
                                const Icon = type.icon;
                                const isSelected = formData.interests.includes(type.id);

                                return (
                                    <motion.button
                                        key={type.id}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleInterestToggle(type.id)}
                                        className={`card-luxury p-6 transition-all duration-300 ${isSelected
                                            ? 'border-gold shadow-luxury'
                                            : 'hover-lift'
                                            }`}
                                    >
                                        <div className="flex flex-col items-center space-y-3">
                                            <div className={`p-4 rounded-xl bg-gradient-to-r ${type.color}`}>
                                                <Icon className="w-8 h-8 text-white" />
                                            </div>
                                            <span className="font-semibold text-lg text-gradient-gold">{type.label}</span>
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
                            <h2 className="text-3xl font-bold text-luxury text-gradient-gold mb-3">Investment Budget</h2>
                            <p className="text-subtle text-lg">Select your preferred investment range</p>
                        </div>

                        <div className="space-y-3">
                            {budgetRanges.map((range) => {
                                const isSelected = formData.budgetRange.min === range.min && formData.budgetRange.max === range.max;

                                return (
                                    <motion.button
                                        key={`${range.min}-${range.max}`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleBudgetSelect(range)}
                                        className={`w-full card-luxury p-4 transition-all duration-300 flex items-center space-x-4 ${isSelected
                                            ? 'border-gold shadow-luxury'
                                            : 'hover-lift'
                                            }`}
                                    >
                                        <div className="w-12 h-12 bg-gradient-to-r from-accent-gold to-primary-burgundy rounded-full flex items-center justify-center">
                                            <DollarSign className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="font-semibold text-lg text-gradient-gold">{range.label}</span>
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
                            <h2 className="text-3xl font-bold text-luxury text-gradient-gold mb-3">Preferred Location</h2>
                            <p className="text-subtle text-lg">Where would you like to invest in Bangalore?</p>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-3">
                                {popularLocations.map((location) => (
                                    <motion.button
                                        key={location}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setFormData(prev => ({ ...prev, location }))}
                                        className={`p-3 rounded-lg border-2 transition-all duration-300 ${formData.location === location
                                            ? 'border-gold bg-glass text-gradient-gold'
                                            : 'border-white/20 bg-glass text-white hover:border-gold/50'
                                            }`}
                                    >
                                        <span className="text-sm font-semibold">{location}</span>
                                    </motion.button>
                                ))}
                            </div>

                            <div>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gold w-5 h-5" />
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                        className="input-luxury w-full pl-12"
                                        placeholder="Or enter your preferred location"
                                    />
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
        <div className="min-h-screen bg-animated-luxury relative overflow-hidden flex items-center justify-center py-8">
            {/* Particles Background */}
            <canvas
                id="onboarding-particles"
                className="absolute inset-0 pointer-events-none"
                style={{ zIndex: 0 }}
            />

            {/* Background Video/Image */}
            <div className="absolute inset-0">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover opacity-20"
                >
                    <source src="https://videos.pexels.com/video-files/32200811/32200811-uhd_3840_2160_30fps.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-primary-burgundy/20 to-black/95"></div>
            </div>

            {/* Onboarding Container */}
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-2xl mx-auto px-6"
            >
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-center mb-8"
                >
                    <div className="flex items-center justify-center space-x-3 mb-6">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="flex items-center gap-2"
                        >
                            <Home className="w-12 h-12 text-gradient-gold" />
                            <TrendingUp className="w-12 h-12 text-gradient-burgundy" />
                        </motion.div>
                    </div>
                    <h1 className="text-4xl font-bold text-luxury text-gradient-gold mb-3">
                        Welcome to Bhargavi Real Estate
                    </h1>
                    <p className="text-subtle text-xl">Let's personalize your luxury property journey</p>
                </motion.div>

                {/* Main Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="form-luxury"
                >
                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-subtle text-lg">Step {currentStep} of 4</span>
                            <span className="text-gradient-gold font-bold text-lg">{Math.round((currentStep / 4) * 100)}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(currentStep / 4) * 100}%` }}
                                className="bg-gradient-to-r from-accent-gold to-primary-burgundy h-3 rounded-full shadow-luxury"
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6 backdrop-blur-sm"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Step Content */}
                    {renderStep()}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-10">
                        <motion.button
                            whileHover={{ scale: currentStep === 1 ? 1 : 1.05 }}
                            whileTap={{ scale: currentStep === 1 ? 1 : 0.95 }}
                            onClick={handlePrevious}
                            disabled={currentStep === 1}
                            className="btn-outline-luxury px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-5 h-5 mr-2" />
                            Previous
                        </motion.button>

                        {currentStep < 4 ? (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleNext}
                                className="btn-luxury px-8 py-4"
                            >
                                Next
                                <ChevronRight className="w-5 h-5 ml-2" />
                            </motion.button>
                        ) : (
                            <motion.button
                                whileHover={{ scale: loading ? 1 : 1.05 }}
                                whileTap={{ scale: loading ? 1 : 0.95 }}
                                onClick={handleSubmit}
                                disabled={loading}
                                className="btn-luxury px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="luxury-spinner w-5 h-5"></div>
                                        <span>Saving...</span>
                                    </div>
                                ) : (
                                    <>
                                        Complete Setup
                                        <ChevronRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </motion.button>
                        )}
                    </div>
                </motion.div>

                {/* Bottom Decoration */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="text-center mt-8"
                >
                    <div className="text-3xl font-bold text-luxury text-gradient-gold float-animation">
                        BR
                    </div>
                    <p className="text-subtle text-sm mt-2">Your Gateway to Luxury Living</p>
                </motion.div>
            </motion.div>

            {/* Floating Elements */}
            <motion.div
                animate={{
                    y: [0, -20, 0],
                    rotate: [0, 5, -5, 0]
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-20 left-10 w-16 h-16 bg-gradient-to-r from-accent-gold to-primary-burgundy rounded-full opacity-20"
            />

            <motion.div
                animate={{
                    y: [0, 15, 0],
                    rotate: [0, -3, 3, 0]
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                }}
                className="absolute bottom-20 right-10 w-12 h-12 bg-gradient-to-r from-primary-burgundy to-accent-gold rounded-full opacity-20"
            />
        </div>
    );
};

export default Onboarding; 