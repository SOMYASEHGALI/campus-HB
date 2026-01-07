// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Get full API URL
export const getApiUrl = (endpoint) => {
    // Remove leading slash from endpoint
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;

    if (!API_BASE_URL) {
        return `/api/${cleanEndpoint}`;
    }

    // Ensure API_BASE_URL doesn't end with a slash for consistent joining
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;

    return `${baseUrl}/${cleanEndpoint}`;
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
