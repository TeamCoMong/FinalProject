// DetectionService.js
import TcpSocket from "react-native-tcp-socket";
import { AppState, Vibration, Platform } from "react-native";
import Tts from 'react-native-tts';

const APP_SERVER_PORT = 5000;
const VERY_CLOSE_ANNOUNCEMENT_COOLDOWN = 1500; // "매우 가까이" 안내 쿨다운 (1.5초)
const DEFAULT_ANNOUNCEMENT_COOLDOWN = 5000;   // 일반적인 시간 기반 쿨다운 (5초) - "매우 가까이"가 아닌 경우 첫 안내 후 이 시간 동안은 동일 키 반복 안함
const MIN_CONFIDENCE_FOR_ANNOUNCEMENT = 0.3; // 안내 최소 신뢰도
const DISTANCE_M_THRESHOLD_VERY_CLOSE = 2.0; // 미터 (1m 미만)
const DISTANCE_M_THRESHOLD_CLOSE = 3.5;    // 미터 (2m 미만)

// 진동 패턴
const VIBRATION_PATTERN_VERY_CLOSE = [0, 200, 100, 200]; // "매우 가까이" 시 짧고 빠른 패턴
const VIBRATION_PATTERN_CLOSE = [0, 500];                // "가까이" 시 한 번 길게
const VIBRATION_PATTERN_NONE = null;

// 진동 주기
const VIBRATION_INTERVAL_VERY_CLOSE = 1000; // "매우 가까이" 상태 진동 시도 간격 (1초)
const VIBRATION_INTERVAL_CLOSE = 2000;    // "가까이" 상태 진동 시도 간격 (2초)

let serverInstance = null;
let clientSocketInstance = null;
let isConnectedToRPi = false;
let lastSuccessfullyAnnouncedTTS = { content: null, time: 0 }; // 쿨다운용 (content는 ttsKey 저장)
let appState = AppState.currentState;
let appStateSubscription = null;
let lastVibrationTime = 0;
let lastVibrationType = VIBRATION_PATTERN_NONE;

// TTS 기본 속도 설정은 App.js에서 앱 초기화 시 한 번 하는 것이 좋습니다.
// 예: Tts.setDefaultRate(0.65, true); // App.js의 useEffect 등에서

const translateClass = (cls) => {
    const dict = {
        wheelchair: "휠체어", truck: "트럭", tree_trunk: "나무",
        stroller: "유모차", scooter: "스쿠터", pole: "기둥",
        person: "사람", motorcycle: "오토바이", fire_hydrant: "소화전",
        car: "자동차", bus: "버스", bollard: "볼라드", bicycle: "자전거",
        traffic_sign: "교통 표지판", traffic_light: "신호등", table: "탁자",
        stop: "정지 표시", potted_plant: "화분", parking_meter: "주차 미터기",
        movable_signage: "이동식 표지판", kiosk: "키오스크", dog: "강아지",
        chair: "의자", cat: "고양이", carrier: "이동장", bench: "벤치",
        barricade: "차단봉",
    };
    return dict[cls.toLowerCase()] || cls;
};

