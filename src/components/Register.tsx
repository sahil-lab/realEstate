import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Home, TrendingUp, User, Mail, Lock, Chrome } from 'lucide-react';

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Particles effect for background
    useEffect(() => {
        const canvas = document.getElementById('particles-canvas') as HTMLCanvasElement;
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
        for (let i = 0; i < 60; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                size: Math.random() * 2.5 + 1,
                opacity: Math.random() * 0.6 + 0.2
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

                    if (distance < 90) {
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 * (1 - distance / 90)})`;
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

    const validateForm = () => {
        if (!name.trim()) {
            setError('Please enter your full name');
            return false;
        }
        if (!email) {
            setError('Please enter your email address');
            return false;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleEmailRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            // Create user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update the user's display name
            await updateProfile(user, {
                displayName: name
            });

            // Create user document in Firestore
            await setDoc(doc(db, 'realEstateUsers', user.uid), {
                uid: user.uid,
                displayName: name,
                email: user.email,
                photoURL: user.photoURL,
                role: 'user',
                isOnboarded: false,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
            });

            navigate('/');
        } catch (error: any) {
            console.error('Registration error:', error);
            let errorMessage = 'Failed to create account. Please try again.';

            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'An account with this email already exists.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak. Please choose a stronger password.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Please enter a valid email address.';
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = async () => {
        setLoading(true);
        setError('');

        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Create user document in Firestore
            await setDoc(doc(db, 'realEstateUsers', user.uid), {
                uid: user.uid,
                displayName: user.displayName || 'Real Estate User',
                email: user.email,
                photoURL: user.photoURL,
                role: 'user',
                isOnboarded: false,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
            });

            navigate('/');
        } catch (error: any) {
            console.error('Google registration error:', error);
            setError(error.message || 'Failed to sign up with Google');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-animated-luxury relative overflow-hidden flex items-center justify-center py-12">
            {/* Particles Background */}
            <canvas
                id="particles-canvas"
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
                    className="w-full h-full object-cover opacity-25"
                >
                    <source src="https://videos.pexels.com/video-files/32200811/32200811-uhd_3840_2160_30fps.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-primary-burgundy/15 to-black/95"></div>
            </div>

            {/* Register Container */}
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-lg mx-auto px-6"
            >
                {/* Logo Section */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-center mb-10"
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
                    <h1 className="text-4xl font-bold text-luxury text-gradient-gold mb-2">
                        Bhargavi Real Estate
                    </h1>
                    <p className="text-subtle text-lg">Where Dreams Become Reality</p>
                </motion.div>

                {/* Register Form */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="form-luxury"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-luxury text-gradient-gold mb-2">Join Our Elite Community</h2>
                        <p className="text-subtle">Create your premium account to discover luxury properties</p>
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

                    <form onSubmit={handleEmailRegister} className="space-y-6">
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gold w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input-luxury w-full pl-12"
                                disabled={loading}
                            />
                        </div>

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gold w-5 h-5" />
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-luxury w-full pl-12"
                                disabled={loading}
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gold w-5 h-5" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-luxury w-full pl-12 pr-12"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gold hover:text-accent-gold transition-colors"
                                disabled={loading}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gold w-5 h-5" />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="input-luxury w-full pl-12 pr-12"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gold hover:text-accent-gold transition-colors"
                                disabled={loading}
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <motion.button
                            whileHover={{ scale: loading ? 1 : 1.02 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="btn-luxury w-full py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="luxury-spinner w-5 h-5"></div>
                                    <span>Creating Account...</span>
                                </div>
                            ) : (
                                'Create Premium Account'
                            )}
                        </motion.button>
                    </form>

                    <div className="my-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/20"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-transparent text-subtle">Or register with</span>
                            </div>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        onClick={handleGoogleRegister}
                        disabled={loading}
                        className="btn-outline-luxury w-full py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Chrome className="w-6 h-6 mr-3" />
                        {loading ? 'Connecting...' : 'Continue with Google'}
                    </motion.button>

                    <div className="mt-8 text-center">
                        <p className="text-subtle">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-gradient-gold hover:text-accent-gold transition-colors font-semibold"
                            >
                                Sign In
                            </Link>
                        </p>
                    </div>

                    <div className="mt-6 text-center">
                        <Link
                            to="/"
                            className="text-subtle hover:text-gradient-gold transition-colors text-sm"
                        >
                            ← Back to Home
                        </Link>
                    </div>

                    {/* Terms and Privacy */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-subtle">
                            By creating an account, you agree to our{' '}
                            <a href="#" className="text-gradient-gold hover:text-accent-gold transition-colors">
                                Terms of Service
                            </a>{' '}
                            and{' '}
                            <a href="#" className="text-gradient-gold hover:text-accent-gold transition-colors">
                                Privacy Policy
                            </a>
                        </p>
                    </div>
                </motion.div>

                {/* Bottom Decoration */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="text-center mt-12"
                >
                    <div className="text-4xl font-bold text-luxury text-gradient-gold float-animation">
                        BR
                    </div>
                    <p className="text-subtle text-sm mt-2">Premium Real Estate Solutions</p>
                </motion.div>
            </motion.div>

            {/* Floating Elements */}
            <motion.div
                animate={{
                    y: [0, -25, 0],
                    rotate: [0, 10, -10, 0]
                }}
                transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-16 left-8 w-20 h-20 bg-gradient-to-r from-accent-gold to-primary-burgundy rounded-full opacity-15"
            />

            <motion.div
                animate={{
                    y: [0, 20, 0],
                    rotate: [0, -5, 5, 0]
                }}
                transition={{
                    duration: 9,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.5
                }}
                className="absolute bottom-16 right-8 w-14 h-14 bg-gradient-to-r from-primary-burgundy to-accent-gold rounded-full opacity-20"
            />

            <motion.div
                animate={{
                    y: [0, -15, 0],
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 3
                }}
                className="absolute top-1/3 right-16 w-10 h-10 bg-gradient-to-r from-accent-gold to-secondary-burgundy rounded-full opacity-25"
            />

            <motion.div
                animate={{
                    y: [0, 12, 0],
                    x: [0, 5, 0],
                    scale: [1, 0.8, 1]
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
                className="absolute bottom-1/3 left-16 w-6 h-6 bg-gradient-to-r from-secondary-burgundy to-accent-gold rounded-full opacity-30"
            />
        </div>
    );
};

export default Register; 