// API utility functions
export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    return fetch(url, options);
};
