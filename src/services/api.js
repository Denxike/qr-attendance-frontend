import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
    // ✅ No withCredentials - causes preflight issues
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', {
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url
        });
        if (error.response?.status === 401) {
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: async (credentials) => {
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        const data = await response.json();
        if (!response.ok) throw { response: { data } };
        return { data };
    },

    registerStudent: async (studentData) => {
        const response = await fetch(`${BASE_URL}/api/students/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData)
        });
        const data = await response.json();
        if (!response.ok) throw { response: { data } };
        return { data };
    },

    registerTeacher: async (teacherData) => {
        const response = await fetch(`${BASE_URL}/api/teachers/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(teacherData)
        });
        const data = await response.json();
        if (!response.ok) throw { response: { data } };
        return { data };
    }
};

export const studentAPI = {
    getEnrolledCourses: (studentId) =>
        api.get(`/api/students/${studentId}/courses`),
    getAttendanceHistory: (studentId) =>
        api.get(`/api/attendance/student/${studentId}`),
    getAttendanceByCourse: (studentId, courseId) =>
        api.get(`/api/attendance/student/${studentId}/course/${courseId}`),
    markAttendance: (data) =>
        api.post('/api/attendance/mark', data),
    getAvailableCourses: (studentId) =>
        api.get(`/api/students/${studentId}/available-courses`),
    
    selfEnroll: (studentId, courseId) =>
        api.post(`/api/students/${studentId}/enroll/${courseId}`),

    unenroll: (studentId, courseId) =>
        api.delete(`/api/enrollment/${studentId}/${courseId}`)
};

export const teacherAPI = {
    getCourses: (teacherId) =>
        api.get(`/api/teachers/${teacherId}/courses`),
    generateQR: (data) =>
        api.post('/api/qr/generate', data),
    getSessionDetails: (sessionId) =>
        api.get(`/api/qr/session/${sessionId}`),
    getSessionAttendance: (sessionId) =>
        api.get(`/api/attendance/session/${sessionId}`),
    deactivateSession: (sessionId) =>
        api.put(`/api/qr/session/${sessionId}/deactivate`)
};

export const adminAPI = {
    getAllDepartments: () => api.get('/api/admin/departments'),
    createDepartment: (data) => api.post('/api/admin/departments', data),
    deleteDepartment: (id) => api.delete(`/api/admin/departments/${id}`),
    getAllCourses: () => api.get('/api/admin/courses'),
    createCourse: (data) => api.post('/api/admin/courses', data),
    deleteCourse: (id) => api.delete(`/api/admin/courses/${id}`),
    getAllStudents: () => api.get('/api/admin/students'),
    enrollStudent: (data) => api.post('/api/admin/enroll', data),
    getAllTeachers: () => api.get('/api/admin/teachers'),
    getAllAttendance: () => api.get('/api/admin/attendance')
};

export default api;