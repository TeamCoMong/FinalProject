import axios from 'axios';

// Base Url 설정
const BASE_URL = 'https://7170-61-34-253-238.ngrok-free.app/api';

// Axios 인스턴스 생성
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000, // 10초 타임아웃
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;