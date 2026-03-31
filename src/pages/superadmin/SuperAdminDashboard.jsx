import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import axios from 'axios';

const SuperAdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [reports, setReports] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            const [statsRes, reportsRes] = await Promise.all([
                axios.get('https://qr-attendance-backend-6m6c.onrender.com/api/super-admin/dashboard-stats', config),
                axios.get('https://qr-attendance-backend-6m6c.onrender.com/api/super-admin/system-reports', config)
            ]);
            
            setStats(statsRes.data);
            setReports(reportsRes.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
            <Navbar />
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
                <h1>Super Admin Dashboard</h1>
                <p>Welcome, {user?.fullName}</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '30px' }}>
                    {stats && Object.entries(stats).map(([key, value]) => (
                        <div key={key} style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                            <h3>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>{value}</p>
                        </div>
                    ))}
                </div>

                {reports && (
                    <div style={{ marginTop: '40px', background: 'white', padding: '30px', borderRadius: '10px' }}>
                        <h2>System Reports</h2>
                        
                        <h3>Attendance by Department</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                            <thead>
                                <tr style={{ background: '#f0f0f0' }}>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Department</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Students</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Courses</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.attendanceByDepartment.map((dept, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px' }}>{dept.departmentName}</td>
                                        <td style={{ padding: '10px' }}>{dept.totalStudents}</td>
                                        <td style={{ padding: '10px' }}>{dept.totalCourses}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
