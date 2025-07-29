import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from './config/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Components
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import AdminDashboard from './components/AdminDashboard';

// Types
import { UserProfile } from './types/User';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        try {
          // Fetch user profile from Firestore
          const userDoc = await getDoc(doc(db, 'realEstateUsers', user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Bhargavi Real Estate...</p>
        </div>
      </div>
    );
  }

  // Helper function to check if user has admin access
  const hasAdminAccess = (profile: UserProfile | null) => {
    return profile && ['admin', 'super_admin'].includes(profile.role);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/" replace /> : <Register />}
          />

          {/* Protected routes */}
          <Route
            path="/onboarding"
            element={
              <PrivateRoute>
                <Onboarding />
              </PrivateRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                {user && userProfile && hasAdminAccess(userProfile) ? (
                  <AdminDashboard user={user} userProfile={userProfile} />
                ) : (
                  <Navigate to="/" replace />
                )}
              </PrivateRoute>
            }
          />

          {/* Main app route */}
          <Route
            path="/"
            element={
              user ? (
                // Check if user needs onboarding
                userProfile && !userProfile.isOnboarded ? (
                  <Navigate to="/onboarding" replace />
                ) : (
                  <LandingPage user={user} />
                )
              ) : (
                <LandingPage user={null} />
              )
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
