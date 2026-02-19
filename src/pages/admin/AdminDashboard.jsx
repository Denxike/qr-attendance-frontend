import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import Navbar from '../../components/Navbar';
import '../../css/AdminDashboard.css';
import { BookOpen, Cog, GraduationCap, Landmark, Presentation } from 'lucide-react';

const AdminDashboard = () => {

    const [activeTab, setActiveTab] = useState('departments');

    const [departments, setDepartments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [deptForm, setDeptForm] = useState({ departmentName: '', description: '' });
    const [deptLoading, setDeptLoading] = useState(false);

    const [courseForm, setCourseForm] = useState({
        courseCode: '', courseName: '', description: '',
        credits: '', semester: '', teacherId: '', departmentId: ''
    });
    const [courseLoading, setCourseLoading] = useState(false);

    // Enroll form
    const [enrollForm, setEnrollForm] = useState({ studentId: '', courseId: '' });
    const [enrollLoading, setEnrollLoading] = useState(false);

    // Alerts
    const [alert, setAlert] = useState(null);

    const showAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 4000);
    };

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [deptRes, courseRes, studentRes, teacherRes] = await Promise.all([
                adminAPI.getAllDepartments(),
                adminAPI.getAllCourses(),
                adminAPI.getAllStudents(),
                adminAPI.getAllTeachers()
            ]);
            setDepartments(deptRes.data);
            setCourses(courseRes.data);
            setStudents(studentRes.data);
            setTeachers(teacherRes.data);
        } catch (error) {
            console.error('Failed to load data:', error);
            showAlert('error', 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // ---- Department Handlers ----
    const handleCreateDept = async (e) => {
        e.preventDefault();
        setDeptLoading(true);
        try {
            await adminAPI.createDepartment(deptForm);
            setDeptForm({ departmentName: '', description: '' });
            await fetchAll();
            showAlert('success', `Department "${deptForm.departmentName}" created!`);
        } catch (error) {
            showAlert('error', error.response?.data?.message || 'Failed to create department');
        } finally {
            setDeptLoading(false);
        }
    };

    const handleDeleteDept = async (id, name) => {
        if (!window.confirm(`Delete department "${name}"?`)) return;
        try {
            await adminAPI.deleteDepartment(id);
            await fetchAll();
            showAlert('success', `Department deleted`);
        } catch (error) {
            showAlert('error', 'Failed to delete department');
        }
    };

    // ---- Course Handlers ----
    const handleCreateCourse = async (e) => {
        e.preventDefault();
        setCourseLoading(true);
        try {
            await adminAPI.createCourse({
                ...courseForm,
                credits: parseInt(courseForm.credits),
                teacherId: parseInt(courseForm.teacherId),
                departmentId: parseInt(courseForm.departmentId)
            });
            setCourseForm({
                courseCode: '', courseName: '', description: '',
                credits: '', semester: '', teacherId: '', departmentId: ''
            });
            await fetchAll();
            showAlert('success', `Course "${courseForm.courseCode}" created!`);
        } catch (error) {
            showAlert('error', error.response?.data?.message || 'Failed to create course');
        } finally {
            setCourseLoading(false);
        }
    };

    const handleDeleteCourse = async (id, code) => {
        if (!window.confirm(`Delete course "${code}"?`)) return;
        try {
            await adminAPI.deleteCourse(id);
            await fetchAll();
            showAlert('success', 'Course deleted');
        } catch (error) {
            showAlert('error', 'Failed to delete course');
        }
    };

    // ---- Enroll Handler ----
    const handleEnroll = async (e) => {
        e.preventDefault();
        setEnrollLoading(true);
        try {
            await adminAPI.enrollStudent({
                studentId: parseInt(enrollForm.studentId),
                courseId: parseInt(enrollForm.courseId)
            });
            setEnrollForm({ studentId: '', courseId: '' });
            showAlert('success', 'Student enrolled successfully!');
        } catch (error) {
            showAlert('error', error.response?.data?.message || 'Enrollment failed');
        } finally {
            setEnrollLoading(false);
        }
    };

    const tabs = [
        { id: 'departments', label: <>Departments</>, count: departments.length },
        { id: 'courses',     label: <> Courses</>,     count: courses.length },
        { id: 'students',    label: <>Students</>,    count: students.length },
        { id: 'teachers',    label: <>Teachers</>,    count: teachers.length },
        { id: 'enroll',      label: <> Enroll</>,       count: null }
    ];

    return (
        <div className="dashboard">
            <Navbar />
            <div className="dashboard-content">

                {/* Welcome */}
                <div className="dashboard-welcome">
                    <h2>Admin Dashboard   <Cog /></h2>
                    <p>Manage departments, courses, and student enrollments</p>
                </div>

                {/* Alert */}
                {alert && (
                    <div className={`admin-alert admin-alert-${alert.type}`}>
                        {alert.type === 'success' ? '✅' : '⚠️'} {alert.message}
                    </div>
                )}

                {/* Stats */}
                <div className="stats-row">
                    <div className="stat-card">
                        <div className="stat-icon blue"><Landmark /></div>
                        <div className="stat-info">
                            <div className="stat-value">{departments.length}</div>
                            <div className="stat-label">Departments</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon green"><BookOpen /></div>
                        <div className="stat-info">
                            <div className="stat-value">{courses.length}</div>
                            <div className="stat-label">Courses</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon orange"><GraduationCap /></div>
                        <div className="stat-info">
                            <div className="stat-value">{students.length}</div>
                            <div className="stat-label">Students</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon purple"><Presentation /></div>
                        <div className="stat-info">
                            <div className="stat-value">{teachers.length}</div>
                            <div className="stat-label">Teachers</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs-container">
                    <div className="tabs-header">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                                {tab.count !== null && (
                                    <span className="tab-badge">{tab.count}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab: Departments */}
                    {activeTab === 'departments' && (
                        <div className="tab-content">
                            <div className="admin-two-col">

                                {/* Add Department Form */}
                                <div className="admin-form-card">
                                    <h4 className="form-title">➕ Add Department</h4>
                                    <form onSubmit={handleCreateDept}>
                                        <div className="form-group">
                                            <label>Department Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Computer Science"
                                                value={deptForm.departmentName}
                                                onChange={e => setDeptForm(p => ({ ...p, departmentName: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Description (Optional)</label>
                                            <input
                                                type="text"
                                                placeholder="Brief description"
                                                value={deptForm.description}
                                                onChange={e => setDeptForm(p => ({ ...p, description: e.target.value }))}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="btn-admin-submit"
                                            disabled={deptLoading}
                                        >
                                            {deptLoading ? 'Creating...' : '+ Create Department'}
                                        </button>
                                    </form>
                                </div>

                                {/* Departments List */}
                                <div className="admin-list-card">
                                    <h4 className="form-title"><Landmark /> All Departments</h4>
                                    {loading ? (
                                        <div className="loading-spinner">Loading...</div>
                                    ) : departments.length === 0 ? (
                                        <div className="empty-state">
                                            <span className="empty-icon"><Landmark /></span>
                                            <p>No departments yet</p>
                                        </div>
                                    ) : (
                                        <div className="admin-items-list">
                                            {departments.map(dept => (
                                                <div key={dept.id} className="admin-item">
                                                    <div className="admin-item-info">
                                                        <div className="admin-item-name">
                                                            {dept.departmentName}
                                                        </div>
                                                        <div className="admin-item-meta">
                                                            {dept.totalCourses} courses
                                                            {dept.description && ` · ${dept.description}`}
                                                        </div>
                                                    </div>
                                                    <button
                                                        className="btn-delete"
                                                        onClick={() => handleDeleteDept(dept.id, dept.departmentName)}
                                                    >
                                                        🗑
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab: Courses */}
                    {activeTab === 'courses' && (
                        <div className="tab-content">
                            <div className="admin-two-col">

                                {/* Add Course Form */}
                                <div className="admin-form-card">
                                    <h4 className="form-title">➕ Add Course</h4>
                                    <form onSubmit={handleCreateCourse}>
                                        <div className="form-row-two">
                                            <div className="form-group">
                                                <label>Course Code</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. CS401"
                                                    value={courseForm.courseCode}
                                                    onChange={e => setCourseForm(p => ({ ...p, courseCode: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Credits</label>
                                                <input
                                                    type="number"
                                                    placeholder="e.g. 3"
                                                    value={courseForm.credits}
                                                    onChange={e => setCourseForm(p => ({ ...p, credits: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Course Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Database Systems"
                                                value={courseForm.courseName}
                                                onChange={e => setCourseForm(p => ({ ...p, courseName: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Semester</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Spring 2026"
                                                value={courseForm.semester}
                                                onChange={e => setCourseForm(p => ({ ...p, semester: e.target.value }))}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Assign Teacher</label>
                                            <select
                                                value={courseForm.teacherId}
                                                onChange={e => setCourseForm(p => ({ ...p, teacherId: e.target.value }))}
                                                required
                                            >
                                                <option value="">Select Teacher</option>
                                                {teachers.map(t => (
                                                    <option key={t.id} value={t.id}>
                                                        {t.fullName} ({t.employeeId})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Department</label>
                                            <select
                                                value={courseForm.departmentId}
                                                onChange={e => setCourseForm(p => ({ ...p, departmentId: e.target.value }))}
                                                required
                                            >
                                                <option value="">Select Department</option>
                                                {departments.map(d => (
                                                    <option key={d.id} value={d.id}>
                                                        {d.departmentName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Description (Optional)</label>
                                            <input
                                                type="text"
                                                placeholder="Brief course description"
                                                value={courseForm.description}
                                                onChange={e => setCourseForm(p => ({ ...p, description: e.target.value }))}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="btn-admin-submit"
                                            disabled={courseLoading}
                                        >
                                            {courseLoading ? 'Creating...' : '+ Create Course'}
                                        </button>
                                    </form>
                                </div>

                                {/* Courses List */}
                                <div className="admin-list-card">
                                    <h4 className="form-title">📚 All Courses</h4>
                                    {loading ? (
                                        <div className="loading-spinner">Loading...</div>
                                    ) : courses.length === 0 ? (
                                        <div className="empty-state">
                                            <span className="empty-icon">📚</span>
                                            <p>No courses yet</p>
                                        </div>
                                    ) : (
                                        <div className="admin-items-list">
                                            {courses.map(course => (
                                                <div key={course.id} className="admin-item">
                                                    <div className="admin-item-info">
                                                        <div className="admin-item-name">
                                                            <span className="course-code">
                                                                {course.courseCode}
                                                            </span>
                                                            {' '}{course.courseName}
                                                        </div>
                                                        <div className="admin-item-meta">
                                                            👨‍🏫 {course.teacherName || 'Unassigned'}
                                                            {' · '}
                                                            🏛 {course.departmentName || 'N/A'}
                                                        </div>
                                                    </div>
                                                    <button
                                                        className="btn-delete"
                                                        onClick={() => handleDeleteCourse(course.id, course.courseCode)}
                                                    >
                                                        🗑
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab: Students */}
                    {activeTab === 'students' && (
                        <div className="tab-content">
                            {loading ? (
                                <div className="loading-spinner">Loading...</div>
                            ) : (
                                <table className="attendance-table">
                                    <thead>
                                        <tr>
                                            <th>Student ID</th>
                                            <th>Full Name</th>
                                            <th>Email</th>
                                            <th>Department</th>
                                            <th>Year</th>
                                            <th>Courses</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map(s => (
                                            <tr key={s.id}>
                                                <td>
                                                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px' }}>
                                                        {s.studentId}
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: 600 }}>{s.fullName}</td>
                                                <td style={{ color: '#7A8499' }}>{s.email}</td>
                                                <td>{s.departmentName}</td>
                                                <td>Year {s.yearOfStudy}</td>
                                                <td>
                                                    <span className="status-badge status-PRESENT">
                                                        {s.totalEnrolledCourses} enrolled
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* Tab: Teachers */}
                    {activeTab === 'teachers' && (
                        <div className="tab-content">
                            {loading ? (
                                <div className="loading-spinner">Loading...</div>
                            ) : (
                                <table className="attendance-table">
                                    <thead>
                                        <tr>
                                            <th>Employee ID</th>
                                            <th>Full Name</th>
                                            <th>Email</th>
                                            <th>Department</th>
                                            <th>Courses</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {teachers.map(t => (
                                            <tr key={t.id}>
                                                <td>
                                                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px' }}>
                                                        {t.employeeId}
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: 600 }}>{t.fullName}</td>
                                                <td style={{ color: '#7A8499' }}>{t.email}</td>
                                                <td>{t.departmentName}</td>
                                                <td>
                                                    <span className="status-badge status-PRESENT">
                                                        {t.totalCourses} courses
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* Tab: Enroll Student */}
                    {activeTab === 'enroll' && (
                        <div className="tab-content">
                            <div className="admin-two-col">
                                <div className="admin-form-card">
                                    <h4 className="form-title">✅ Enroll Student in Course</h4>
                                    <form onSubmit={handleEnroll}>
                                        <div className="form-group">
                                            <label>Select Student</label>
                                            <select
                                                value={enrollForm.studentId}
                                                onChange={e => setEnrollForm(p => ({ ...p, studentId: e.target.value }))}
                                                required
                                            >
                                                <option value="">Choose Student</option>
                                                {students.map(s => (
                                                    <option key={s.id} value={s.id}>
                                                        {s.fullName} ({s.studentId})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Select Course</label>
                                            <select
                                                value={enrollForm.courseId}
                                                onChange={e => setEnrollForm(p => ({ ...p, courseId: e.target.value }))}
                                                required
                                            >
                                                <option value="">Choose Course</option>
                                                {courses.map(c => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.courseCode} — {c.courseName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <button
                                            type="submit"
                                            className="btn-admin-submit"
                                            disabled={enrollLoading}
                                        >
                                            {enrollLoading ? 'Enrolling...' : '✅ Enroll Student'}
                                        </button>
                                    </form>
                                </div>

                                <div className="admin-info-card">
                                    <h4 className="form-title">ℹ️ Quick Info</h4>
                                    <div className="info-stats">
                                        <div className="info-stat">
                                            <span className="info-stat-value">{students.length}</span>
                                            <span className="info-stat-label">Total Students</span>
                                        </div>
                                        <div className="info-stat">
                                            <span className="info-stat-value">{courses.length}</span>
                                            <span className="info-stat-label">Total Courses</span>
                                        </div>
                                        <div className="info-stat">
                                            <span className="info-stat-value">{teachers.length}</span>
                                            <span className="info-stat-label">Total Teachers</span>
                                        </div>
                                    </div>
                                    <p className="info-note">
                                        Students can also self-enroll from their dashboard under the
                                        "Register Courses" tab.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;