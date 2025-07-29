import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Home,
    Users,
    MessageSquare,
    BarChart3,
    Plus,
    Edit,
    Trash2,
    Eye,
    Shield,
    User,
    Building,
    TrendingUp,
    Mail,
    Phone
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { UserProfile } from '../types/User';
import { Property, Inquiry, PropertyStats } from '../types/Property';
import { propertyAPI, userAPI, inquiryAPI, analyticsAPI } from '../services/apiService';

interface AdminDashboardProps {
    user: FirebaseUser;
    userProfile: UserProfile;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, userProfile }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [properties, setProperties] = useState<Property[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [stats, setStats] = useState<PropertyStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Load analytics
            const analyticsData = await analyticsAPI.getDashboard();
            setStats(analyticsData);

            // Load properties
            const propertiesData = await propertyAPI.getAll();
            setProperties(propertiesData.properties || []);

            // Load inquiries
            const inquiriesData = await inquiryAPI.getAll();
            setInquiries(inquiriesData.inquiries || []);

            // Load users if super admin
            if (userProfile.role === 'super_admin') {
                const usersData = await userAPI.getAllUsers();
                setUsers(usersData.users || []);
            }

        } catch (err: any) {
            setError(err.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId: string, newRole: string) => {
        try {
            await userAPI.updateUserRole(userId, newRole, user.uid);
            await loadDashboardData(); // Reload data
        } catch (err: any) {
            setError(err.message || 'Failed to update user role');
        }
    };

    const handlePropertyDelete = async (propertyId: string) => {
        if (!confirm('Are you sure you want to delete this property?')) return;

        try {
            await propertyAPI.delete(propertyId, user.uid);
            await loadDashboardData(); // Reload data
        } catch (err: any) {
            setError(err.message || 'Failed to delete property');
        }
    };

    const handleInquiryStatusUpdate = async (inquiryId: string, status: string) => {
        try {
            await inquiryAPI.updateStatus(inquiryId, status, user.uid);
            await loadDashboardData(); // Reload data
        } catch (err: any) {
            setError(err.message || 'Failed to update inquiry status');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                            <p className="text-gray-600">Welcome back, {userProfile.displayName}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Shield className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-green-600 capitalize">
                                {userProfile.role.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { id: 'overview', label: 'Overview', icon: BarChart3 },
                            { id: 'properties', label: 'Properties', icon: Home },
                            { id: 'inquiries', label: 'Inquiries', icon: MessageSquare },
                            ...(userProfile.role === 'super_admin' ? [{ id: 'users', label: 'Users', icon: Users }] : []),
                        ].map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                        ? 'border-green-500 text-green-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <p className="text-red-800">{error}</p>
                        <button
                            onClick={() => setError('')}
                            className="mt-2 text-sm text-red-600 hover:text-red-800"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats && [
                            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue' },
                            { label: 'Total Properties', value: stats.totalProperties, icon: Home, color: 'green' },
                            { label: 'Total Inquiries', value: stats.totalInquiries, icon: MessageSquare, color: 'yellow' },
                            { label: 'Pending Inquiries', value: stats.pendingInquiries, icon: TrendingUp, color: 'red' },
                        ].map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-lg shadow p-6"
                                >
                                    <div className="flex items-center">
                                        <div className={`p-3 rounded-md bg-${stat.color}-100`}>
                                            <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'properties' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Properties</h2>
                            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                                <Plus className="w-4 h-4" />
                                <span>Add Property</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {properties.map((property) => (
                                <motion.div
                                    key={property._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
                                >
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900 truncate">{property.title}</h3>
                                            <span className={`px-2 py-1 text-xs rounded-full ${property.status === 'active' ? 'bg-green-100 text-green-800' :
                                                property.status === 'sold' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {property.status}
                                            </span>
                                        </div>

                                        <p className="text-gray-600 text-sm mb-2">{property.location.address}, {property.location.city}</p>
                                        <p className="text-2xl font-bold text-green-600 mb-4">{formatCurrency(property.price)}</p>

                                        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                                            <span>{property.specifications.area} {property.specifications.areaUnit}</span>
                                            <span className="capitalize">{property.type}</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <button className="text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                                                <Eye className="w-4 h-4" />
                                                <span>View</span>
                                            </button>
                                            <button className="text-green-600 hover:text-green-800 flex items-center space-x-1">
                                                <Edit className="w-4 h-4" />
                                                <span>Edit</span>
                                            </button>
                                            <button
                                                onClick={() => handlePropertyDelete(property._id)}
                                                className="text-red-600 hover:text-red-800 flex items-center space-x-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span>Delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'inquiries' && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Inquiries</h2>

                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ul className="divide-y divide-gray-200">
                                {inquiries.map((inquiry) => (
                                    <li key={inquiry._id} className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-lg font-medium text-gray-900">{inquiry.userName}</p>
                                                    <div className="flex items-center space-x-2">
                                                        <select
                                                            value={inquiry.status}
                                                            onChange={(e) => handleInquiryStatusUpdate(inquiry._id, e.target.value)}
                                                            className="text-sm border border-gray-300 rounded-md px-2 py-1"
                                                        >
                                                            <option value="pending">Pending</option>
                                                            <option value="contacted">Contacted</option>
                                                            <option value="interested">Interested</option>
                                                            <option value="not_interested">Not Interested</option>
                                                            <option value="closed">Closed</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                                                    <div className="flex items-center space-x-1">
                                                        <Mail className="w-4 h-4" />
                                                        <span>{inquiry.userEmail}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Phone className="w-4 h-4" />
                                                        <span>{inquiry.userPhone}</span>
                                                    </div>
                                                </div>

                                                <p className="mt-2 text-gray-600">{inquiry.message}</p>
                                                <p className="mt-2 text-xs text-gray-400">
                                                    {new Date(inquiry.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && userProfile.role === 'super_admin' && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Users</h2>

                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ul className="divide-y divide-gray-200">
                                {users.map((userItem) => (
                                    <li key={userItem.uid} className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                                    <User className="w-6 h-6 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-medium text-gray-900">{userItem.displayName}</p>
                                                    <p className="text-gray-600">{userItem.email}</p>
                                                    <p className="text-sm text-gray-500">
                                                        Joined: {new Date(userItem.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <select
                                                    value={userItem.role}
                                                    onChange={(e) => handleRoleUpdate(userItem.uid, e.target.value)}
                                                    className="border border-gray-300 rounded-md px-3 py-1"
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                    <option value="super_admin">Super Admin</option>
                                                </select>

                                                <span className={`px-3 py-1 text-xs rounded-full ${userItem.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                                                    userItem.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {userItem.role.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard; 