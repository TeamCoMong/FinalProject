// DetectionService.js
import TcpSocket from "react-native-tcp-socket";
import { AppState, Vibration, Platform } from "react-native";
import Tts from 'react-native-tts';

const APP_SERVER_PORT = 5000;
const VERY_CLOSE_ANNOUNCEMENT_COOLDOWN = 1500; // "매우 가까이" 안내 쿨다운
const DEFAULT_ANNOUNCEMENT_COOLDOWN = 5000;   // 일반적인 시간 기반 쿨다운
const MIN_CONFIDENCE_FOR_ANNOUNCEMENT = 0.3; // 안내 최소 신뢰도
const DISTANCE_M_THRESHOLD_VERY_CLOSE = 2.0; // 미터 (2m 미만)
const DISTANCE_M_THRESHOLD_CLOSE = 3.5;    // 미터 (3.5m 미만)

// 진동 패턴
const VIBRATION_PATTERN_VERY_CLOSE = [0, 200, 100, 200]; // "매우 가까이" 시 짧고 빠른 패턴
const VIBRATION_PATTERN_CLOSE = [0, 500]; // "가까이" 시 한 번 길게
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


// ### 이 함수를 여기에 추가합니다. ###
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


// 이 함수는 현재 로직에서 직접 사용되진 않지만, 다른 접근 방식을 위해 남겨둘 수 있습니다.
const translateDetectionKey = (key) => {
    const dict = {
        // --- Forward (F) ---
        f_wheelchair: "전방 휠체어", f_truck: "전방 트럭", f_tree_trunk: "전방 나무",
        f_stroller: "전방 유모차", f_scooter: "전방 스쿠터", f_pole: "전방 기둥",
        f_person: "전방 사람", f_motorcycle: "전방 오토바이", f_fire_hydrant: "전방 소화전",
        f_car: "전방 자동차", f_bus: "전방 버스", f_bollard: "전방 볼라드", f_bicycle: "전방 자전거",
        f_traffic_sign: "전방 교통 표지판", f_traffic_light: "전방 신호등", f_table: "전방 탁자",
        f_stop: "전방 정지 표시", f_potted_plant: "전방 화분", f_parking_meter: "전방 주차 미터기",
        f_movable_signage: "전방 이동식 표지판", f_kiosk: "전방 키오스크", f_dog: "전방 강아지",
        f_chair: "전방 의자", f_cat: "전방 고양이", f_carrier: "전방 이동장", f_bench: "전방 벤치",
        f_barricade: "전방 차단봉",

        // --- Left (L) ---
        l_wheelchair: "왼쪽 휠체어", l_truck: "왼쪽 트럭", l_tree_trunk: "왼쪽 나무",
        l_stroller: "왼쪽 유모차", l_scooter: "왼쪽 스쿠터", l_pole: "왼쪽 기둥",
        l_person: "왼쪽 사람", l_motorcycle: "왼쪽 오토바이", l_fire_hydrant: "왼쪽 소화전",
        l_car: "왼쪽 자동차", l_bus: "왼쪽 버스", l_bollard: "왼쪽 볼라드", l_bicycle: "왼쪽 자전거",
        l_traffic_sign: "왼쪽 교통 표지판", l_traffic_light: "왼쪽 신호등", l_table: "왼쪽 탁자",
        l_stop: "왼쪽 정지 표시", l_potted_plant: "왼쪽 화분", l_parking_meter: "왼쪽 주차 미터기",
        l_movable_signage: "왼쪽 이동식 표지판", l_kiosk: "왼쪽 키오스크", l_dog: "왼쪽 강아지",
        l_chair: "왼쪽 의자", l_cat: "왼쪽 고양이", l_carrier: "왼쪽 이동장", l_bench: "왼쪽 벤치",
        l_barricade: "왼쪽 차단봉",

        // --- Right (R) ---
        r_wheelchair: "오른쪽 휠체어", r_truck: "오른쪽 트럭", r_tree_trunk: "오른쪽 나무",
        r_stroller: "오른쪽 유모차", r_scooter: "오른쪽 스쿠터", r_pole: "오른쪽 기둥",
        r_person: "오른쪽 사람", r_motorcycle: "오른쪽 오토바이", r_fire_hydrant: "오른쪽 소화전",
        r_car: "오른쪽 자동차", r_bus: "오른쪽 버스", r_bollard: "오른쪽 볼라드", r_bicycle: "오른쪽 자전거",
        r_traffic_sign: "오른쪽 교통 표지판", r_traffic_light: "오른쪽 신호등", r_table: "오른쪽 탁자",
        r_stop: "오른쪽 정지 표시", r_potted_plant: "오른쪽 화분", r_parking_meter: "오른쪽 주차 미터기",
        r_movable_signage: "오른쪽 이동식 표지판", r_kiosk: "오른쪽 키오스크", r_dog: "오른쪽 강아지",
        r_chair: "오른쪽 의자", r_cat: "오른쪽 고양이", r_carrier: "오른쪽 이동장", r_bench: "오른쪽 벤치",
        r_barricade: "오른쪽 차단봉",
    };
    return dict[key.toLowerCase()] || key;
};

