import axios from 'axios';

const api = axios.create({
    // baseURL: 'http://localhost:8000/mycourse/',
    baseURL: "https://course-system-6zug.onrender.com",
});

// ── Request: har so'rovga token qo'shish ─────────────────────────────────────
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ── Response: 401 da token yangilash ─────────────────────────────────────────
api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        // Token eskirgan va bu so'rov avval retry qilinmagan bo'lsa
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Cheksiz loop bo'lmasin

            const refreshToken = localStorage.getItem('refresh');

            if (!refreshToken) {
                // Refresh token ham yo'q — loginга yuborish
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                // Refresh token bilan yangi access token olish
                const res = await axios.post(
                    'http://localhost:8000/mycourse/login/refresh/',
                    { refresh: refreshToken }
                );

                const newAccessToken = res.data.access;
                localStorage.setItem('access', newAccessToken);

                // Yangi token bilan original so'rovni qayta yuborish
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);

            } catch (refreshError) {
                // Refresh token ham eskirgan — foydalanuvchini chiqarish
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