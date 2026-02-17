import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Check, CircleAlert, GraduationCap,Presentation } from 'lucide-react';
import '../css/Register.css';

const Register = () => {
    
    const navigate = useNavigate();
    
    // Selected role (STUDENT or TEACHER)
    const [role, setRole] = useState('STUDENT');
    
    // Form state
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        // Student specific
        studentId: '',
        yearOfStudy: '',
        departmentId: '',
        phoneNumber: '',
        // Teacher specific
        employeeId: ''
    });
    
    // UI state
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear errors on typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        setApiError('');
    };
    
    // Handle role selection
    const handleRoleChange = (selectedRole) => {
        setRole(selectedRole);
        setErrors({});
        setApiError('');
    };
    
    // Validate form
    const validate = () => {
        const newErrors = {};
        
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }
        
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        if (!formData.departmentId) {
            newErrors.departmentId = 'Department is required';
        }
        
        if (!formData.phoneNumber) {
            newErrors.phoneNumber = 'Phone number is required';
        }
        
        // Student specific
        if (role === 'STUDENT') {
            if (!formData.studentId.trim()) {
                newErrors.studentId = 'Student ID is required';
            }
            if (!formData.yearOfStudy) {
                newErrors.yearOfStudy = 'Year of study is required';
            }
        }
        
        // Teacher specific
        if (role === 'TEACHER') {
            if (!formData.employeeId.trim()) {
                newErrors.employeeId = 'Employee ID is required';
            }
        }
        
        return newErrors;
    };
    
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        setLoading(true);
        setApiError('');
        setSuccess('');
        
        try {
            // Build request based on role
            if (role === 'STUDENT') {
                const studentData = {
                    email: formData.email,
                    password: formData.password,
                    fullName: formData.fullName,
                    studentId: formData.studentId,
                    departmentId: parseInt(formData.departmentId),
                    yearOfStudy: parseInt(formData.yearOfStudy),
                    phoneNumber: formData.phoneNumber
                };
                await authAPI.registerStudent(studentData);
                
            } else {
                const teacherData = {
                    email: formData.email,
                    password: formData.password,
                    fullName: formData.fullName,
                    employeeId: formData.employeeId,
                    departmentId: parseInt(formData.departmentId),
                    phoneNumber: formData.phoneNumber
                };
                await authAPI.registerTeacher(teacherData);
            }
            
            setSuccess('Registration successful! Redirecting to login...');
            
            // Redirect after 2 seconds
            setTimeout(() => navigate('/login'), 2000);
            
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed. Try again.';
            setApiError(message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="register-container">
            <div className="register-card">
                
                {/* Header */}
                <div className="register-header">
                    <h1>Create Account</h1>
                    <p>Join the QR Attendance System</p>
                </div>
                
                {/* Role Selector */}
                <div className="role-selector">
                    <button
                        type="button"
                        className={`role-btn ${role === 'STUDENT' ? 'active' : ''}`}
                        onClick={() => handleRoleChange('STUDENT')}
                    >
                        <span className="role-icon"><GraduationCap /></span>
                        Student
                    </button>
                    <button
                        type="button"
                        className={`role-btn ${role === 'TEACHER' ? 'active' : ''}`}
                        onClick={() => handleRoleChange('TEACHER')}
                    >
                        <span className="role-icon"><Presentation /></span>
                        Teacher
                    </button>
                </div>
                
                {/* Alerts */}
                {apiError && (
                    <div className="alert-error"><CircleAlert /> {apiError}</div>
                )}
                {success && (
                    <div className="alert-success"><Check /> {success}</div>
                )}
                
                {/* Registration Form */}
                <form onSubmit={handleSubmit}>
                    
                    {/* Full Name */}
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            className={errors.fullName ? 'error' : ''}
                        />
                        {errors.fullName && (
                            <span className="error-message">{errors.fullName}</span>
                        )}
                    </div>
                    
                    {/* Email */}
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            className={errors.email ? 'error' : ''}
                        />
                        {errors.email && (
                            <span className="error-message">{errors.email}</span>
                        )}
                    </div>
                    
                    {/* Department */}
                    <div className="form-group">
                        <label>Department</label>
                        <select
                            name="departmentId"
                            value={formData.departmentId}
                            onChange={handleChange}
                            className={errors.departmentId ? 'error' : ''}
                        >
                            <option value="">Select Department</option>
                            <option value="1">Computer Science</option>
                            <option value="2">Engineering</option>
                            <option value="3">Business</option>
                            <option value="4">Mathematics</option>
                        </select>
                        {errors.departmentId && (
                            <span className="error-message">{errors.departmentId}</span>
                        )}
                    </div>
                    
                    {/* Student Specific Fields */}
                    {role === 'STUDENT' && (
                        <>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Student ID</label>
                                    <input
                                        type="text"
                                        name="studentId"
                                        value={formData.studentId}
                                        onChange={handleChange}
                                        placeholder="e.g. S13/20240/22"
                                        className={errors.studentId ? 'error' : ''}
                                    />
                                    {errors.studentId && (
                                        <span className="error-message">{errors.studentId}</span>
                                    )}
                                </div>
                                
                                <div className="form-group">
                                    <label>Year of Study</label>
                                    <select
                                        name="yearOfStudy"
                                        value={formData.yearOfStudy}
                                        onChange={handleChange}
                                        className={errors.yearOfStudy ? 'error' : ''}
                                    >
                                        <option value="">Select Year</option>
                                        <option value="1">Year 1</option>
                                        <option value="2">Year 2</option>
                                        <option value="3">Year 3</option>
                                        <option value="4">Year 4</option>
                                        <option value="5">Year 5</option>
                                    </select>
                                    {errors.yearOfStudy && (
                                        <span className="error-message">{errors.yearOfStudy}</span>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                    
                    {/* Teacher Specific Fields */}
                    {role === 'TEACHER' && (
                        <div className="form-group">
                            <label>Employee ID</label>
                            <input
                                type="text"
                                name="employeeId"
                                value={formData.employeeId}
                                onChange={handleChange}
                                placeholder="e.g. EMP001"
                                className={errors.employeeId ? 'error' : ''}
                            />
                            {errors.employeeId && (
                                <span className="error-message">{errors.employeeId}</span>
                            )}
                        </div>
                    )}
                    
                    {/* Phone Number */}
                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            placeholder="+254712345678"
                            className={errors.phoneNumber ? 'error' : ''}
                        />
                        {errors.phoneNumber && (
                            <span className="error-message">{errors.phoneNumber}</span>
                        )}
                    </div>
                    
                    {/* Password Fields */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Min 8 characters"
                                className={errors.password ? 'error' : ''}
                            />
                            {errors.password && (
                                <span className="error-message">{errors.password}</span>
                            )}
                        </div>
                        
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Repeat password"
                                className={errors.confirmPassword ? 'error' : ''}
                            />
                            {errors.confirmPassword && (
                                <span className="error-message">{errors.confirmPassword}</span>
                            )}
                        </div>
                    </div>
                    
                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={`btn-register ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? '' : `Create ${role === 'STUDENT' ? 'Student' : 'Teacher'} Account`}
                    </button>
                    
                </form>
                
                {/* Footer */}
                <div className="register-footer">
                    Already have an account?{' '}
                    <Link to="/login">Sign In</Link>
                </div>
                
            </div>
        </div>
    );
};

export default Register;