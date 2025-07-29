# 🚀 Quick Start Guide

Get your Bhargavi Real Estate application up and running in minutes!

## ⚡ Immediate Setup (5 minutes)

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Set up Firebase (Required)
1. Follow the **FIREBASE_SETUP.md** guide to create your Firebase project
2. Update the `.env` file with your Firebase configuration
3. Enable Email/Password and Google authentication in Firebase Console

### 3. Start Everything
```bash
npm run start:all
```

This will start:
- ✅ Backend API server on `http://localhost:3001`
- ✅ Frontend development server on `http://localhost:5173`

### 4. Test the Application
1. Open `http://localhost:5173` in your browser
2. Click "Sign Up" to create a new account
3. Complete the 4-step onboarding process
4. Explore the beautiful landing page!

## 🎯 What You Get

### ✅ **Authentication System**
- Email/Password registration and login
- Google OAuth integration
- Role-based access control (User, Admin, Super Admin)
- Protected routes and session management

### ✅ **User Onboarding**
- 4-step personalized onboarding flow:
  1. Personal information (name, phone, WhatsApp)
  2. Property interests (residential, commercial, etc.)
  3. Budget preferences
  4. Location preferences

### ✅ **Beautiful UI/UX**
- Responsive design for all devices
- Smooth animations with Framer Motion
- Glass morphism effects
- Sticky navigation with login/logout
- Real estate themed color scheme

### ✅ **Admin Features**
- Admin dashboard at `/admin`
- Property management (Create, Read, Update, Delete)
- User management (role assignments)
- Inquiry management
- Analytics dashboard

### ✅ **Backend API**
- Complete REST API with MongoDB
- User management endpoints
- Property management endpoints
- Role-based authorization
- Analytics and reporting

## 🔑 Default User Roles

- **👤 User**: Can view properties, save favorites, submit inquiries
- **👨‍💼 Admin**: Can manage properties and view inquiries
- **👑 Super Admin**: Can manage users and promote/demote admins

## 🛠️ Development Commands

```bash
# Install all dependencies (frontend + backend)
npm run install:all

# Start both frontend and backend
npm run start:all

# Start only frontend
npm run dev

# Start only backend
cd server && npm start

# Build for production
npm run build
```

## 📱 Testing the Admin Dashboard

1. Register a new account
2. Go to Firebase Console → Firestore → `realEstateUsers` collection
3. Find your user document and change `role` from `"user"` to `"admin"` or `"super_admin"`
4. Refresh the application
5. You'll see an "Admin" link in the header
6. Click it to access the admin dashboard at `/admin`

## 🎉 You're Ready to Go!

Your full-featured real estate application is now running with:
- ✅ Complete authentication system
- ✅ User onboarding flow
- ✅ Admin dashboard
- ✅ Role-based access control
- ✅ Beautiful responsive UI
- ✅ MongoDB integration
- ✅ Firebase authentication

Start building your real estate empire! 🏠✨ 