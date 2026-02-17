
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* Student Routes */}
                    <Route 
                        path="/student/dashboard" 
                        element={
                            <ProtectedRoute allowedRoles={['STUDENT']}>
                                <StudentDashboard />
                            </ProtectedRoute>
                        } 
                    />
                    
                    {/* Teacher Routes */}
                    <Route 
                        path="/teacher/dashboard" 
                        element={
                            <ProtectedRoute allowedRoles={['TEACHER']}>
                                <TeacherDashboard />
                            </ProtectedRoute>
                        } 
                    />
                    <Route
                            path="/admin/dashboard"
                            element={
                                <ProtectedRoute allowedRoles={['ADMIN']}>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />
                    
                    {/* Default redirect */}
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="*" element={<Navigate to="/login" />} />
                    
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
