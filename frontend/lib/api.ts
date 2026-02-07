import axios from 'axios';

// Development: use localhost:8080 via .env.local
// Production: empty string = relative paths, nginx proxies to echo-backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to every request
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('echo_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Handle 401 errors - redirect to login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('echo_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export interface Meeting {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
    transcript: string;
    notes: string;
    audio_path: string;
    duration_seconds: number;
    is_recording: boolean;
}

// Auth
export const authApi = {
    login: (username: string, password: string) =>
        api.post<{ token: string }>('/auth/login', { username, password }),
};

// Meetings
export const meetingsApi = {
    getAll: () => api.get<{ meetings: Meeting[] }>('/meetings'),
    getOne: (id: number) => api.get<Meeting>(`/meetings/${id}`),
    create: (title?: string) => api.post<Meeting>('/meetings', { title }),
    update: (id: number, data: { title?: string; notes?: string }) =>
        api.put<Meeting>(`/meetings/${id}`, data),
    delete: (id: number) => api.delete(`/meetings/${id}`),
    finish: (id: number) => api.post<Meeting>(`/meetings/${id}/finish`),
};

// Transcription
export const transcriptionApi = {
    uploadChunk: (meetingId: number, audioBlob: Blob) => {
        const formData = new FormData();
        formData.append('audio', audioBlob, `chunk-${Date.now()}.webm`);
        formData.append('meeting_id', meetingId.toString());
        return api.post<{ text: string }>('/live-chunk', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

// AI
export const aiApi = {
    format: (text: string, action: 'beautify' | 'extract-tasks') =>
        api.post<{ result: string }>('/ai-format', { text, action }),
};

export default api;
