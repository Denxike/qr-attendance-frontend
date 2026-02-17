import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Redirects to login if not authenticated
// Redirects to correct dashboard if wrong role
const ProtectedRoute = ({ children, allowedRoles }) => {
    
    const { user, loading } = useAuth();
    
    // Show nothing while checking auth
    if (loading) return <div>Loading...</div>;
    
    // Not logged in → redirect to login
    if (!user) return <Navigate to="/login" />;
    
    // Wrong role → redirect to their dashboard
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" />;
        if (user.role === 'TEACHER') return <Navigate to="/teacher/dashboard" />;
    }
    
    return children;
};

export default ProtectedRoute;