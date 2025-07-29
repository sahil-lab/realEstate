import React, { useState, useEffect, useRef } from 'react';
import { signOut, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Home, TrendingUp, LogOut, User, Phone, Mail, MapPin, Award, Users, Building, Star, PlayCircle, ChevronRight, Menu, X } from 'lucide-react';
import { UserProfile } from '../types/User';

interface LandingPageProps {
    user: FirebaseUser | null;
}

// Particles component for background effect
const ParticlesBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
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
        for (let i = 0; i < 100; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
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

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 0 }}
        />
    );
};

const LandingPage: React.FC<LandingPageProps> = ({ user }) => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { scrollY } = useScroll();
    const springScrollY = useSpring(scrollY, { stiffness: 100, damping: 30 });

    // Parallax effects
    const backgroundY = useTransform(springScrollY, [0, 1000], [0, -300]);
    const textY = useTransform(springScrollY, [0, 1000], [0, -150]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, 'realEstateUsers', user.uid));
                    if (userDoc.exists()) {
                        setUserProfile(userDoc.data() as UserProfile);
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                }
            }
        };
        fetchUserProfile();
    }, [user]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setUserProfile(null);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    // Stats data
    const stats = [
        { number: "500+", label: "Premium Properties", icon: Building },
        { number: "98%", label: "Client Satisfaction", icon: Star },
        { number: "50+", label: "Expert Agents", icon: Users },
        { number: "15+", label: "Years Experience", icon: Award }
    ];

    // Property showcase data
    const properties = [
        {
            id: 1,
            title: "Luxury Villa in Whitefield",
            price: "₹2.5 Cr",
            location: "Whitefield, Bangalore",
            image: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2080&q=80",
            type: "Villa"
        },
        {
            id: 2,
            title: "Modern Apartment in Koramangala",
            price: "₹1.8 Cr",
            location: "Koramangala, Bangalore",
            image: "https://images.unsplash.com/photo-1560185127-090b2140e5b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
            type: "Apartment"
        },
        {
            id: 3,
            title: "Premium Penthouse",
            price: "₹4.2 Cr",
            location: "UB City, Bangalore",
            image: "https://images.unsplash.com/photo-1613688648943-5a0a73a0a9bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
            type: "Penthouse"
        }
    ];

    return (
        <div className="bg-animated-luxury min-h-screen relative overflow-hidden">
            {/* Particles Background */}
            <ParticlesBackground />

            {/* Navigation */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'nav-luxury shadow-luxury' : 'bg-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        {/* Logo */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center space-x-3 cursor-pointer"
                        >
                            <div className="flex items-center gap-2">
                                <Home className="w-10 h-10 text-gradient-gold" />
                                <TrendingUp className="w-10 h-10 text-gradient-burgundy" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-luxury text-gradient-gold">Bhargavi</h1>
                                <p className="text-sm text-subtle">Real Estate</p>
                            </div>
                        </motion.div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#home" className="text-subtle hover:text-gradient-gold transition-colors duration-300">Home</a>
                            <a href="#properties" className="text-subtle hover:text-gradient-gold transition-colors duration-300">Properties</a>
                            <a href="#about" className="text-subtle hover:text-gradient-gold transition-colors duration-300">About</a>
                            <a href="#contact" className="text-subtle hover:text-gradient-gold transition-colors duration-300">Contact</a>
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center space-x-4">
                            {user ? (
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-3">
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border-2 border-gold" />
                                        ) : (
                                            <div className="w-10 h-10 bg-gradient-to-r from-primary-burgundy to-secondary-burgundy rounded-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-white" />
                                            </div>
                                        )}
                                        <span className="text-white font-medium">
                                            {userProfile?.displayName || user.displayName || 'User'}
                                        </span>
                                    </div>

                                    {/* Admin Dashboard Link */}
                                    {userProfile && ['admin', 'super_admin'].includes(userProfile.role) && (
                                        <motion.a
                                            whileHover={{ scale: 1.05 }}
                                            href="/admin"
                                            className="btn-outline-luxury"
                                        >
                                            <TrendingUp className="w-4 h-4 mr-2" />
                                            Admin
                                        </motion.a>
                                    )}

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleLogout}
                                        className="flex items-center space-x-2 text-subtle hover:text-red-400 transition-colors duration-300"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span>Logout</span>
                                    </motion.button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <a href="/login" className="btn-outline-luxury">
                                        Sign In
                                    </a>
                                    <a href="/register" className="btn-luxury">
                                        Sign Up
                                    </a>
                                </div>
                            )}

                            {/* Mobile Menu Button */}
                            <button
                                className="md:hidden text-white"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="md:hidden bg-glass backdrop-blur-lg border-t border-gold/20"
                    >
                        <div className="px-6 py-4 space-y-4">
                            <a href="#home" className="block text-white hover:text-gradient-gold transition-colors">Home</a>
                            <a href="#properties" className="block text-white hover:text-gradient-gold transition-colors">Properties</a>
                            <a href="#about" className="block text-white hover:text-gradient-gold transition-colors">About</a>
                            <a href="#contact" className="block text-white hover:text-gradient-gold transition-colors">Contact</a>
                        </div>
                    </motion.div>
                )}
            </motion.nav>

            {/* Hero Section */}
            <section id="home" className="hero-luxury relative">
                <motion.div style={{ y: backgroundY }} className="absolute inset-0">
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                    >
                        <source src="https://videos.pexels.com/video-files/32200811/32200811-uhd_3840_2160_30fps.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
                </motion.div>

                <motion.div
                    style={{ y: textY }}
                    className="relative z-10 text-center px-6 max-w-6xl mx-auto"
                >
                    <motion.h1
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="text-6xl md:text-8xl font-bold text-luxury mb-6"
                    >
                        <span className="text-shimmer">Bhargavi Real Estate</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="text-2xl md:text-3xl text-subtle mb-8 max-w-4xl mx-auto"
                    >
                        Where Dreams Become Reality in Bangalore's Finest Properties
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 1.1 }}
                        className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-luxury text-xl px-12 py-4"
                        >
                            Explore Properties
                            <ChevronRight className="w-6 h-6 ml-2 inline" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-outline-luxury text-xl px-12 py-4"
                        >
                            <PlayCircle className="w-6 h-6 mr-2" />
                            Watch Tour
                        </motion.button>
                    </motion.div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
                >
                    <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
                        <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
                    </div>
                </motion.div>
            </section>

            {/* Stats Section */}
            <section className="py-20 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="card-luxury text-center hover-lift"
                            >
                                <stat.icon className="w-12 h-12 text-gradient-gold mx-auto mb-4" />
                                <div className="stat-counter text-gradient-gold">{stat.number}</div>
                                <p className="text-subtle mt-2">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Properties */}
            <section id="properties" className="py-20 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-luxury text-gradient-gold mb-6">Featured Properties</h2>
                        <p className="text-xl text-subtle max-w-3xl mx-auto">
                            Discover our handpicked selection of premium properties in Bangalore's most sought-after locations
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {properties.map((property, index) => (
                            <motion.div
                                key={property.id}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                                className="card-luxury hover-lift group cursor-pointer overflow-hidden"
                            >
                                <div className="relative overflow-hidden rounded-lg mb-6">
                                    <img
                                        src={property.image}
                                        alt={property.title}
                                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 left-4 bg-gradient-to-r from-primary-burgundy to-secondary-burgundy text-white px-3 py-1 rounded-full text-sm font-semibold">
                                        {property.type}
                                    </div>
                                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-bold">
                                        {property.price}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-luxury text-gradient-gold mb-2">{property.title}</h3>
                                <p className="text-subtle flex items-center">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    {property.location}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-20 px-6 relative">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-luxury text-gradient-gold mb-6">About Bhargavi Real Estate</h2>
                        <p className="text-xl text-subtle mb-8 leading-relaxed">
                            With over 15 years of excellence in Bangalore's real estate market, we are your trusted partner
                            in finding the perfect property. Our expertise spans luxury residences, commercial spaces, and
                            investment opportunities across the city's most prestigious locations.
                        </p>
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center space-x-4">
                                <div className="w-3 h-3 bg-gradient-to-r from-accent-gold to-primary-burgundy rounded-full"></div>
                                <span className="text-white">Premium property portfolio</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="w-3 h-3 bg-gradient-to-r from-accent-gold to-primary-burgundy rounded-full"></div>
                                <span className="text-white">Expert market analysis</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="w-3 h-3 bg-gradient-to-r from-accent-gold to-primary-burgundy rounded-full"></div>
                                <span className="text-white">Personalized client service</span>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-luxury"
                        >
                            Learn More About Us
                        </motion.button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="relative overflow-hidden rounded-2xl shadow-luxury">
                            <img
                                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                                alt="Bangalore Skyline"
                                className="w-full h-96 object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            <div className="absolute bottom-6 left-6 text-white">
                                <h3 className="text-2xl font-bold text-luxury">Bangalore</h3>
                                <p className="text-lg">India's Silicon Valley</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-luxury text-gradient-gold mb-6">Begin Your Luxury Journey</h2>
                        <p className="text-xl text-subtle max-w-3xl mx-auto">
                            Connect with our experts to discover your dream property in Bangalore
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="flex items-center space-x-4"
                            >
                                <div className="w-16 h-16 bg-gradient-to-r from-accent-gold to-primary-burgundy rounded-full flex items-center justify-center">
                                    <Phone className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-luxury text-gradient-gold">Call Us</h3>
                                    <p className="text-subtle">+91 98765 43210</p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="flex items-center space-x-4"
                            >
                                <div className="w-16 h-16 bg-gradient-to-r from-accent-gold to-primary-burgundy rounded-full flex items-center justify-center">
                                    <Mail className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-luxury text-gradient-gold">Email Us</h3>
                                    <p className="text-subtle">info@bhargavirealestate.com</p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-center space-x-4"
                            >
                                <div className="w-16 h-16 bg-gradient-to-r from-accent-gold to-primary-burgundy rounded-full flex items-center justify-center">
                                    <MapPin className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-luxury text-gradient-gold">Visit Us</h3>
                                    <p className="text-subtle">Koramangala, Bangalore</p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <motion.form
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                className="form-luxury"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <input
                                        type="text"
                                        placeholder="Your Name"
                                        className="input-luxury"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Your Email"
                                        className="input-luxury"
                                    />
                                </div>
                                <div className="mb-6">
                                    <input
                                        type="tel"
                                        placeholder="Your Phone"
                                        className="input-luxury w-full"
                                    />
                                </div>
                                <div className="mb-6">
                                    <textarea
                                        placeholder="Tell us about your property requirements..."
                                        rows={5}
                                        className="input-luxury w-full resize-none"
                                    ></textarea>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="btn-luxury w-full text-xl py-4"
                                >
                                    Submit Inquiry
                                    <ChevronRight className="w-6 h-6 ml-2 inline" />
                                </motion.button>
                            </motion.form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer-luxury py-16 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center space-x-4 mb-8"
                    >
                        <Home className="w-8 h-8 text-gradient-gold" />
                        <span className="text-3xl font-bold text-luxury text-gradient-gold">Bhargavi Real Estate</span>
                    </motion.div>
                    <p className="text-subtle mb-8 text-lg">
                        Your trusted partner for premium real estate solutions in Bangalore.
                    </p>
                    <div className="text-6xl font-bold text-luxury text-gradient-gold mb-8 float-animation">
                        BR
                    </div>
                    <p className="text-subtle">&copy; 2024 Bhargavi Real Estate. Crafting Legacies in Luxury.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage; 