const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sahilaps2k12:oK4nFmyRXPQ0HYBY@cluster0.6sljnqm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'bhargaviRealEstate';

let db;

// Connect to MongoDB
MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to MongoDB');
        db = client.db(DB_NAME);
    })
    .catch(error => console.error('MongoDB connection error:', error));

// Middleware
app.use(cors());
app.use(express.json());

// ==================== USER MANAGEMENT ROUTES ====================

// Get user profile
app.get('/api/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const collection = db.collection('realEstateUsers');

        const user = await collection.findOne({ uid: userId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Update user profile
app.put('/api/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const updateData = req.body;
        const collection = db.collection('realEstateUsers');

        await collection.updateOne(
            { uid: userId },
            { $set: { ...updateData, updatedAt: new Date() } }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Get all users (Admin only)
app.get('/api/admin/users', async (req, res) => {
    try {
        const collection = db.collection('realEstateUsers');
        const users = await collection.find({}).toArray();

        res.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Update user role (Super Admin only)
app.put('/api/admin/users/:userId/role', async (req, res) => {
    try {
        const { userId } = req.params;
        const { role, adminUserId } = req.body;

        // Verify admin user has super_admin role
        const adminUser = await db.collection('realEstateUsers').findOne({ uid: adminUserId });
        if (!adminUser || adminUser.role !== 'super_admin') {
            return res.status(403).json({ error: 'Unauthorized: Super admin access required' });
        }

        const collection = db.collection('realEstateUsers');

        await collection.updateOne(
            { uid: userId },
            { $set: { role, updatedAt: new Date() } }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ error: 'Failed to update user role' });
    }
});

// ==================== PROPERTY MANAGEMENT ROUTES ====================

// Get all properties
app.get('/api/properties', async (req, res) => {
    try {
        const collection = db.collection('properties');
        const properties = await collection.find({ status: 'active' }).toArray();

        res.json({ properties });
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ error: 'Failed to fetch properties' });
    }
});

// Get property by ID
app.get('/api/properties/:propertyId', async (req, res) => {
    try {
        const { propertyId } = req.params;
        const collection = db.collection('properties');

        const property = await collection.findOne({ _id: new ObjectId(propertyId) });

        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        res.json({ property });
    } catch (error) {
        console.error('Error fetching property:', error);
        res.status(500).json({ error: 'Failed to fetch property' });
    }
});

// Create property (Admin only)
app.post('/api/admin/properties', async (req, res) => {
    try {
        const propertyData = req.body;
        const { adminUserId } = req.body;

        // Verify admin user has admin or super_admin role
        const adminUser = await db.collection('realEstateUsers').findOne({ uid: adminUserId });
        if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
            return res.status(403).json({ error: 'Unauthorized: Admin access required' });
        }

        const collection = db.collection('properties');

        const property = {
            ...propertyData,
            createdBy: adminUserId,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'active'
        };

        const result = await collection.insertOne(property);

        res.json({ success: true, propertyId: result.insertedId });
    } catch (error) {
        console.error('Error creating property:', error);
        res.status(500).json({ error: 'Failed to create property' });
    }
});

// Update property (Admin only)
app.put('/api/admin/properties/:propertyId', async (req, res) => {
    try {
        const { propertyId } = req.params;
        const updateData = req.body;
        const { adminUserId } = req.body;

        // Verify admin user has admin or super_admin role
        const adminUser = await db.collection('realEstateUsers').findOne({ uid: adminUserId });
        if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
            return res.status(403).json({ error: 'Unauthorized: Admin access required' });
        }

        const collection = db.collection('properties');

        await collection.updateOne(
            { _id: new ObjectId(propertyId) },
            { $set: { ...updateData, updatedAt: new Date() } }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating property:', error);
        res.status(500).json({ error: 'Failed to update property' });
    }
});

// Delete property (Admin only)
app.delete('/api/admin/properties/:propertyId', async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { adminUserId } = req.body;

        // Verify admin user has admin or super_admin role
        const adminUser = await db.collection('realEstateUsers').findOne({ uid: adminUserId });
        if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
            return res.status(403).json({ error: 'Unauthorized: Admin access required' });
        }

        const collection = db.collection('properties');

        await collection.updateOne(
            { _id: new ObjectId(propertyId) },
            { $set: { status: 'deleted', deletedAt: new Date() } }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting property:', error);
        res.status(500).json({ error: 'Failed to delete property' });
    }
});

// ==================== INQUIRY MANAGEMENT ROUTES ====================

// Create inquiry
app.post('/api/inquiries', async (req, res) => {
    try {
        const inquiryData = req.body;
        const collection = db.collection('inquiries');

        const inquiry = {
            ...inquiryData,
            createdAt: new Date(),
            status: 'pending'
        };

        const result = await collection.insertOne(inquiry);

        res.json({ success: true, inquiryId: result.insertedId });
    } catch (error) {
        console.error('Error creating inquiry:', error);
        res.status(500).json({ error: 'Failed to create inquiry' });
    }
});

// Get user inquiries
app.get('/api/inquiries/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const collection = db.collection('inquiries');

        const inquiries = await collection.find({ userId }).toArray();

        res.json({ inquiries });
    } catch (error) {
        console.error('Error fetching inquiries:', error);
        res.status(500).json({ error: 'Failed to fetch inquiries' });
    }
});

