// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Get full API URL
export const getApiUrl = (endpoint) => {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;

    if (!API_BASE_URL) {
        // Use relative URL (same domain)
        return `/api/${cleanEndpoint}`;
    }

    // Use full URL from env
    return `${API_BASE_URL}/${cleanEndpoint}`;
};

// Get upload URL
export const getUploadUrl = (path) => {
    if (!path) return '';

    // If path already has domain, return as is
    if (path.startsWith('http')) {
        return path;
    }

    // Return relative path
    return path.startsWith('/') ? path : `/${path}`;
};

export default API_BASE_URL;
