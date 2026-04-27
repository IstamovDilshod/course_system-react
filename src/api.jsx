import axios from 'axios';

const api = axios.create({
    baseURL: "https://course-system-6zug.onrender.com/mycourse", // Backend URL'ini to'g'ri ko'rsating
    withCredentials: true, // Cookie va tokenlar uchun muhim
});

// Request: Har so'rovga token qo'shish
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response: 401 da token yangilash
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refresh');
            if (!refreshToken) {
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                // DIQQAT: Bu yerda localhost emas, Render URL'ni ishlating
                const res = await axios.post(
                    'https://course-system-6zug.onrender.com/mycourse/token/refresh/', // Backenddagi to'g'ri URL
                    { refresh: refreshToken }
                );

                const newAccessToken = res.data.access;
                localStorage.setItem('access', newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;