// RPi 데이터 파싱 -> TTS 메시지 생성
// 반환값: { ttsMessage: "TTS할 문장 (null이면 TTS 안함)", ttsKey: "쿨다운 비교용 키", isVeryClose: boolean }
const parseDataAndGenerateTTS = (raw) => {
    try {
        const trimmedRaw = raw.trim();
        let detectedDistanceM = null; // RPi에서 넘어오는 미터 단위 거리
        let detectedObjects = [];
        let vibrationPatternToUse = VIBRATION_PATTERN_NONE;

        if (trimmedRaw === "" || trimmedRaw.toUpperCase() === "NO_OBJECT") {
            console.log("DetectionService: 주변에 감지된 객체가 없습니다.");
            return { ttsMessage: null, ttsKey: null, isVeryClose: false, VIBRATION_PATTERN_NONE };
        }

        const items = trimmedRaw.split(',');
        if (items.length === 0) {
            return { ttsMessage: null, ttsKey: null, isVeryClose: false, VIBRATION_PATTERN_NONE };
        }

        items.forEach(item => {
            const parts = item.split(':');
            if (parts.length !== 2) return;

            const keyOrClass = parts[0].trim();
            const valueStr = parts[1].trim();

            if (keyOrClass.toLowerCase() === "distance") {
                const m = parseFloat(valueStr);
                if (!isNaN(m) && m >= 0) {
                    detectedDistanceM = m;
                }
            } else {
                const confidence = parseFloat(valueStr);
                if (keyOrClass !== "" && !isNaN(confidence) && confidence >= MIN_CONFIDENCE_FOR_ANNOUNCEMENT) {
                    detectedObjects.push({ name: keyOrClass, confidence: confidence });
                }
            }
        });

        if (detectedObjects.length === 0 && detectedDistanceM === null) {
            return { ttsMessage: null, ttsKey: null, isVeryClose: false, VIBRATION_PATTERN_NONE };
        }

        let ttsMessage = null;
        let ttsKey = null;
        let isVeryClose = false;

        if (detectedObjects.length > 0) {
            detectedObjects.sort((a, b) => b.confidence - a.confidence);
            const primaryObject = detectedObjects[0];
            const translatedPrimaryObject = translateClass(primaryObject.name);

            if (detectedDistanceM !== null) {
                const distanceM_formatted = detectedDistanceM.toFixed(1);
                if (detectedDistanceM < DISTANCE_M_THRESHOLD_VERY_CLOSE) {
                    ttsMessage = `매우 가까이 ${translatedPrimaryObject}!`;
                    ttsKey = `${primaryObject.name}_very_close`;
                    isVeryClose = true;
                    vibrationPatternToUse = VIBRATION_PATTERN_VERY_CLOSE;
                } else if (detectedDistanceM < DISTANCE_M_THRESHOLD_CLOSE) {
                    ttsMessage = `가까이 ${translatedPrimaryObject}.`;
                    ttsKey = `${primaryObject.name}_close`;
                    vibrationPatternToUse = VIBRATION_PATTERN_CLOSE;
                } else {
                    ttsMessage = `전방 약 ${distanceM_formatted}미터에 ${translatedPrimaryObject}.`;
                    ttsKey = `${primaryObject.name}_far`;
                }
            } else {
                ttsMessage = `${translatedPrimaryObject}(이)가 보입니다.`;
                ttsKey = `${primaryObject.name}_visible`;
            }
        }

        return { ttsMessage: ttsMessage, ttsKey: ttsKey, isVeryClose: isVeryClose, vibrationPatternToUse: vibrationPatternToUse };

    } catch (e) {
        console.error("DetectionService: Error parsing message for TTS:", e, "Raw data:", raw);
        return { ttsMessage: null, ttsKey: null, isVeryClose: false, vibrationPatternToUse: VIBRATION_PATTERN_NONE };
    }
};

const sendCommandToRPi = (command) => {
    if (clientSocketInstance && !clientSocketInstance._destroyed && clientSocketInstance._readyState === "open") {
        try {
            console.log(`DetectionService: 📲 RPi 명령 전송: ${command}`);
            clientSocketInstance.write(`${command}\n`);
        } catch (error) {
            console.error("DetectionService: 🚨 RPi 명령 전송 오류:", error, "명령:", command);
        }
    } else {
        console.warn("DetectionService: ⚠️ RPi 소켓 준비 안됨. 명령 전송 실패:", command);
    }
};

const handleAppStateChange = (nextAppState) => {
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('DetectionService: 앱 포그라운드 진입. 감지 재시작 요청.');
        if (isConnectedToRPi && serverInstance) {
            sendCommandToRPi("START_DETECTION");
        }
    } else if (appState === 'active' && nextAppState.match(/inactive|background/)) {
        console.log('DetectionService: 앱 백그라운드 진입. 감지 중지 요청.');
        if (serverInstance) {
            sendCommandToRPi("STOP_DETECTION");
        }
    }
    appState = nextAppState;
};

