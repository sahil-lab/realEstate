const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// API utility functions
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, mergedOptions);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
};

// User Management API
export const userAPI = {
    // Get user profile
    getProfile: async (userId: string) => {
        return apiCall(`/api/users/${userId}`);
    },

    // Update user profile
    updateProfile: async (userId: string, data: any) => {
        return apiCall(`/api/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    // Get all users (Admin only)
    getAllUsers: async () => {
        return apiCall('/api/admin/users');
    },

    // Update user role (Super Admin only)
    updateUserRole: async (userId: string, role: string, adminUserId: string) => {
        return apiCall(`/api/admin/users/${userId}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role, adminUserId }),
        });
    },
};

// Property Management API
export const propertyAPI = {
    // Get all properties
    getAll: async () => {
        return apiCall('/api/properties');
    },

    // Get property by ID
    getById: async (propertyId: string) => {
        return apiCall(`/api/properties/${propertyId}`);
    },

    // Create property (Admin only)
    create: async (propertyData: any, adminUserId: string) => {
        return apiCall('/api/admin/properties', {
            method: 'POST',
            body: JSON.stringify({ ...propertyData, adminUserId }),
        });
    },

    // Update property (Admin only)
    update: async (propertyId: string, propertyData: any, adminUserId: string) => {
        return apiCall(`/api/admin/properties/${propertyId}`, {
            method: 'PUT',
            body: JSON.stringify({ ...propertyData, adminUserId }),
        });
    },

    // Delete property (Admin only)
    delete: async (propertyId: string, adminUserId: string) => {
        return apiCall(`/api/admin/properties/${propertyId}`, {
            method: 'DELETE',
            body: JSON.stringify({ adminUserId }),
        });
    },
};

// Inquiry Management API
export const inquiryAPI = {
    // Create inquiry
    create: async (inquiryData: any) => {
        return apiCall('/api/inquiries', {
            method: 'POST',
            body: JSON.stringify(inquiryData),
        });
    },

    // Get user inquiries
    getUserInquiries: async (userId: string) => {
        return apiCall(`/api/inquiries/user/${userId}`);
    },

    // Get all inquiries (Admin only)
    getAll: async () => {
        return apiCall('/api/admin/inquiries');
    },

    // Update inquiry status (Admin only)
    updateStatus: async (inquiryId: string, status: string, adminUserId: string) => {
        return apiCall(`/api/admin/inquiries/${inquiryId}`, {
            method: 'PUT',
            body: JSON.stringify({ status, adminUserId }),
        });
    },
};

// Favorites Management API
export const favoritesAPI = {
    // Get user favorites
    getUserFavorites: async (userId: string) => {
        return apiCall(`/api/favorites/${userId}`);
    },

    // Add to favorites
    add: async (userId: string, propertyId: string) => {
        return apiCall('/api/favorites', {
            method: 'POST',
            body: JSON.stringify({ userId, propertyId }),
        });
    },

    // Remove from favorites
    remove: async (userId: string, propertyId: string) => {
        return apiCall('/api/favorites', {
            method: 'DELETE',
            body: JSON.stringify({ userId, propertyId }),
        });
    },
};

// Analytics API
export const analyticsAPI = {
    // Get dashboard analytics (Admin only)
    getDashboard: async () => {
        return apiCall('/api/admin/analytics');
    },
};

// Health check
export const healthCheck = async () => {
    return apiCall('/api/health');
}; 