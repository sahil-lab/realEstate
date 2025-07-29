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
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding before
    const onboardingSeen = localStorage.getItem('bhargavi-onboarding-seen');
    if (onboardingSeen) {
      setHasSeenOnboarding(true);
    }

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
      <div className="min-h-screen flex items-center justify-center bg-animated-luxury">
        <div className="text-center">
          <div className="luxury-spinner w-16 h-16 mx-auto mb-4"></div>
          <p className="text-subtle text-lg">Loading Bhargavi Real Estate...</p>
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
            element={user ? <Navigate to="/app" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/app" replace /> : <Register />}
          />

          {/* Onboarding route - Default for new visitors */}
          <Route
            path="/onboarding"
            element={<Onboarding />}
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                {user && userProfile && hasAdminAccess(userProfile) ? (
                  <AdminDashboard user={user} userProfile={userProfile} />
                ) : (
                  <Navigate to="/app" replace />
                )}
              </PrivateRoute>
            }
          />

          {/* Main app route */}
          <Route
            path="/app"
            element={
              user ? (
                // Authenticated users - check if they need onboarding
                userProfile && !userProfile.isOnboarded ? (
                  <Navigate to="/onboarding" replace />
                ) : (
                  <LandingPage user={user} />
                )
              ) : (
                // Non-authenticated users see landing page
                <LandingPage user={null} />
              )
            }
          />

          {/* Default route - Show onboarding first, then redirect based on status */}
          <Route
            path="/"
            element={
              !hasSeenOnboarding ? (
                <Navigate to="/onboarding" replace />
              ) : user ? (
                // User has seen onboarding and is logged in
                userProfile && !userProfile.isOnboarded ? (
                  <Navigate to="/onboarding" replace />
                ) : (
                  <Navigate to="/app" replace />
                )
              ) : (
                // User has seen onboarding but not logged in
                <Navigate to="/app" replace />
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
