import EventSource from 'react-native-event-source';
import { navigationRef } from '../navigation/NavigationService';
import { NGROK_URL } from '../config/ngrok';

let eventSource = null;
let lastPingTime = Date.now();
let heartbeatChecker = null;

const intentToRoute = {
    '로그인': 'UserLoginScreen',
    '회원가입': 'UserRegisterScreen',
    '길안내': 'HomeStartScreen',
    '지폐인식':'BillScanScreen',
    '도움말':'UserHelpScreen',
    '상세설정':'MyProfileInfoScreen',
    '내설정':'SettingsHelpScreen',

};

// SSE 연결
export const startSSE = () => {
    if (eventSource) {
        console.log("SSE 이미 연결됨");
        return;
    }

    console.log("SSE 연결 시작");

    eventSource = new EventSource(`${NGROK_URL}/dialogflow/sse`);

    eventSource.onmessage = (event) => {
        console.log("[onmessage] raw 이벤트:", event);
        console.log('기본 onmessage 수신:', event.data);
    };



    // 2. ping 이벤트 감지
    eventSource.addEventListener('ping', () => {
        lastPingTime = Date.now();
        console.log("📶 ping 수신:", new Date(lastPingTime).toLocaleTimeString());
    });

    // intent 이벤트 감지
    eventSource.addEventListener('intent', (event) => {
        const data = JSON.parse(event.data);
        console.log('[SSE] intent 수신:', data.intent);

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
                console.warn("ping 수신 끊김 → SSE 재연결 시도");
                reconnectSSE();
            }
        }, 5000);
    };

    eventSource.onerror = (err) => {
        console.error("❌ SSE 오류 발생:", err);
        reconnectSSE();
    };
};

// 연결 종료
export const stopSSE = () => {
    if (eventSource) {
        console.log("SSE 연결 종료");
        eventSource.close();
        eventSource = null;
    }

    if (heartbeatChecker) {
        clearInterval(heartbeatChecker);
        heartbeatChecker = null;
    }
};

export const getEventSource = () => eventSource;

// 재연결 로직
const reconnectSSE = () => {
    stopSSE();
    setTimeout(() => {
        console.log("SSE 재연결 시도 중...");
        startSSE();
    }, 5000);
};
