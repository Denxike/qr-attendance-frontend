import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                
                // Check if token is expired
                if (decoded.exp * 1000 < Date.now()) {
                    console.log('Token expired');
                    logout();
                    return;
                }
                
                const userData = {
                    userId: decoded.userId,
                    email: decoded.sub,
                    fullName: decoded.fullName,
                    role: decoded.role,
                    studentId: decoded.studentId || null,
                    teacherId: decoded.teacherId || null
                };
                
                console.log('User data from token:', userData);
                setUser(userData);
            } catch (error) {
                console.error('Error decoding token:', error);
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            console.log('Attempting login:', email);
            const response = await authAPI.login(email, password);
            console.log('Login response:', response.data);
            
            const { token } = response.data;
            localStorage.setItem('token', token);
            
            const decoded = jwtDecode(token);
            console.log('Decoded token:', decoded);
            
            const userData = {
                userId: decoded.userId,
                email: decoded.sub,
                fullName: decoded.fullName,
                role: decoded.role,
                studentId: decoded.studentId || null,
                teacherId: decoded.teacherId || null
            };
            
            console.log('Setting user data:', userData);
            setUser(userData);
            
            // Route based on role
            console.log('Routing based on role:', decoded.role);
            
            if (decoded.role === 'SUPER_ADMIN') {
                navigate('/super-admin-dashboard');
            } else if (decoded.role === 'ADMIN') {
                navigate('/admin-dashboard');
            } else if (decoded.role === 'TEACHER') {
                navigate('/teacher-dashboard');
            } else if (decoded.role === 'STUDENT') {
                navigate('/student-dashboard');
            } else {
                console.error('Unknown role:', decoded.role);
                navigate('/');
            }
            
            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            console.error('Error response:', error.response?.data);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            console.log('Attempting registration:', userData);
            const response = await authAPI.register(userData);
            console.log('Registration response:', response.data);
            
            const { token } = response.data;
            localStorage.setItem('token', token);
            
            const decoded = jwtDecode(token);
            console.log('Decoded token after registration:', decoded);
            
            const userInfo = {
                userId: decoded.userId,
                email: decoded.sub,
                fullName: decoded.fullName,
                role: decoded.role,
                studentId: decoded.studentId || null,
                teacherId: decoded.teacherId || null
            };
            
            console.log('Setting user data after registration:', userInfo);
            setUser(userInfo);
            
            // Route based on role
            console.log('Routing after registration, role:', decoded.role);
            
            if (decoded.role === 'SUPER_ADMIN') {
                navigate('/super-admin-dashboard');
            } else if (decoded.role === 'ADMIN') {
                navigate('/admin-dashboard');
            } else if (decoded.role === 'TEACHER') {
                navigate('/teacher-dashboard');
            } else if (decoded.role === 'STUDENT') {
                navigate('/student-dashboard');
            } else {
                console.error('Unknown role:', decoded.role);
                navigate('/');
            }
            
            return response.data;
        } catch (error) {
            console.error('Registration error:', error);
            console.error('Error response:', error.response?.data);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};