import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Workouts from './pages/Workouts/Workouts';
import Activity from './pages/Activity/Activity';
import Hydration from './pages/Hydration/Hydration';
import Sleep from './pages/Sleep/Sleep';
import Goals from './pages/Goals/Goals';
import Progress from './pages/Progress/Progress';
import Settings from './pages/Settings/Settings';
import NotFound from './pages/NotFound';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0F17]">
        <LoadingSpinner size="lg" text="Restoring your FitTrack session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Public Route Guard (prevents logged in users from seeing login/register)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0F17]">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export const App = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected Application Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="workouts" element={<Workouts />} />
        <Route path="activity" element={<Activity />} />
        <Route path="hydration" element={<Hydration />} />
        <Route path="sleep" element={<Sleep />} />
        <Route path="goals" element={<Goals />} />
        <Route path="progress" element={<Progress />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
