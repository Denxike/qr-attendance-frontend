import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import '../../css/StudentDashboard.css';

const MarkAttendance = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        // Get token from URL if exists
        const urlToken = searchParams.get('token');
        if (urlToken) {
            setToken(urlToken);
            // Auto-submit if token from QR scan
            handleSubmit(null, urlToken);
        }
    }, [searchParams]);

    const handleSubmit = async (e, qrToken = null) => {
        if (e) e.preventDefault();
        
        const tokenToSubmit = qrToken || token;
        
        if (!tokenToSubmit) {
            setMessage({ type: 'error', text: 'Please enter a QR token' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await studentAPI.markAttendance({
                studentId: user.studentId,
                qrToken: tokenToSubmit
            });

            setMessage({ 
                type: 'success', 
                text: 'Attendance marked successfully! ✅' 
            });
            
            setToken('');

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                navigate('/student-dashboard');
            }, 2000);

        } catch (error){
    console.error('❌ Mark attendance error:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    let errorMessage = 'Failed to mark attendance. Please try again.';
    
    if (error.response?.status === 400) {
        errorMessage = 'Invalid request. Please check the QR code and try again.';
    } else if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
    } else if (error.response?.status === 404) {
        errorMessage = 'QR code not found or expired.';
    } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
    }
    
    setMessage({ 
        type: 'error', 
        text: errorMessage
    });
} finally {
            setLoading(false);
        }
    };

    return (
        <div className="student-dashboard">
            <Navbar />
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h1>📱 Mark Attendance</h1>
                    <p>Scan QR code or enter token manually</p>
                </div>

                <div className="tab-content">
                    <div className="qr-scanner-section">
                        <h2>Enter QR Token</h2>
                        <p style={{ color: '#666', marginBottom: '30px' }}>
                            Scan the QR code displayed by your teacher, or enter the token manually below
                        </p>

                        {message.text && (
                            <div 
                                style={{
                                    padding: '15px 20px',
                                    borderRadius: '10px',
                                    marginBottom: '20px',
                                    background: message.type === 'success' ? '#d4edda' : '#f8d7da',
                                    color: message.type === 'success' ? '#155724' : '#721c24',
                                    border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                                    fontWeight: '600'
                                }}
                            >
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="qr-input-container">
                                <input
                                    type="text"
                                    className="qr-input"
                                    placeholder="Enter QR token here..."
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    disabled={loading}
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="submit-btn"
                                disabled={loading || !token}
                            >
                                {loading ? 'Marking Attendance...' : '✓ Mark Attendance'}
                            </button>
                        </form>

                        <div style={{ marginTop: '40px', color: '#666' }}>
                            <p><strong>How to use:</strong></p>
                            <ol style={{ textAlign: 'left', maxWidth: '500px', margin: '20px auto' }}>
                                <li>Open your phone's camera or QR scanner app</li>
                                <li>Point it at the QR code on your teacher's screen</li>
                                <li>Tap the notification/link that appears</li>
                                <li>Your attendance will be marked automatically!</li>
                            </ol>
                            <p style={{ marginTop: '20px' }}>
                                Or copy the token from your teacher and paste it above.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarkAttendance;
