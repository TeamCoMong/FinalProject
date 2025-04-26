import EventSource from 'react-native-event-source';
import { navigationRef } from '../navigation/NavigationService';

let eventSource = null;
let lastPingTime = Date.now();
let heartbeatChecker = null;

const intentToRoute = {
    '로그인': 'UserLoginScreen',
    '회원가입': 'UserRegisterScreen',
    '길안내': 'HomeStartScreen',
    '지폐인식':'BillScanScreen',

};

// 1. SSE 연결
export const startSSE = () => {
    if (eventSource) {
        console.log("⚠️ SSE 이미 연결됨");
        return;
    }

    console.log("🚀 SSE 연결 시작");

    eventSource = new EventSource('https://c7c6-61-34-253-238.ngrok-free.app/dialogflow/sse');

    eventSource.onmessage = (event) => {
        console.log("📩 [onmessage] raw 이벤트:", event);
    };


    // 2. ping 이벤트 감지
    eventSource.addEventListener('ping', () => {
        lastPingTime = Date.now();
        console.log("📶 ping 수신:", new Date(lastPingTime).toLocaleTimeString());
    });

    // 3. intent 이벤트 감지
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
        lastPingTime = Date.now();

        // 4. 주기적으로 ping 응답 유무 확인 (15초 기준)
        heartbeatChecker = setInterval(() => {
            const now = Date.now();
            if (now - lastPingTime > 15000) {
                console.warn("💥 ping 수신 끊김 → SSE 재연결 시도");
                reconnectSSE();
            }
        }, 5000);
    };

    eventSource.onerror = (err) => {
        console.error("❌ SSE 오류 발생:", err);
        reconnectSSE();
    };
};

// 5. 연결 종료
export const stopSSE = () => {
    if (eventSource) {
        console.log("🧹 SSE 연결 종료");
        eventSource.close();
        eventSource = null;
    }

    if (heartbeatChecker) {
        clearInterval(heartbeatChecker);
        heartbeatChecker = null;
    }
};

// 6. 재연결 로직
const reconnectSSE = () => {
    stopSSE();
    setTimeout(() => {
        console.log("🔁 SSE 재연결 시도 중...");
        startSSE();
    }, 5000);
};

