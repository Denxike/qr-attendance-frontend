import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { teacherAPI } from '../../services/api';
import Navbar from '../../components/Navbar';
import '../../css/TeacherDashboard.css';
import { BookOpen, QrCode, School, Activity, Calculator } from 'lucide-react';

const TeacherDashboard = () => {
    const { user } = useAuth();
    console.log(user);

    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [activeSession, setActiveSession] = useState(null);
    const [sessionAttendance, setSessionAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);

    const [qrForm, setQrForm] = useState({
        sessionName: '',
        durationMinutes: 5
    });

    // ✅ Wrap in useCallback
   // ✅ Use teacherId instead of userId
const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
        // Use teacherId for teacher-specific endpoints
        const teacherId = user.teacherId || user.userId;
        const response = await teacherAPI.getCourses(teacherId);
        setCourses(response.data);
    } catch (error) {
        console.error('Failed to load courses:', error);
    } finally {
        setLoading(false);
    }
}, [user.teacherId, user.userId]);

    // ✅ Wrap in useCallback
    const fetchSessionAttendance = useCallback(async (sessionId) => {
        try {
            const response = await teacherAPI.getSessionAttendance(sessionId);
            setSessionAttendance(response.data);
            setActiveSession(prev => ({
                ...prev,
                totalScans: response.data.length
            }));
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
        }
    }, []);

    // ✅ fetchCourses is now stable
    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    // Countdown timer
    useEffect(() => {
        if (!activeSession) return;

        const interval = setInterval(() => {
            const expiry = new Date(activeSession.expiryTime);
            const now = new Date();
            const diff = Math.floor((expiry - now) / 1000);

            if (diff <= 0) {
                setTimeLeft('Expired');
                setActiveSession(prev => ({ ...prev, isActive: false }));
                clearInterval(interval);
            } else {
                const mins = Math.floor(diff / 60);
                const secs = diff % 60;
                setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
            }
        }, 1000);
        
        return () => clearInterval(interval);
    }, [activeSession?.expiryTime]); // ✅ Only depend on expiryTime, not whole object

    // Poll attendance every 5 seconds
    useEffect(() => {
        if (!activeSession?.isActive) return;

        const interval = setInterval(() => {
            fetchSessionAttendance(activeSession.sessionId);
        }, 5000);

        return () => clearInterval(interval);
    }, [activeSession?.isActive, activeSession?.sessionId, fetchSessionAttendance]);

    const handleGenerateQR = async (e) => {
        e.preventDefault();
        if (!selectedCourse) return;

        setGenerating(true);
        try {
            const response = await teacherAPI.generateQR({
                courseId: selectedCourse.id,
                sessionName: qrForm.sessionName,
                durationMinutes: parseInt(qrForm.durationMinutes)
            });

            setActiveSession(response.data);
            setSessionAttendance([]);
            setQrForm({ sessionName: '', durationMinutes: 5, location: '' });

        } catch (error) {
            alert(error.response?.data?.message || 'Failed to generate QR code');
        } finally {
            setGenerating(false);
        }
    };

    const handleDeactivate = async () => {
        if (!activeSession) return;
        try {
            await teacherAPI.deactivateSession(activeSession.sessionId);
            setActiveSession(prev => ({ ...prev, isActive: false }));
            setTimeLeft('Ended');
        } catch (error) {
            alert('Failed to deactivate session');
        }
    };

    const handleCourseSelect = (course) => {
        setSelectedCourse(course);
        setActiveSession(null);
        setSessionAttendance([]);
    };

    return (
        <div className="dashboard">
            <Navbar />
            <div className="dashboard-content">

                <div className="dashboard-welcome">
                    <h2>Teacher Dashboard </h2>
                    <p>Generate QR codes and track student attendance</p>
                </div>

                <div className="stats-row">
                    <div className="stat-card">
                        <div className="stat-icon blue"><BookOpen /></div>
                        <div className="stat-info">
                            <div className="stat-value">{courses.length}</div>
                            <div className="stat-label">My Courses</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon green">< Calculator /></div>
                        <div className="stat-info">
                            <div className="stat-value">{activeSession?.totalScans || 0}</div>
                            <div className="stat-label">Students Scanned</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon purple"><Activity /></div>
                        <div className="stat-info">
                            <div className="stat-value">
                                {activeSession?.isActive ? 'Active' : 'None'}
                            </div>
                            <div className="stat-label">Active Session</div>
                        </div>
                    </div>
                </div>

                <div className="two-col">

                    <div className="section">
                        <div className="section-header">
                            <h3><BookOpen /> My Courses</h3>
                        </div>
                        <div className="section-body">
                            {loading ? (
                                <div className="loading-spinner">Loading...</div>
                            ) : courses.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon"><BookOpen /></div>
                                    <p>No courses assigned</p>
                                </div>
                            ) : (
                                <div className="courses-list">
                                    {courses.map(course => (
                                        <div
                                            key={course.id}
                                            className={`course-item ${selectedCourse?.id === course.id ? 'active' : ''}`}
                                            onClick={() => handleCourseSelect(course)}
                                        >
                                            <div className="course-item-left">
                                                <span className="course-badge">
                                                    {course.courseCode}
                                                </span>
                                                <div>
                                                    <div className="course-item-name">
                                                        {course.courseName}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="section">
                        <div className="section-header">
                            <h3>
                                {activeSession?.isActive
                                    ? <p style={{
                                        display:"flex",
                                        alignItems:"center",
                                        gap:".5rem"
                                    }}>
                                        <School/>
                                        Active Session 
                                    </p>
                                    :  <p style={{
                                        display:"flex",
                                        alignItems:"center",
                                        gap:".5rem"
                                    }}>
                                        <QrCode/>
                                       Generate QR Code
                                    </p>}
                            </h3>
                        </div>
                        <div className="section-body">
                            {activeSession?.isActive ? (
                                <div className="qr-display">
                                    <img
                                        src={`data:image/png;base64,${activeSession.qrCodeImage}`}
                                        alt="QR Code"
                                        className="qr-image"
                                    />
                                    <div className="qr-info">
                                        <div className="qr-course">{activeSession.courseName}</div>
                                        <div className="qr-session">{activeSession.sessionName}</div>
                                    </div>
                                    <div className={`qr-timer ${timeLeft === 'Expired' ? 'expired' : ''}`}>
                                        ⏱ {timeLeft || 'Loading...'}
                                    </div>
                                    <div className="qr-scans">
                                        <span>{sessionAttendance.length}</span> students scanned
                                    </div>
                                    <button className="btn-deactivate" onClick={handleDeactivate}>
                                        End Session
                                    </button>
                                </div>
                            ) : (
                                selectedCourse ? (
                                    <form className="generate-form" onSubmit={handleGenerateQR}>
                                        <p style={{ marginBottom: '16px', color: '#666', fontSize: '14px' }}>
                                            Generating for: <strong>{selectedCourse.courseCode} - {selectedCourse.courseName}</strong>
                                        </p>
                                        <div className="form-group">
                                            <label>Session Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Week 5 Lecture"
                                                value={qrForm.sessionName}
                                                onChange={e => setQrForm(prev => ({ ...prev, sessionName: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Duration</label>
                                            <select
                                                value={qrForm.durationMinutes}
                                                onChange={e => setQrForm(prev => ({ ...prev, durationMinutes: e.target.value }))}
                                            >
                                                <option value="5">5 minutes</option>
                                                <option value="10">10 minutes</option>
                                                <option value="15">15 minutes</option>
                                                <option value="30">30 minutes</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Location (Optional)</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Room 301"
                                                value={qrForm.location}
                                                onChange={e => setQrForm(prev => ({ ...prev, location: e.target.value }))}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="btn-create-qr"
                                            disabled={generating}
                                        >
                                            {generating ? 'Generating...' : '🔲 Generate QR Code'}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="empty-state">
                                        <div className="empty-icon">👈</div>
                                        <p>Select a course to generate QR</p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                </div>

                {activeSession && sessionAttendance.length > 0 && (
                    <div className="section">
                        <div className="section-header">
                            <h3>✅ Students Who Scanned</h3>
                            <span style={{ fontSize: '14px', color: '#666' }}>
                                {sessionAttendance.length} students
                            </span>
                        </div>
                        <div className="section-body" style={{ padding: 0 }}>
                            <table className="attendance-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Student ID</th>
                                        <th>Name</th>
                                        <th>Time</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessionAttendance.map((record, index) => (
                                        <tr key={record.id}>
                                            <td>{index + 1}</td>
                                            <td>{record.studentRegistrationId}</td>
                                            <td>{record.studentName}</td>
                                            <td>{new Date(record.markedAt).toLocaleTimeString()}</td>
                                            <td>
                                                <span className={`status-badge status-${record.status}`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default TeacherDashboard;