// RPi 데이터 파싱 -> TTS 메시지 생성
const parseDataAndGenerateTTS = (raw) => {
    try {
        const trimmedRaw = raw.trim();
        let detectedDistanceM = null;
        let detectedObjects = [];
        let vibrationPatternToUse = VIBRATION_PATTERN_NONE;

        if (trimmedRaw === "" || trimmedRaw.toUpperCase() === "NO_OBJECT") {
            return { ttsMessage: null, ttsKey: null, isVeryClose: false, vibrationPatternToUse: VIBRATION_PATTERN_NONE };
        }

        const items = trimmedRaw.split(',');
        items.forEach(item => {
            const parts = item.split(':');
            if (parts.length !== 2) return;

            const key = parts[0].trim();
            const valueStr = parts[1].trim();

            if (key.toLowerCase() === "distance") {
                const m = parseFloat(valueStr);
                if (!isNaN(m) && m >= 0) detectedDistanceM = m;
            } else {
                const confidence = parseFloat(valueStr);
                if (key !== "" && !isNaN(confidence) && confidence >= MIN_CONFIDENCE_FOR_ANNOUNCEMENT) {
                    detectedObjects.push({ name: key, confidence: confidence });
                }
            }
        });

        if (detectedObjects.length === 0 && detectedDistanceM === null) {
            return { ttsMessage: null, ttsKey: null, isVeryClose: false, vibrationPatternToUse: VIBRATION_PATTERN_NONE };
        }

        let ttsMessage = null;
        let ttsKey = null;
        let isVeryClose = false;

        if (detectedObjects.length > 0) {
            detectedObjects.sort((a, b) => b.confidence - a.confidence);
            const primaryObject = detectedObjects[0];

            // 1. 방향과 객체 이름 분리 및 번역
            const keyParts = primaryObject.name.split('_');
            const directionCode = keyParts.length > 1 ? keyParts[0] : 'f';
            const objectName = keyParts.length > 1 ? keyParts[1] : primaryObject.name;
            const translatedObjectName = translateClass(objectName);

            // 2. 방향 코드에 맞는 한글 텍스트 생성
            let directionText = "";
            let directionWithPostposition = "";
            switch (directionCode.toLowerCase()) {
                case 'l':
                    directionText = "왼쪽";
                    directionWithPostposition = "왼쪽에";
                    break;
                case 'r':
                    directionText = "오른쪽";
                    directionWithPostposition = "오른쪽에";
                    break;
                case 'f':
                default:
                    directionText = "전방";
                    directionWithPostposition = "전방에";
                    break;
            }

            // 3. 거리와 상황에 따라 최종 메시지 조합
            if (detectedDistanceM !== null) {
                const distanceM_formatted = detectedDistanceM.toFixed(1);
                if (detectedDistanceM < DISTANCE_M_THRESHOLD_VERY_CLOSE) {
                    ttsMessage = `${directionText} 매우 가까이 ${translatedObjectName}!`;
                    ttsKey = `${primaryObject.name}_very_close`;
                    isVeryClose = true;
                    vibrationPatternToUse = VIBRATION_PATTERN_VERY_CLOSE;
                } else if (detectedDistanceM < DISTANCE_M_THRESHOLD_CLOSE) {
                    ttsMessage = `${directionText} 가까이 ${translatedObjectName}.`;
                    ttsKey = `${primaryObject.name}_close`;
                    vibrationPatternToUse = VIBRATION_PATTERN_CLOSE;
                } else {
                    ttsMessage = `${directionWithPostposition} 약 ${distanceM_formatted}미터에 ${translatedObjectName}.`;
                    ttsKey = `${primaryObject.name}_far`;
                }
            } else {
                // 거리 정보가 없을 때
                ttsMessage = `${directionWithPostposition} ${translatedObjectName}(이)가 보입니다.`;
                ttsKey = `${primaryObject.name}_visible`;
            }
        }

        return { ttsMessage, ttsKey, isVeryClose, vibrationPatternToUse };

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

            if (!parsedResult || !parsedResult.ttsKey) {
                return;
            }

            // "매우 가까이"는 최우선으로 처리
            if (parsedResult.isVeryClose) {
                if (now - lastSuccessfullyAnnouncedTTS.time > VERY_CLOSE_ANNOUNCEMENT_COOLDOWN) {
                    console.log(`DetectionService: 🗣️ [최우선] TTS 안내: "${parsedResult.ttsMessage}"`);
                    Tts.stop();
                    Tts.speak(parsedResult.ttsMessage, { rate: 0.85 });
                    lastSuccessfullyAnnouncedTTS = { content: parsedResult.ttsKey, time: now };
                } else {
                    console.log(`DetectionService: TTS 쿨다운 (매우 가까이) - Key: "${parsedResult.ttsKey}"`);
                }
            }
            // "매우 가까이"가 아닐 때만 다른 안내 고려
            else {
                // 이전에 안내한 내용과 다르면 즉시 안내
                if (parsedResult.ttsKey !== lastSuccessfullyAnnouncedTTS.content) {
                    console.log(`DetectionService: 🗣️ [새로운 객체] TTS 안내: "${parsedResult.ttsMessage}"`);
                    Tts.stop();
                    Tts.speak(parsedResult.ttsMessage, { rate: 0.85 });
                    lastSuccessfullyAnnouncedTTS = { content: parsedResult.ttsKey, time: now };
                }
                // 이전에 안내한 내용과 동일하면, 일반 쿨다운 적용
                else if (now - lastSuccessfullyAnnouncedTTS.time > DEFAULT_ANNOUNCEMENT_COOLDOWN) {
                    console.log(`DetectionService: 🗣️ [쿨다운 만료] TTS 안내: "${parsedResult.ttsMessage}"`);
                    Tts.stop();
                    Tts.speak(parsedResult.ttsMessage, { rate: 0.85 });
                    lastSuccessfullyAnnouncedTTS = { content: parsedResult.ttsKey, time: now };
                } else {
                    console.log(`DetectionService: TTS 쿨다운 (일반) - Key: "${parsedResult.ttsKey}"`);
                }
            }

            // 진동 처리 로직
            if (parsedResult.vibrationPatternToUse) {
                let vibrationIntervalToUse = 0;
                if (parsedResult.vibrationPatternToUse === VIBRATION_PATTERN_VERY_CLOSE) {
                    vibrationIntervalToUse = VIBRATION_INTERVAL_VERY_CLOSE;
                } else if (parsedResult.vibrationPatternToUse === VIBRATION_PATTERN_CLOSE) {
                    vibrationIntervalToUse = VIBRATION_INTERVAL_CLOSE;
                }

                if (parsedResult.vibrationPatternToUse !== lastVibrationType || (now - lastVibrationTime > vibrationIntervalToUse)) {
                    console.log(`DetectionService: 진동 실행 (패턴: ${parsedResult.vibrationPatternToUse === VIBRATION_PATTERN_VERY_CLOSE ? '매우 가까이' : '가까이'})`);
                    Vibration.vibrate(parsedResult.vibrationPatternToUse);
                    lastVibrationTime = now;
                    lastVibrationType = parsedResult.vibrationPatternToUse;
                }
            } else {
                if (lastVibrationType !== VIBRATION_PATTERN_NONE) {
                    lastVibrationType = VIBRATION_PATTERN_NONE;
                    Vibration.cancel();
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