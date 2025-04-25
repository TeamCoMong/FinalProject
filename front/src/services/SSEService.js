import EventSource from 'react-native-event-source';
import { navigationRef } from '../navigation/NavigationService';

let eventSource = null;

const intentToRoute = {
    '로그인': 'TestLoginScreen',
    '회원가입': 'Register',
    '길안내': 'KakaoMap',
};

export const startSSE = () => {
    if (eventSource) {
        console.log("⚠️ 이미 연결된 SSE가 있음 (중복 방지)");
        return;
    }

    console.log("🚀 SSE 연결 시작");

    eventSource = new EventSource('http://10.0.2.2:8080/dialogflow/sse');

    eventSource.addEventListener('intent', (event) => {
        const data = JSON.parse(event.data);
        console.log('🔥 [SSE] intent 수신:', data.intent);

        const route = intentToRoute[data.intent];
        if (route && navigationRef.isReady()) {
            navigationRef.navigate(route);
        }
    });

    eventSource.onopen = () => {
        console.log("✅ SSE 연결 성공");
    };

    eventSource.onerror = (err) => {
        console.error('❌ [SSE] 연결 오류:', err);
        eventSource.close();
        eventSource = null;

        // 📌 재연결 로직 추가
        setTimeout(() => {
            console.log('🔁 [SSE] 재연결 시도...');
            startSSE(); // 재연결
        }, 5000); // 5초 후 재연결 시도
    };
};

export const stopSSE = () => {
    if (eventSource) {
        console.log("🧹 SSE 연결 닫음");
        eventSource.close();
        eventSource = null;
    }
};