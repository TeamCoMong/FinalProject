import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, AppState } from "react-native"; // AppState 추가
import TcpSocket from "react-native-tcp-socket";


const APP_SERVER_PORT = 5000; // 앱이 열 TCP 서버 포트

export default function GuidePage() {
    const serverRef = useRef(null);
    const clientSocketRef = useRef(null); // 연결된 클라이언트(라즈베리파이) 소켓 저장
    const [detectedInfo, setDetectedInfo] = useState("객체 감지 대기 중...");
    const [isConnectedToRPi, setIsConnectedToRPi] = useState(false);
    const appState = useRef(AppState.currentState); // 앱 상태 추적


    // 메시지를 자연어 문장으로 변환
    const parseToSentence = (raw) => {
        // ... (이전 코드와 동일)
        try {
            const items = raw.trim().split(',');
            if (items.length === 0 || raw.trim() === "") return "감지된 객체가 없습니다."; // 빈 데이터 처리
            if (raw.trim().toUpperCase() === "NO_OBJECT") return "주변에 감지된 객체가 없습니다.";


            const results = items.map(item => {
                const parts = item.split(':');
                if (parts.length !== 2) return null; // 형식 안맞으면 무시
                const [cls, confStr] = parts;
                const clsKor = translateClass(cls.trim());
                const conf = parseFloat(confStr);
                if (isNaN(conf)) return null; // 신뢰도 숫자 아니면 무시

                const percent = Math.round(conf * 100);
                return `${clsKor}이(가) ${percent}% 확률로 감지되었습니다.`;
            }).filter(Boolean); // null 값 제거

            if (results.length === 0) return "감지된 객체 정보 형식이 올바르지 않습니다.";

            return results.join(" ");
        } catch (e) {
            console.error("Error parsing message:", e, "Raw data:", raw);
            return "데이터 분석 중 오류가 발생했습니다.";
        }
    };

    const TARGET_CLASSES_FOR_ANNOUNCEMENT = [
        'wheelchair', 'truck', 'tree_trunk', 'stroller', 'scooter',
        'pole', 'person', 'motorcycle', 'fire_hydrant', 'car',
        'bus', 'bollard', 'bicycle'
        // '나무'에 해당하는 영문 클래스명이 'tree_trunk'인지, 아니면 'tree'인지 확인 필요.
        // YOLO 모델의 실제 클래스명과 일치해야 합니다. 여기서는 'tree_trunk'로 가정.
    ];

// 클래스명을 한국어로 번역
    const translateClass = (cls) => {
        const dict = {
            wheelchair: "휠체어", truck: "트럭", tree_trunk: "나무", // 또는 'tree': "나무"
            stroller: "유모차", scooter: "스쿠터", pole: "기둥",
            person: "사람", motorcycle: "오토바이", fire_hydrant: "소화전",
            car: "자동차", bus: "버스", bollard: "볼라드", bicycle: "자전거",
            // 아래는 TARGET_CLASSES_FOR_ANNOUNCEMENT에 없지만, 번역은 유지 (향후 추가 가능성 대비)
            traffic_sign: "교통 표지판", traffic_light: "신호등", table: "탁자",
            stop: "정지 표시", potted_plant: "화분", parking_meter: "주차 미터기",
            movable_signage: "이동식 표지판", kiosk: "키오스크", dog: "강아지",
            chair: "의자", cat: "고양이", carrier: "이동장", bench: "벤치",
            barricade: "차단봉",
        };
        return dict[cls.toLowerCase()] || cls;
    };

    const decideAndAnnounce = (objects, currentSensorDistance) => {
        if (!objects || objects.length === 0) {
            // ... (이전 코드: 객체 없을 때 거리 센서 기반 안내 또는 메시지)
            setDetectedInfo("주변에 감지된 주요 객체가 없습니다."); // 기본 메시지
            return;
        }

        // 1. 안내 대상 객체만 필터링
        const filteredObjects = objects.filter(obj =>
                TARGET_CLASSES_FOR_ANNOUNCEMENT.includes(obj.name.toLowerCase()) && // 소문자로 비교
                obj.confidence >= MIN_CONFIDENCE_FOR_ANNOUNCEMENT
            // && (obj.width / screenWidth >= MIN_SIZE_FOR_ANNOUNCEMENT) // 크기 필터는 필요시 추가
        );

        if (filteredObjects.length === 0) {
            setDetectedInfo("주변에 안내할 만한 주요 객체가 없습니다. (필터링됨)");
            return;
        }

        // 2. 필터링된 객체들 중에서 주요 객체 선정 (예: 화면 중앙, 높은 신뢰도)
        //    (이전 코드의 primaryObject 선정 로직을 filteredObjects에 대해 수행)
        const screenWidth = 640; // 실제 카메라 해상도 너비
        const screenCenterX = screenWidth / 2;
        let primaryObject = null;
        let minDistanceToCenter = Infinity;

        filteredObjects.forEach(obj => {
            const distanceToCenter = Math.abs(obj.xCenter - screenCenterX);
            if (distanceToCenter < screenWidth * CENTER_X_THRESHOLD) { // 화면 중앙 부근 객체 우선
                if (primaryObject === null || obj.confidence > primaryObject.confidence) {
                    primaryObject = obj;
                    minDistanceToCenter = distanceToCenter;
                }
            }
        });

        // 만약 중앙 부근에 안내 대상 객체가 없다면, 전체 필터링된 객체 중 가장 신뢰도 높은 것을 선택할 수도 있음
        if (!primaryObject && filteredObjects.length > 0) {
            primaryObject = filteredObjects.sort((a, b) => b.confidence - a.confidence)[0];
            console.log("중앙 객체 없음. 신뢰도 가장 높은 안내 대상 객체 선택:", primaryObject.name);
        }


        if (primaryObject) {
            const now = Date.now();
            if (primaryObject.name !== lastAnnouncedObject.name || now - lastAnnouncedObject.time > ANNOUNCEMENT_COOLDOWN) {
                const clsKor = translateClass(primaryObject.name);
                let announcement = "";
                if (currentSensorDistance !== null) {
                    announcement = `전방 약 ${currentSensorDistance.toFixed(1)}미터 부근에 ${clsKor}이(가) 있습니다.`;
                    if (currentSensorDistance < 1.0) {
                        announcement = `매우 가까이 ${clsKor}! ${currentSensorDistance.toFixed(1)}미터 앞입니다.`;
                        // triggerVibration("long_strong");
                    } else if (currentSensorDistance < 2.0) {
                        // triggerVibration("medium");
                    }
                } else {
                    announcement = `${clsKor}이(가) 감지되었습니다.`;
                }

                console.log("🗣️ 안내:", announcement);
                setDetectedInfo(announcement);
                // speak(announcement);
                setLastAnnouncedObject({ name: primaryObject.name, time: now });
            } else {
                const clsKor = translateClass(primaryObject.name);
                setDetectedInfo(`${clsKor} (최근 안내됨)`);
                console.log(`쿨다운: ${clsKor}`);
            }
        } else {
            setDetectedInfo("주변에 안내할 만한 주요 객체가 없습니다. (선정 실패)");
        }
    };

    // 라즈베리파이에 명령 보내는 함수
    const sendCommandToRPi = (command) => {
        // clientSocketRef.current가 존재하고, _destroyed가 false이며, _readyState가 "open"인지 확인
        if (clientSocketRef.current &&
            clientSocketRef.current._destroyed === false &&
            clientSocketRef.current._readyState === "open") {
            try {
                console.log(`📲 라즈베리파이로 명령 전송 시도: ${command}`);
                // write 메소드 직접 호출
                clientSocketRef.current.write(`${command}\n`);
                // react-native-tcp-socket의 write는 보통 예외를 발생시키거나,
                // 네이티브 모듈 레벨에서 처리될 것으로 예상됨.
                // 반환값을 확인하는 것보다 예외 처리에 집중하는 것이 나을 수 있음.
                console.log("✅ socket.write() 호출 완료 (또는 예외 없음).");
            } catch (error) {
                console.error("🚨 socket.write() 중 오류 발생:", error, "명령:", command);
            }
        } else {
            console.warn("⚠️ 라즈베리파이 소켓이 준비되지 않았거나 파괴됨. 명령 전송 실패:", command);
            if (clientSocketRef.current) {
                console.log(`   소켓 상태: _destroyed=${clientSocketRef.current._destroyed}, _readyState=${clientSocketRef.current._readyState}`);
            } else {
                console.log("   소켓 참조가 없습니다.");
            }
        }
    };

    useEffect(() => {
        // 앱 상태 변경 감지 (백그라운드/포그라운드 전환)
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                console.log('앱이 포그라운드로 돌아왔습니다. 감지 재시작 요청.');
                // 필요하다면 여기서 다시 감지 시작 명령 전송
                if (isConnectedToRPi) {
                    sendCommandToRPi("START_DETECTION");
                }
            } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
                console.log('앱이 백그라운드로 전환됩니다. 감지 중지 요청.');
                // 앱이 백그라운드로 갈 때 감지 중지 명령 전송
                sendCommandToRPi("STOP_DETECTION");
            }
            appState.current = nextAppState;
        });


        console.log("TCP 서버 생성 시도 (앱 측)...");
        const server = TcpSocket.createServer((socket) => {
            console.log("📥 라즈베리파이 연결됨 (클라이언트 소켓 저장)");
            setDetectedInfo("라즈베리파이 연결됨. 감지 시작 요청 중...");
            setIsConnectedToRPi(true);
            clientSocketRef.current = socket; // ref에 할당

            // 소켓 상태가 안정화될 시간을 주기 위해 짧은 지연 후 명령 전송
            setTimeout(() => {
                console.log("setTimeout 내부에서 sendCommandToRPi 호출 시도");
                if (clientSocketRef.current) { // 로그 추가
                    console.log(`   소켓 상태 확인: _destroyed=${clientSocketRef.current._destroyed}, _readyState=${clientSocketRef.current._readyState}`);
                }
                sendCommandToRPi("START_DETECTION");
            }, 200);

            socket.on("data", (data) => {
                const message = data.toString().trim();
                console.log("📦 받은 데이터:", message);
                const sentence = parseToSentence(message);
                console.log("🗣️ 안내 문장:", sentence);
                setDetectedInfo(sentence);
            });

            socket.on("close", (hadError) => {
                console.log(`❌ 라즈베리파이 연결 종료됨. 오류 발생 여부: ${hadError}`);
                setDetectedInfo("라즈베리파이 연결 끊김.");
                setIsConnectedToRPi(false);
                clientSocketRef.current = null;
            });

            socket.on("error", (error) => {
                console.error("🚨 소켓 오류:", error);
                setDetectedInfo(`오류: ${error.message}`);
                setIsConnectedToRPi(false);
            });
        });

        server.listen({ port: APP_SERVER_PORT, host: "0.0.0.0" }, () => {
            console.log(`✅ TCP 서버 시작됨 (앱). 포트: ${APP_SERVER_PORT}`);
            setDetectedInfo(`앱 서버 시작됨. 포트 ${APP_SERVER_PORT}에서 라즈베리파이 연결 대기 중...`);
        });
        serverRef.current = server;

        return () => {
            console.log("페이지 벗어남. 감지 중지 명령 전송 및 서버 종료.");
            subscription.remove(); // AppState 리스너 제거
            sendCommandToRPi("STOP_DETECTION"); // 감지 중지 명령
            if (clientSocketRef.current) {
                clientSocketRef.current.destroy(); // 현재 연결된 클라이언트 소켓 즉시 닫기
                clientSocketRef.current = null;
            }
            if (serverRef.current) {
                serverRef.current.close(() => {
                    console.log("앱 TCP 서버 완전히 종료됨.");
                });
                serverRef.current = null;
            }
            setIsConnectedToRPi(false);
        };
    }, []); // 빈 배열: 컴포넌트 마운트/언마운트 시에만 실행

    return (
        <View style={styles.container}>
            <Text style={styles.title}>길 안내 중입니다</Text>
            <Text style={styles.subtitle}>
                {isConnectedToRPi ? "라즈베리파이와 연결됨" : "라즈베리파이 연결 대기 중..."}
            </Text>
            <Text style={[styles.infoText, !isConnectedToRPi && styles.disconnectedText]}>
                {detectedInfo}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    // ... (이전 스타일과 거의 동일)
    container: {
        flex: 1,
        backgroundColor: "#111",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    title: {
        fontSize: 28,
        color: "#fff",
        fontWeight: "bold",
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        color: "#ccc",
        textAlign: "center",
        marginBottom: 20,
    },
    infoText: {
        fontSize: 18,
        color: "#fff",
        textAlign: "center",
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 5,
        minHeight: 100, // 최소 높이 지정
    },
    disconnectedText: {
        color: '#ffdddd', // 연결 끊겼을 때 텍스트 색상
    }
});