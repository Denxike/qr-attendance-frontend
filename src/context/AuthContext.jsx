import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
    const response = await authAPI.login(email, password);
    const { token } = response.data;
    
    localStorage.setItem('token', token);
    const decoded = jwtDecode(token);
    
    const userData = {
        userId: decoded.userId,
        email: decoded.sub,
        fullName: decoded.fullName,
        role: decoded.role,
        studentId: decoded.studentId || null,
        teacherId: decoded.teacherId || null
    };
    
    setUser(userData);
    
    // Route based on role
    if (decoded.role === 'SUPER_ADMIN') {
        navigate('/super-admin-dashboard');
    } else if (decoded.role === 'ADMIN') {
        navigate('/admin-dashboard');
    } else if (decoded.role === 'TEACHER') {
        navigate('/teacher-dashboard');
    } else if (decoded.role === 'STUDENT') {
        navigate('/student-dashboard');
    }
};

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const hasRole = (role) => {
        return user?.role === role;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, hasRole, loading }}>
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

export default AuthContext;