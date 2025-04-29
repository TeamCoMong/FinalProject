import axios from 'axios';
import EncryptedStorage from 'react-native-encrypted-storage';
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
// 매 요청 전에 accessToken 자동 첨부
api.interceptors.request.use(async (config) => {
    const token = await EncryptedStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
export default api;