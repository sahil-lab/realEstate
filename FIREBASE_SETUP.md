# Firebase Setup Guide for Bhargavi Real Estate

This guide will help you set up Firebase authentication for your real estate application.

## 🔥 Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `bhargavi-real-estate` (or your preferred name)
4. Disable Google Analytics (optional) or keep it enabled
5. Click "Create project"

## 🌐 Step 2: Set up Web App

1. In your Firebase project dashboard, click the **Web icon** `</>`
2. Enter app nickname: `Bhargavi Real Estate Web`
3. **Do NOT** check "Set up Firebase Hosting" (we'll use Vite's dev server)
4. Click "Register app"
5. **Copy the Firebase configuration object** - you'll need this!

## 🔐 Step 3: Enable Authentication

1. In the Firebase Console, go to **Authentication** → **Get started**
2. Go to **Sign-in method** tab
3. Enable Email/Password and Google authentication

## ⚙️ Step 4: Update Environment Variables

Open your `.env` file and replace with your actual Firebase config:

```env
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## 🧪 Step 5: Test the Setup

```bash
npm run start:all
```

Open `http://localhost:5173` and try registering a new account!