export const startDetectionService = () => {
    if (serverInstance) {
        console.log("DetectionService: 이미 실행 중. 연결 상태 확인 및 감지 시작 재요청.");
        if (isConnectedToRPi) {
            sendCommandToRPi("START_DETECTION");
        }
        return;
    }

    console.log("DetectionService: 서비스 시작 중...");

    lastSuccessfullyAnnouncedTTS = { content: null, time: 0 };
    lastVibrationTime = 0;
    lastVibrationType = VIBRATION_PATTERN_NONE;

    if (appStateSubscription) {
        appStateSubscription.remove();
    }
    appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    const server = TcpSocket.createServer((socket) => {
        console.log("DetectionService: 📥 라즈베리파이 연결됨.");
        isConnectedToRPi = true;
        clientSocketInstance = socket;

        setTimeout(() => {
            if (isConnectedToRPi && clientSocketInstance) {
                console.log("DetectionService: START_DETECTION 명령 전송 시도.");
                sendCommandToRPi("START_DETECTION");
            }
        }, 500);

        socket.on("data", (data) => {
            const message = data.toString().trim();
            console.log("DetectionService: 📦 RPi 데이터 수신:", message);

            const parsedResult = parseDataAndGenerateTTS(message);
            const now = Date.now();

            if (parsedResult.ttsMessage && parsedResult.ttsKey) {
                let currentCooldownToApply = parsedResult.isVeryClose ? VERY_CLOSE_ANNOUNCEMENT_COOLDOWN : DEFAULT_ANNOUNCEMENT_COOLDOWN;

                if (!parsedResult.isVeryClose && parsedResult.ttsKey === lastSuccessfullyAnnouncedTTS.content) {

                    console.log(`DetectionService: TTS 이미 안내됨 (매우 가까이 아님, 동일 Key) - Key: "${parsedResult.ttsKey}"`);
                    return; // 동일 키, 매우 가까이 아니면 중복 안내 방지
                }

                if (parsedResult.ttsKey === lastSuccessfullyAnnouncedTTS.content &&
                    (now - lastSuccessfullyAnnouncedTTS.time < currentCooldownToApply)) {
                    console.log(`DetectionService: TTS 시간 쿨다운 - Key: "${parsedResult.ttsKey}", Msg: "${parsedResult.ttsMessage}" (최근 안내됨)`);
                } else {
                    console.log(`DetectionService: 🗣️ TTS 안내: "${parsedResult.ttsMessage}"`);
                    Tts.stop(); // 이전 TTS 중지
                    Tts.speak(parsedResult.ttsMessage, {
                        // androidParams: { /* 필요한 경우 특정 스트림 지정 */ },
                        rate: 0.85, // TTS 속도 (0.5가 보통, 1.0이 빠름)
                        // pitch: 1.0 // 음높이
                    });
                    lastSuccessfullyAnnouncedTTS = { content: parsedResult.ttsKey, time: now };
                }
            } else {

            }
            // 진동 처리
            if (parsedResult.vibrationPatternToUse && parsedResult.vibrationPatternToUse !== VIBRATION_PATTERN_NONE) {
                let vibrationIntervalToUse = 0;

                if (parsedResult.vibrationPatternToUse === VIBRATION_PATTERN_VERY_CLOSE) {
                    vibrationIntervalToUse = VIBRATION_INTERVAL_VERY_CLOSE;
                } else if (parsedResult.vibrationPatternToUse === VIBRATION_PATTERN_CLOSE) {
                    vibrationIntervalToUse = VIBRATION_INTERVAL_CLOSE;
                }

                // 패턴이 변경되었거나, 동일 패턴이라도 정해진 간격이 지났으면 진동
                if (parsedResult.vibrationPatternToUse !== lastVibrationType || (now - lastVibrationTime > vibrationIntervalToUse)) {
                    console.log(`DetectionService: 진동 실행 (패턴: ${parsedResult.vibrationPatternToUse === VIBRATION_PATTERN_VERY_CLOSE ? '매우 가까이' : '가까이'})`);
                    Vibration.vibrate(parsedResult.vibrationPatternToUse);
                    lastVibrationTime = now;
                    lastVibrationType = parsedResult.vibrationPatternToUse;
                } else {

                }
            } else { // 진동할 필요 없는 경우
                if (lastVibrationType !== VIBRATION_PATTERN_NONE) {
                    lastVibrationType = VIBRATION_PATTERN_NONE; // 이전 진동 타입 초기화
                    Vibration.cancel(); // 필요시 즉시 진동 중단
                }
            }
        });

        socket.on("close", (hadError) => {
            console.log(`DetectionService: ❌ RPi 연결 종료됨. 오류 발생: ${hadError}`);
            isConnectedToRPi = false;
            clientSocketInstance = null;
        });

        socket.on("error", (error) => {
            console.error("DetectionService: 🚨 소켓 오류:", error);
            if (clientSocketInstance && clientSocketInstance === socket) {
                isConnectedToRPi = false;
                clientSocketInstance = null;
            }
        });
    });

    server.on('error', (error) => {
        console.error('DetectionService: 🚨 서버 생성/리스닝 오류:', error);
        serverInstance = null;
    });

    server.listen({ port: APP_SERVER_PORT, host: "0.0.0.0" }, () => {
        console.log(`DetectionService: ✅ TCP 서버 시작됨. 포트: ${APP_SERVER_PORT}`);
    });
    serverInstance = server;
};

export const stopDetectionService = () => {

    Vibration.cancel();

    if (!serverInstance) {
        console.log("DetectionService: 이미 중지되었거나 시작되지 않았습니다.");
        return;
    }

    console.log("DetectionService: 서비스 중지 중...");
    if (appStateSubscription) {
        appStateSubscription.remove();
        appStateSubscription = null;
    }

    if (clientSocketInstance) {
        console.log("DetectionService: STOP_DETECTION 명령 전송 (클라이언트 소켓 존재).");
        sendCommandToRPi("STOP_DETECTION");
        clientSocketInstance.destroy();
        clientSocketInstance = null;
    }

    serverInstance.close(() => {
        console.log("DetectionService: 앱 TCP 서버 완전히 종료됨.");
    });
    serverInstance = null;
    isConnectedToRPi = false;
};

export const getDetectionStatus = () => {
    return {
        isRunning: !!serverInstance,
        isConnectedToRPi: isConnectedToRPi,
    };
};