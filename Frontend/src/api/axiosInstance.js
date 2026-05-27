import axios from 'axios';

// These will pull from your .env file automatically
const NODE_URL = process.env.REACT_APP_NODE_URL || 'http://localhost:5000';
const DJANGO_URL = process.env.REACT_APP_DJANGO_URL || 'http://localhost:8000';

// 1. Instance for Node.js (Auth, Hotels, AI)
export const nodeApi = axios.create({
    baseURL: NODE_URL,
});

// 2. Instance for Django (Flights, My Bookings)
export const djangoApi = axios.create({
    baseURL: DJANGO_URL,
});

// Add the JWT Token to BOTH instances automatically
const attachToken = (config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};

nodeApi.interceptors.request.use(attachToken);
djangoApi.interceptors.request.use(attachToken);