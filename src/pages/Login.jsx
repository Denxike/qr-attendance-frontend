import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/Login.css';
import { ScanQrCode,Eye, EyeClosed } from 'lucide-react';

const Login = () => {

    const navigate = useNavigate();
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setApiError('');

        try {
            // ✅ Direct fetch - no axios, no imports needed
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                setApiError(data.message || 'Login failed');
                return;
            }

            console.log('Login success:', data);

            // Save to context
            login({
                userId: data.userId,
                studentId: data.studentId,
                teacherId: data.teacherId,
                email: data.email,
                fullName: data.fullName,
                role: data.role
            }, data.token);

            // Redirect
            if (data.role === 'STUDENT') navigate('/student/dashboard');
            else if (data.role === 'TEACHER') navigate('/teacher/dashboard');
            else if (data.role === 'ADMIN') navigate('/admin/dashboard');

        } catch (error) {
            console.error('Login error:', error);
            setApiError('Cannot connect to server. Is Spring Boot running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">

                <div className="login-header">
                    <div className="logo"><ScanQrCode /></div>
                    <h1>Welcome Back</h1>
                    <p>Sign in to your attendance account</p>
                </div>

                {apiError && (
                    <div className="alert-error">⚠️ {apiError}</div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group psw-group">
                        <label>Password</label>

                        <div className="psw-container">

                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeClosed /> : <Eye />}
                        </button>
                        </div>
                            
                    </div>

                    <button
                        type="submit"
                        className={`btn-login ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? '' : 'Sign In'}
                    </button>

                </form>

                <div className="login-footer">
                    <div className="divider">or</div>
                    Don't have an account?{' '}
                    <Link to="/register">Create Account</Link>
                </div>

            </div>
        </div>
    );
};

export default Login;