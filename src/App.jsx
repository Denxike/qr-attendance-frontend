import React, { lazy, Suspense } from 'react'; // Added lazy and Suspense
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MarkAttendance from './pages/student/MarkAttendance';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const TeacherDashboard = lazy(() => import('./pages/teacher/TeacherDashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
function App() {
    return (
        <AuthProvider>
            <Router>
                {/* Wrap Routes in Suspense */}
                <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
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
                        
                        {/* Add your Teacher and Admin routes here as well */}
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
                        <Route path="/super-admin-dashboard" element={<SuperAdminDashboard />} />
                    
                    {/* Default redirect */}
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="*" element={<Navigate to="/login" />} />
                      <Route path="/mark-attendance" element={<MarkAttendance />} />
                    </Routes>
                </Suspense>
            </Router>
        </AuthProvider>
    );
}

export default App;
