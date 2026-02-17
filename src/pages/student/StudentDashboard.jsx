import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';
import Navbar from '../../components/Navbar';
import { Html5Qrcode } from 'html5-qrcode';
import '../../css/StudentDashboard.css';
import { BookOpen, Presentation,  Percent,  GraduationCap, TableProperties, Camera, Landmark, TableCellsSplit } from 'lucide-react';

const StudentDashboard = () => {
    const { user } = useAuth();

    // Tab state
    const [activeTab, setActiveTab] = useState('enrolled');

    // Data state
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enrollingId, setEnrollingId] = useState(null);

    // QR Scanner state
    const [showScanner, setShowScanner] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [manualToken, setManualToken] = useState('');
    const scannerRef = useRef(null);
    const scannerStarted = useRef(false);

    const studentId = user.studentId || user.userId;

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [enrolledRes, availableRes, attendanceRes] = await Promise.all([
                studentAPI.getEnrolledCourses(studentId),
                studentAPI.getAvailableCourses(studentId),
                studentAPI.getAttendanceHistory(studentId)
            ]);
            setEnrolledCourses(enrolledRes.data);
            setAvailableCourses(availableRes.data);
            setAttendanceHistory(attendanceRes.data);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    }, [studentId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Enroll in a course
    const handleEnroll = async (courseId) => {
        setEnrollingId(courseId);
        try {
            await studentAPI.selfEnroll(studentId, courseId);
            await fetchData(); // Refresh all data
            alert('Successfully enrolled!');
        } catch (error) {
            alert(error.response?.data?.message || 'Enrollment failed');
        } finally {
            setEnrollingId(null);
        }
    };

    // QR Scanner
    const stopScanner = useCallback(async () => {
        if (scannerRef.current && scannerStarted.current) {
            try {
                await scannerRef.current.stop();
                scannerRef.current = null;
                scannerStarted.current = false;
            } catch (err) {}
        }
    }, []);

    const handleAttendanceMark = useCallback(async (token) => {
        try {
            const response = await studentAPI.markAttendance({
                qrToken: token,
                studentId
            });
            setScanResult({
                type: 'success',
                message: `✅ Attendance marked! Course: ${response.data.courseName} | Status: ${response.data.status}`
            });
            fetchData();
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to mark attendance';
            setScanResult({ type: 'error', message: `❌ ${message}` });
        }
    }, [studentId, fetchData]);

    const startScanner = useCallback(async () => {
        try {
            const scanner = new Html5Qrcode('qr-reader');
            scannerRef.current = scanner;
            scannerStarted.current = true;
            await scanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => { handleAttendanceMark(decodedText); stopScanner(); },
                () => {}
            );
        } catch (err) {
            console.error('Scanner failed:', err);
        }
    }, [handleAttendanceMark, stopScanner]);

    useEffect(() => {
        if (showScanner && !scannerStarted.current) setTimeout(() => startScanner(), 500);
        if (!showScanner) stopScanner();
    }, [showScanner, startScanner, stopScanner]);

    const handleCloseScanner = () => {
        stopScanner();
        setShowScanner(false);
        setScanResult(null);
        setManualToken('');
    };

    // Attendance percentage per course
    const getPercentage = (courseId) => {
        const records = attendanceHistory.filter(a => a.courseId === courseId);
        if (!records.length) return 0;
        const present = records.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
        return Math.round((present / records.length) * 100);
    };

    const getBarColor = (p) => p >= 75 ? 'fill-green' : p >= 50 ? 'fill-orange' : 'fill-red';

    const filteredAttendance = selectedCourse
        ? attendanceHistory.filter(a => a.courseId === selectedCourse.id)
        : attendanceHistory;

    const presentCount = attendanceHistory.filter(
        a => a.status === 'PRESENT' || a.status === 'LATE'
    ).length;

    const overallPct = attendanceHistory.length > 0
        ? Math.round((presentCount / attendanceHistory.length) * 100)
        : 0;

    return (
        <div className="dashboard">
            <Navbar />
            <div className="dashboard-content">

                {/* Welcome */}
                <div className="dashboard-welcome">
                    <h2>Welcome, {user?.fullName} </h2>
                    <p>Manage your courses and track attendance</p>
                </div>

                {/* Stats */}
                <div className="stats-row">
                    <div className="stat-card">
                        <div className="stat-icon blue"><BookOpen /></div>
                        <div className="stat-info">
                            <div className="stat-value">{enrolledCourses.length}</div>
                            <div className="stat-label">Enrolled Courses</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon green"><Presentation /></div>
                        <div className="stat-info">
                            <div className="stat-value">{presentCount}</div>
                            <div className="stat-label">Classes Attended</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon orange"><Percent /></div>
                        <div className="stat-info">
                            <div className="stat-value">{overallPct}%</div>
                            <div className="stat-label">Overall Attendance</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon purple"><GraduationCap /></div>
                        <div className="stat-info">
                            <div className="stat-value">{availableCourses.length}</div>
                            <div className="stat-label">Available Courses</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs-container">
                    <div className="tabs-header">
                        <button
                            className={`tab-btn ${activeTab === 'enrolled' ? 'active' : ''}`}
                            onClick={() => setActiveTab('enrolled')}
                        >
                            <BookOpen /> My Courses
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                            onClick={() => setActiveTab('register')}
                        >
                            <GraduationCap /> Register Courses
                            {availableCourses.length > 0 && (
                                <span className="tab-badge">{availableCourses.length}</span>
                            )}
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                            onClick={() => setActiveTab('history')}
                        >
                            <TableProperties /> Attendance History
                        </button>

                        {/* Scan QR Button */}
                        <button
                            className="btn-scan"
                            onClick={() => setShowScanner(true)}
                            style={{ marginLeft: 'auto' }}
                        >
                            <Camera /> Scan QR
                        </button>
                    </div>

                    {/* Tab: Enrolled Courses */}
                    {activeTab === 'enrolled' && (
                        <div className="tab-content">
                            {loading ? (
                                <div className="loading-spinner">Loading...</div>
                            ) : enrolledCourses.length === 0 ? (
                                <div className="empty-state">
                                    <span className="empty-icon">📚</span>
                                    <p>No enrolled courses yet</p>
                                    <button
                                        className="btn-create-qr"
                                        style={{ marginTop: '12px', width: 'auto', padding: '10px 20px' }}
                                        onClick={() => setActiveTab('register')}
                                    >
                                        Browse Available Courses
                                    </button>
                                </div>
                            ) : (
                                <div className="courses-grid">
                                    {enrolledCourses.map(course => {
                                        const pct = getPercentage(course.id);
                                        return (
                                            <div
                                                key={course.id}
                                                className={`course-card ${selectedCourse?.id === course.id ? 'selected' : ''}`}
                                                onClick={() => setSelectedCourse(
                                                    selectedCourse?.id === course.id ? null : course
                                                )}
                                            >
                                                <span className="course-code">{course.courseCode}</span>
                                                <div className="course-name">{course.courseName}</div>
                                                <div className="course-attendance">
                                                    Attendance: {pct}%
                                                </div>
                                                <div className="attendance-bar">
                                                    <div
                                                        className={`attendance-bar-fill ${getBarColor(pct)}`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab: Register Courses */}
                    {activeTab === 'register' && (
                        <div className="tab-content">
                            {loading ? (
                                <div className="loading-spinner">Loading available courses...</div>
                            ) : availableCourses.length === 0 ? (
                                <div className="empty-state">
                                    <span className="empty-icon"><GraduationCap /></span>
                                    <p>No available courses to register</p>
                                </div>
                            ) : (
                                <div className="available-courses-grid">
                                    {availableCourses.map(course => (
                                        <div key={course.id} className="available-course-card">
                                            <div className="available-course-header">
                                                <span className="course-code">{course.courseCode}</span>
                                                <span className="course-credits">
                                                    {course.credits} cr
                                                </span>
                                            </div>
                                            <div className="available-course-name">
                                                {course.courseName}
                                            </div>
                                            <div className="available-course-meta">
                                                <span><Presentation /> {course.teacherName || 'TBA'}</span>
                                                <span><Landmark /> {course.departmentName || 'N/A'}</span>
                                            </div>
                                            {course.description && (
                                                <div className="available-course-desc">
                                                    {course.description}
                                                </div>
                                            )}
                                            <button
                                                className="btn-enroll"
                                                onClick={() => handleEnroll(course.id)}
                                                disabled={enrollingId === course.id}
                                            >
                                                {enrollingId === course.id
                                                    ? 'Enrolling...'
                                                    : '+ Enroll Now'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab: Attendance History */}
                    {activeTab === 'history' && (
                        <div className="tab-content">
                            {/* Course filter */}
                            <div className="filter-row">
                                <button
                                    className={`filter-btn ${!selectedCourse ? 'active' : ''}`}
                                    onClick={() => setSelectedCourse(null)}
                                >
                                    All Courses
                                </button>
                                {enrolledCourses.map(c => (
                                    <button
                                        key={c.id}
                                        className={`filter-btn ${selectedCourse?.id === c.id ? 'active' : ''}`}
                                        onClick={() => setSelectedCourse(
                                            selectedCourse?.id === c.id ? null : c
                                        )}
                                    >
                                        {c.courseCode}
                                    </button>
                                ))}
                            </div>

                            {loading ? (
                                <div className="loading-spinner">Loading history...</div>
                            ) : filteredAttendance.length === 0 ? (
                                <div className="empty-state">
                                    <span className="empty-icon"><TableCellsSplit/></span>
                                    <p>No attendance records found</p>
                                </div>
                            ) : (
                                <table className="attendance-table">
                                    <thead>
                                        <tr>
                                            <th>Course</th>
                                            <th>Session</th>
                                            <th>Date & Time</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAttendance.map(record => (
                                            <tr key={record.id}>
                                                <td>{record.courseCode}</td>
                                                <td>{record.sessionName || 'N/A'}</td>
                                                <td>{new Date(record.markedAt).toLocaleString()}</td>
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

            {/* QR Scanner Modal */}
            {showScanner && (
                <div className="modal-overlay" onClick={handleCloseScanner}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><Camera /> Scan QR Code</h3>
                            <button className="btn-close" onClick={handleCloseScanner}>×</button>
                        </div>
                        <div id="qr-reader"></div>
                        <div className="manual-token">
                            <p>— or enter token manually —</p>
                            <div className="manual-input-row">
                                <input
                                    type="text"
                                    placeholder="Paste QR token here"
                                    value={manualToken}
                                    onChange={e => setManualToken(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAttendanceMark(manualToken)}
                                />
                                <button
                                    className="btn-submit"
                                    onClick={() => handleAttendanceMark(manualToken)}
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                        {scanResult && (
                            <div className={`scan-result ${scanResult.type}`}>
                                {scanResult.message}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;