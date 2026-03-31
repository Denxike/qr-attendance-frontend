import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';
import Navbar from '../../components/Navbar';
import '../../css/StudentDashboard.css';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('courses');
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    
    // Mark attendance states
    const [qrToken, setQrToken] = useState('');
    const [marking, setMarking] = useState(false);
    const [attendanceMessage, setAttendanceMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user?.studentId) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchEnrolledCourses(),
                fetchAvailableCourses(),
                fetchAttendanceHistory()
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEnrolledCourses = async () => {
        try {
            const response = await studentAPI.getEnrolledCourses(user.studentId);
            setEnrolledCourses(response.data || []);
        } catch (error) {
            console.error('Error fetching enrolled courses:', error);
            setEnrolledCourses([]);
        }
    };

    const fetchAvailableCourses = async () => {
        try {
            const response = await studentAPI.getAvailableCourses(user.studentId);
            setAvailableCourses(response.data || []);
        } catch (error) {
            console.error('Error fetching available courses:', error);
            setAvailableCourses([]);
        }
    };

    const fetchAttendanceHistory = async () => {
        try {
            const response = await studentAPI.getAttendanceHistory(user.studentId);
            setAttendanceHistory(response.data || []);
        } catch (error) {
            console.error('Error fetching attendance:', error);
            setAttendanceHistory([]);
        }
    };

    const handleEnroll = async (courseId) => {
        try {
            setEnrolling(true);
            await studentAPI.selfEnroll(user.studentId, courseId);
            await fetchData();
            alert('Successfully enrolled in course!');
        } catch (error) {
            console.error('Enrollment error:', error);
            alert(error.response?.data?.message || 'Failed to enroll in course');
        } finally {
            setEnrolling(false);
        }
    };

    const handleMarkAttendance = async (e) => {
        e.preventDefault();
        
        if (!qrToken.trim()) {
            setAttendanceMessage({ type: 'error', text: 'Please enter a QR token' });
            return;
        }

        setMarking(true);
        setAttendanceMessage({ type: '', text: '' });

        try {
            const requestData = {
                studentId: Number(user.studentId),
                qrToken: qrToken.trim()
            };
            
            await studentAPI.markAttendance(requestData);

            setAttendanceMessage({ 
                type: 'success', 
                text: '✅ Attendance marked successfully!' 
            });
            
            setQrToken('');
            
            setTimeout(() => {
                fetchAttendanceHistory();
                setAttendanceMessage({ type: '', text: '' });
            }, 2000);

        } catch (error) {
            console.error('Error:', error);
            
            let errorMessage = 'Failed to mark attendance';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.status === 400) {
                errorMessage = 'Invalid or expired QR code';
            }
            
            setAttendanceMessage({ 
                type: 'error', 
                text: errorMessage 
            });
        } finally {
            setMarking(false);
        }
    };

    if (loading) {
        return (
            <div className="student-dashboard">
                <Navbar />
                <div className="loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="student-dashboard">
            <Navbar />
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h1>Welcome, {user?.fullName}!</h1>
                    <p>Student ID: {user?.studentId || 'N/A'}</p>
                </div>

                <div className="tabs-nav">
                    <button 
                        className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
                        onClick={() => setActiveTab('courses')}
                    >
                        📚 My Courses
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                        onClick={() => setActiveTab('register')}
                    >
                        ➕ Register Courses
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'mark' ? 'active' : ''}`}
                        onClick={() => setActiveTab('mark')}
                    >
                        ✓ Mark Attendance
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        📊 Attendance History
                    </button>
                </div>

                {activeTab === 'courses' && (
                    <div className="tab-content">
                        <h2>My Enrolled Courses</h2>
                        {enrolledCourses.length === 0 ? (
                            <div className="empty-state">
                                <p>You are not enrolled in any courses yet.</p>
                                <p>Go to "Register Courses" tab to enroll.</p>
                            </div>
                        ) : (
                            <div className="courses-grid">
                                {enrolledCourses.map(course => (
                                    <div key={course.id} className="course-card">
                                        <div className="course-code">{course.courseCode}</div>
                                        <div className="course-name">{course.courseName}</div>
                                        <div className="course-details">
                                            <p><strong>Teacher:</strong> {course.teacherName}</p>
                                            <p><strong>Credits:</strong> {course.credits}</p>
                                            <p><strong>Department:</strong> {course.departmentName}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'register' && (
                    <div className="tab-content">
                        <h2>Available Courses</h2>
                        {availableCourses.length === 0 ? (
                            <div className="empty-state">
                                <p>No available courses to enroll in.</p>
                            </div>
                        ) : (
                            <div className="courses-grid">
                                {availableCourses.map(course => (
                                    <div key={course.id} className="course-card">
                                        <div className="course-code">{course.courseCode}</div>
                                        <div className="course-name">{course.courseName}</div>
                                        <div className="course-details">
                                            <p><strong>Teacher:</strong> {course.teacherName}</p>
                                            <p><strong>Credits:</strong> {course.credits}</p>
                                            <p><strong>Department:</strong> {course.departmentName}</p>
                                        </div>
                                        <button 
                                            className="enroll-btn"
                                            onClick={() => handleEnroll(course.id)}
                                            disabled={enrolling}
                                        >
                                            {enrolling ? 'Enrolling...' : 'Enroll Now'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'mark' && (
                    <div className="tab-content">
                        <div className="qr-scanner-section">
                            <h2>📱 Mark Attendance</h2>
                            <p style={{ color: '#666', marginBottom: '30px' }}>
                                Enter the QR token from your teacher's display
                            </p>

                            {attendanceMessage.text && (
                                <div 
                                    style={{
                                        padding: '15px 20px',
                                        borderRadius: '10px',
                                        marginBottom: '20px',
                                        background: attendanceMessage.type === 'success' ? '#d4edda' : '#f8d7da',
                                        color: attendanceMessage.type === 'success' ? '#155724' : '#721c24',
                                        border: `1px solid ${attendanceMessage.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                                        fontWeight: '600',
                                        textAlign: 'center'
                                    }}
                                >
                                    {attendanceMessage.text}
                                </div>
                            )}

                            <form onSubmit={handleMarkAttendance}>
                                <div className="qr-input-container">
                                    <input
                                        type="text"
                                        className="qr-input"
                                        placeholder="Enter QR token here..."
                                        value={qrToken}
                                        onChange={(e) => setQrToken(e.target.value)}
                                        disabled={marking}
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    className="submit-btn"
                                    disabled={marking || !qrToken.trim()}
                                >
                                    {marking ? 'Marking Attendance...' : '✓ Mark Attendance'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="tab-content">
                        <h2>Attendance History</h2>
                        {attendanceHistory.length === 0 ? (
                            <div className="empty-state">
                                <p>No attendance records found.</p>
                            </div>
                        ) : (
                            <table className="attendance-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Course</th>
                                        <th>Session</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceHistory.map(record => (
                                        <tr key={record.id}>
                                            <td>{new Date(record.markedAt).toLocaleDateString()}</td>
                                            <td>{record.courseName || 'N/A'}</td>
                                            <td>{record.sessionName || 'N/A'}</td>
                                            <td>
                                                <span className={`status-badge status-${record.status}`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;