// Get all inquiries (Admin only)
app.get('/api/admin/inquiries', async (req, res) => {
    try {
        const collection = db.collection('inquiries');
        const inquiries = await collection.find({}).sort({ createdAt: -1 }).toArray();

        res.json({ inquiries });
    } catch (error) {
        console.error('Error fetching inquiries:', error);
        res.status(500).json({ error: 'Failed to fetch inquiries' });
    }
});

// Update inquiry status (Admin only)
app.put('/api/admin/inquiries/:inquiryId', async (req, res) => {
    try {
        const { inquiryId } = req.params;
        const { status, adminUserId } = req.body;

        // Verify admin user has admin or super_admin role
        const adminUser = await db.collection('realEstateUsers').findOne({ uid: adminUserId });
        if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
            return res.status(403).json({ error: 'Unauthorized: Admin access required' });
        }

        const collection = db.collection('inquiries');

        await collection.updateOne(
            { _id: new ObjectId(inquiryId) },
            { $set: { status, updatedAt: new Date() } }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating inquiry:', error);
        res.status(500).json({ error: 'Failed to update inquiry' });
    }
});

// ==================== FAVORITES MANAGEMENT ROUTES ====================

// Get user favorites
app.get('/api/favorites/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const collection = db.collection('favorites');

        const favorites = await collection.find({ userId }).toArray();

        res.json({ favorites });
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ error: 'Failed to fetch favorites' });
    }
});

// Add to favorites
app.post('/api/favorites', async (req, res) => {
    try {
        const { userId, propertyId } = req.body;
        const collection = db.collection('favorites');

        // Check if already favorited
        const existing = await collection.findOne({ userId, propertyId });
        if (existing) {
            return res.status(400).json({ error: 'Property already in favorites' });
        }

        const favorite = {
            userId,
            propertyId,
            createdAt: new Date()
        };

        await collection.insertOne(favorite);

        res.json({ success: true });
    } catch (error) {
        console.error('Error adding favorite:', error);
        res.status(500).json({ error: 'Failed to add favorite' });
    }
});

// Remove from favorites
app.delete('/api/favorites', async (req, res) => {
    try {
        const { userId, propertyId } = req.body;
        const collection = db.collection('favorites');

        await collection.deleteOne({ userId, propertyId });

        res.json({ success: true });
    } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({ error: 'Failed to remove favorite' });
    }
});

// ==================== ANALYTICS ROUTES ====================

// Get dashboard analytics (Admin only)
app.get('/api/admin/analytics', async (req, res) => {
    try {
        const usersCollection = db.collection('realEstateUsers');
        const propertiesCollection = db.collection('properties');
        const inquiriesCollection = db.collection('inquiries');

        const totalUsers = await usersCollection.countDocuments();
        const totalProperties = await propertiesCollection.countDocuments({ status: 'active' });
        const totalInquiries = await inquiriesCollection.countDocuments();
        const pendingInquiries = await inquiriesCollection.countDocuments({ status: 'pending' });

        // Recent users (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentUsers = await usersCollection.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        res.json({
            totalUsers,
            totalProperties,
            totalInquiries,
            pendingInquiries,
            recentUsers
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Bhargavi Real Estate API is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 