import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home, TrendingUp, Phone, MessageCircle, MapPin, DollarSign, Building,
    Users, Factory, TreePine, User, ChevronRight, ArrowRight, SkipForward,
    Calendar, Heart, Bed, CreditCard, Wifi, Car, ShieldCheck, Zap, LucideIcon
} from 'lucide-react';

interface OnboardingAnswers {
    displayName: string;
    phone: string;
    whatsapp: string;
    propertyType: string;
    budgetRange: { min: number; max: number };
    location: string;
    timeline: string;
    purpose: string;
    bedrooms: string;
    loanAssistance: boolean;
    amenities: string[];
    skippedQuestions: string[];
}

interface BaseOption {
    id: string;
    label: string;
}

interface IconOption extends BaseOption {
    icon?: LucideIcon;
    description?: string;
}

interface BudgetOption extends BaseOption {
    range: { min: number; max: number };
}

interface YesNoOption extends BaseOption {
    icon: LucideIcon;
    color: string;
}

interface SimpleOption extends BaseOption {
    // Just id and label
}

interface Question {
    id: string;
    title: string;
    subtitle: string;
    type: 'personal' | 'choice' | 'yesno' | 'multiple';
    options?: (IconOption | BudgetOption | SimpleOption)[];
}

const Onboarding: React.FC = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const [answers, setAnswers] = useState<OnboardingAnswers>({
        displayName: auth.currentUser?.displayName || '',
        phone: '',
        whatsapp: '',
        propertyType: '',
        budgetRange: { min: 0, max: 10000000 },
        location: '',
        timeline: '',
        purpose: '',
        bedrooms: '',
        loanAssistance: false,
        amenities: [],
        skippedQuestions: []
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
        for (let i = 0; i < 30; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.4 + 0.2
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((particle, i) => {
                particle.x += particle.vx;
                particle.y += particle.vy;

                if (particle.x < 0) particle.x = canvas.width;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = canvas.height;
                if (particle.y > canvas.height) particle.y = 0;

                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 215, 0, ${particle.opacity})`;
                ctx.fill();

                particles.slice(i + 1).forEach(otherParticle => {
                    const dx = particle.x - otherParticle.x;
                    const dy = particle.y - otherParticle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.08 * (1 - distance / 100)})`;
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

    const questions: Question[] = [
        {
            id: 'personal',
            title: "Let's get to know you!",
            subtitle: "Help us personalize your property search experience",
            type: 'personal'
        },
        {
            id: 'propertyType',
            title: "What type of property are you looking for?",
            subtitle: "Select the property type that interests you most",
            type: 'choice',
            options: [
                { id: 'apartment', label: 'Apartment', icon: Building, description: 'Modern city living' },
                { id: 'villa', label: 'Independent Villa', icon: Home, description: 'Spacious & private' },
                { id: 'plot', label: 'Plot/Land', icon: TreePine, description: 'Build your dream home' },
                { id: 'commercial', label: 'Commercial Space', icon: Factory, description: 'For business purposes' }
            ] as IconOption[]
        },
        {
            id: 'budget',
            title: "What's your budget range?",
            subtitle: "This helps us show you the most relevant properties",
            type: 'choice',
            options: [
                { id: '0-25', label: 'Under ₹25 Lakh', range: { min: 0, max: 2500000 } },
                { id: '25-50', label: '₹25 - ₹50 Lakh', range: { min: 2500000, max: 5000000 } },
                { id: '50-75', label: '₹50 - ₹75 Lakh', range: { min: 5000000, max: 7500000 } },
                { id: '75-100', label: '₹75 Lakh - ₹1 Crore', range: { min: 7500000, max: 10000000 } },
                { id: '100-150', label: '₹1 - ₹1.5 Crore', range: { min: 10000000, max: 15000000 } },
                { id: '150+', label: '₹1.5 Crore+', range: { min: 15000000, max: 100000000 } }
            ] as BudgetOption[]
        },
        {
            id: 'location',
            title: "Which area in Bangalore interests you?",
            subtitle: "Choose your preferred locality or nearby areas",
            type: 'choice',
            options: [
                { id: 'koramangala', label: 'Koramangala' },
                { id: 'whitefield', label: 'Whitefield' },
                { id: 'indiranagar', label: 'Indiranagar' },
                { id: 'hsr', label: 'HSR Layout' },
                { id: 'electronic-city', label: 'Electronic City' },
                { id: 'sarjapur', label: 'Sarjapur Road' },
                { id: 'marathahalli', label: 'Marathahalli' },
                { id: 'jp-nagar', label: 'JP Nagar' },
                { id: 'btm', label: 'BTM Layout' },
                { id: 'other', label: 'Other Area' }
            ] as SimpleOption[]
        },
        {
            id: 'timeline',
            title: "When are you planning to buy?",
            subtitle: "This helps us prioritize your property requirements",
            type: 'choice',
            options: [
                { id: 'immediately', label: 'Immediately', icon: Zap, description: 'Ready to buy now' },
                { id: '1-3months', label: 'Within 3 months', icon: Calendar, description: 'Soon but need time' },
                { id: '3-6months', label: '3-6 months', icon: Calendar, description: 'Planning ahead' },
                { id: '6-12months', label: '6-12 months', icon: Calendar, description: 'Long term planning' },
                { id: 'just-exploring', label: 'Just exploring', icon: Heart, description: 'Checking options' }
            ] as IconOption[]
        },
        {
            id: 'purpose',
            title: "What's the primary purpose?",
            subtitle: "Understanding your purpose helps us recommend better",
            type: 'choice',
            options: [
                { id: 'self-use', label: 'Self Use', icon: Home, description: 'For personal living' },
                { id: 'investment', label: 'Investment', icon: TrendingUp, description: 'For rental income' },
                { id: 'both', label: 'Both', icon: Heart, description: 'Live now, rent later' }
            ] as IconOption[]
        },
        {
            id: 'bedrooms',
            title: "How many bedrooms do you need?",
            subtitle: "Select the configuration that suits your family",
            type: 'choice',
            options: [
                { id: '1bhk', label: '1 BHK', icon: Bed },
                { id: '2bhk', label: '2 BHK', icon: Bed },
                { id: '3bhk', label: '3 BHK', icon: Bed },
                { id: '4bhk+', label: '4+ BHK', icon: Bed },
                { id: 'no-preference', label: 'No Preference', icon: Users }
            ] as IconOption[]
        },
        {
            id: 'loanAssistance',
            title: "Do you need home loan assistance?",
            subtitle: "We can help you with the best loan options available",
            type: 'yesno'
        },
        {
            id: 'amenities',
            title: "Any specific amenities you're looking for?",
            subtitle: "Select all that apply (you can skip this)",
            type: 'multiple',
            options: [
                { id: 'parking', label: 'Parking', icon: Car },
                { id: 'gym', label: 'Gym/Fitness', icon: Users },
                { id: 'security', label: '24x7 Security', icon: ShieldCheck },
                { id: 'wifi', label: 'High-speed Internet', icon: Wifi },
                { id: 'pool', label: 'Swimming Pool', icon: Users },
                { id: 'garden', label: 'Garden/Green Space', icon: TreePine }
            ] as IconOption[]
        }
    ];

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSkip = () => {
        const questionId = questions[currentQuestion].id;
        setAnswers(prev => ({
            ...prev,
            skippedQuestions: [...prev.skippedQuestions, questionId]
        }));
        handleNext();
    };

    const handleAnswer = (value: any) => {
        const questionId = questions[currentQuestion].id;
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleMultipleAnswer = (optionId: string) => {
        setAnswers(prev => ({
            ...prev,
            amenities: prev.amenities.includes(optionId)
                ? prev.amenities.filter(id => id !== optionId)
                : [...prev.amenities, optionId]
        }));
    };

    const handleSubmit = async () => {
        if (!auth.currentUser) return;

        setLoading(true);
        setError('');

        try {
            const userRef = doc(db, 'realEstateUsers', auth.currentUser.uid);
            await updateDoc(userRef, {
                ...answers,
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

    const renderQuestion = () => {
        const question = questions[currentQuestion];

        switch (question.type) {
            case 'personal':
                return (
                    <motion.div
                        key="personal"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        <div className="space-y-6">
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gold w-5 h-5" />
                                <input
                                    type="text"
                                    value={answers.displayName}
                                    onChange={(e) => handleAnswer({ ...answers, displayName: e.target.value })}
                                    className="input-luxury w-full pl-12 text-lg"
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>

                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gold w-5 h-5" />
                                <input
                                    type="tel"
                                    value={answers.phone}
                                    onChange={(e) => handleAnswer({ ...answers, phone: e.target.value })}
                                    className="input-luxury w-full pl-12 text-lg"
                                    placeholder="Enter your phone number"
                                    required
                                />
                            </div>

                            <div className="relative">
                                <MessageCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gold w-5 h-5" />
                                <input
                                    type="tel"
                                    value={answers.whatsapp}
                                    onChange={(e) => handleAnswer({ ...answers, whatsapp: e.target.value })}
                                    className="input-luxury w-full pl-12 text-lg"
                                    placeholder="WhatsApp number (optional)"
                                />
                            </div>
                        </div>
                    </motion.div>
                );

            case 'choice':
                return (
                    <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        {question.options?.map((option) => {
                            const isBudgetOption = 'range' in option;
                            const isIconOption = 'icon' in option;
                            const Icon = isIconOption ? option.icon : null;

                            const isSelected = question.id === 'budget'
                                ? isBudgetOption && answers.budgetRange.min === option.range.min && answers.budgetRange.max === option.range.max
                                : answers[question.id as keyof OnboardingAnswers] === option.id;

                            return (
                                <motion.button
                                    key={option.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        if (question.id === 'budget' && isBudgetOption) {
                                            handleAnswer(option.range);
                                            setAnswers(prev => ({ ...prev, budgetRange: option.range }));
                                        } else {
                                            handleAnswer(option.id);
                                            setAnswers(prev => ({ ...prev, [question.id]: option.id }));
                                        }
                                    }}
                                    className={`card-luxury p-6 text-left transition-all duration-300 ${isSelected
                                        ? 'border-gold shadow-luxury bg-gradient-to-r from-accent-gold/10 to-primary-burgundy/10'
                                        : 'hover-lift'
                                        }`}
                                >
                                    <div className="flex items-center space-x-4">
                                        {Icon && (
                                            <div className="w-12 h-12 bg-gradient-to-r from-accent-gold to-primary-burgundy rounded-xl flex items-center justify-center">
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg text-gradient-gold mb-1">
                                                {option.label}
                                            </h3>
                                            {isIconOption && option.description && (
                                                <p className="text-subtle text-sm">{option.description}</p>
                                            )}
                                        </div>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </motion.div>
                );

            case 'yesno':
                const yesNoOptions: YesNoOption[] = [
                    { id: 'true', label: 'Yes, I need assistance', icon: CreditCard, color: 'from-green-500 to-emerald-600' },
                    { id: 'false', label: 'No, I have it covered', icon: ShieldCheck, color: 'from-primary-burgundy to-secondary-burgundy' }
                ];

                return (
                    <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-2 gap-6"
                    >
                        {yesNoOptions.map((option) => {
                            const Icon = option.icon;
                            const isSelected = answers.loanAssistance === (option.id === 'true');

                            return (
                                <motion.button
                                    key={option.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        const value = option.id === 'true';
                                        handleAnswer(value);
                                        setAnswers(prev => ({ ...prev, loanAssistance: value }));
                                    }}
                                    className={`card-luxury p-8 transition-all duration-300 ${isSelected
                                        ? 'border-gold shadow-luxury bg-gradient-to-r from-accent-gold/10 to-primary-burgundy/10'
                                        : 'hover-lift'
                                        }`}
                                >
                                    <div className="flex flex-col items-center space-y-4">
                                        <div className={`w-16 h-16 bg-gradient-to-r ${option.color} rounded-xl flex items-center justify-center`}>
                                            <Icon className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-lg text-gradient-gold text-center">
                                            {option.label}
                                        </h3>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </motion.div>
                );

            case 'multiple':
                return (
                    <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-2 md:grid-cols-3 gap-4"
                    >
                        {question.options?.map((option) => {
                            const isIconOption = 'icon' in option;
                            const Icon = isIconOption ? option.icon : null;
                            const isSelected = answers.amenities.includes(option.id);

                            return (
                                <motion.button
                                    key={option.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleMultipleAnswer(option.id)}
                                    className={`card-luxury p-4 transition-all duration-300 ${isSelected
                                        ? 'border-gold shadow-luxury bg-gradient-to-r from-accent-gold/10 to-primary-burgundy/10'
                                        : 'hover-lift'
                                        }`}
                                >
                                    <div className="flex flex-col items-center space-y-2">
                                        {Icon && (
                                            <div className="w-10 h-10 bg-gradient-to-r from-accent-gold to-primary-burgundy rounded-lg flex items-center justify-center">
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>
                                        )}
                                        <span className="font-medium text-sm text-gradient-gold text-center">
                                            {option.label}
                                        </span>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </motion.div>
                );

            default:
                return null;
        }
    };

    const canProceed = () => {
        const question = questions[currentQuestion];
        switch (question.id) {
            case 'personal':
                return answers.displayName.trim() && answers.phone.trim();
            case 'propertyType':
                return !!answers.propertyType;
            case 'budget':
                return answers.budgetRange.min > 0;
            case 'location':
                return !!answers.location;
            case 'timeline':
                return !!answers.timeline;
            case 'purpose':
                return !!answers.purpose;
            case 'bedrooms':
                return !!answers.bedrooms;
            case 'loanAssistance':
                return answers.loanAssistance !== undefined;
            case 'amenities':
                return true; // Optional question
            default:
                return true;
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

            {/* Background Video */}
            <div className="absolute inset-0">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover opacity-15"
                >
                    <source src="https://videos.pexels.com/video-files/32200811/32200811-uhd_3840_2160_30fps.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-primary-burgundy/20 to-black/95"></div>
            </div>

            {/* Onboarding Container */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 w-full max-w-4xl mx-auto px-6"
            >
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center space-x-3 mb-6">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="flex items-center gap-2"
                        >
                            <Home className="w-10 h-10 text-gradient-gold" />
                            <TrendingUp className="w-10 h-10 text-gradient-burgundy" />
                        </motion.div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-luxury text-gradient-gold mb-3">
                        Bhargavi Real Estate
                    </h1>
                    <p className="text-subtle text-lg">Your Gateway to Dream Properties</p>
                </motion.div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-subtle text-lg">Question {currentQuestion + 1} of {questions.length}</span>
                        <span className="text-gradient-gold font-bold text-lg">
                            {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
                        </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                            className="bg-gradient-to-r from-accent-gold to-primary-burgundy h-2 rounded-full shadow-luxury"
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                    </div>
                </div>

                {/* Question Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="form-luxury min-h-[400px]"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-luxury text-gradient-gold mb-3">
                            {questions[currentQuestion].title}
                        </h2>
                        <p className="text-subtle text-lg">{questions[currentQuestion].subtitle}</p>
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

                    {/* Question Content */}
                    <div className="mb-8">
                        <AnimatePresence mode="wait">
                            {renderQuestion()}
                        </AnimatePresence>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center mt-10">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSkip}
                            className="btn-outline-luxury px-6 py-3 text-sm md:text-base"
                        >
                            <SkipForward className="w-4 h-4 mr-2" />
                            Skip
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: canProceed() && !loading ? 1.05 : 1 }}
                            whileTap={{ scale: canProceed() && !loading ? 0.95 : 1 }}
                            onClick={handleNext}
                            disabled={!canProceed() || loading}
                            className="btn-luxury px-8 py-3 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="luxury-spinner w-4 h-4"></div>
                                    <span>Saving...</span>
                                </div>
                            ) : currentQuestion === questions.length - 1 ? (
                                <>
                                    Complete Setup
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            ) : (
                                <>
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </motion.button>
                    </div>
                </motion.div>

                {/* Bottom Decoration */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                    className="text-center mt-8"
                >
                    <div className="text-2xl font-bold text-luxury text-gradient-gold float-animation">
                        BR
                    </div>
                    <p className="text-subtle text-xs mt-1">Personalized Property Discovery</p>
                </motion.div>
            </motion.div>

            {/* Floating Elements */}
            <motion.div
                animate={{
                    y: [0, -15, 0],
                    rotate: [0, 3, -3, 0]
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-20 left-10 w-12 h-12 bg-gradient-to-r from-accent-gold to-primary-burgundy rounded-full opacity-20"
            />

            <motion.div
                animate={{
                    y: [0, 12, 0],
                    rotate: [0, -2, 2, 0]
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                }}
                className="absolute bottom-20 right-10 w-10 h-10 bg-gradient-to-r from-primary-burgundy to-accent-gold rounded-full opacity-20"
            />
        </div>
    );
};

export default Onboarding; 