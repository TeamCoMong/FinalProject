import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, AppState } from "react-native"; // AppState 추가
import TcpSocket from "react-native-tcp-socket";
// import Tts from 'react-native-tts'; // TTS 라이브러리 예시 (설치 필요)

// 라즈베리파이 정보 (현재 앱이 서버이므로 이 정보는 직접 사용하지 않음)
// const RASPBERRY_IP = '192.168.0.162';
// const RASPBERRY_PORT = 5000;

const APP_SERVER_PORT = 5000; // 앱이 열 TCP 서버 포트

export default function GuidePage() {
    const serverRef = useRef(null);
    const clientSocketRef = useRef(null); // 연결된 클라이언트(라즈베리파이) 소켓 저장
    const [detectedInfo, setDetectedInfo] = useState("객체 감지 대기 중...");
    const [isConnectedToRPi, setIsConnectedToRPi] = useState(false);
    const appState = useRef(AppState.currentState); // 앱 상태 추적

    // --- TTS 초기화 및 설정 (라이브러리 사용 시) ---
    // useEffect(() => {
    //     Tts.setDefaultLanguage('ko-KR');
    //     // Tts.addEventListener('tts-start', (event) => console.log("start", event));
    //     // Tts.addEventListener('tts-finish', (event) => console.log("finish", event));
    //     // Tts.addEventListener('tts-cancel', (event) => console.log("cancel", event));
    //     return () => {
    //         // Tts.stop(); // 컴포넌트 언마운트 시 TTS 중지
    //     };
    // }, []);

    // const speak = (message) => {
    //     Tts.stop(); // 이전 안내 중지
    //     Tts.speak(message);
    // };
    // --- TTS 설정 끝 ---


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

    // 클래스명을 한국어로 번역 (휠체어 트럭 나무 유모차 스쿠터 기둥 사람 오도방구 소화전 자동차 버스 볼라드 자전거)
    const translateClass = (cls) => {
        // ... (이전 코드와 동일)
        const dict = {
            wheelchair: "휠체어", truck: "트럭", tree_trunk: "나무",
            traffic_sign: "교통 표지판", traffic_light: "신호등", table: "탁자",
            stroller: "유모차", stop: "정지 표시", scooter: "스쿠터",
            potted_plant: "화분", pole: "기둥", person: "사람",
            parking_meter: "주차 미터기", movable_signage: "이동식 표지판",
            motorcycle: "오토바이", kiosk: "키오스크", fire_hydrant: "소화전",
            dog: "강아지", chair: "의자", cat: "고양이",
            carrier: "이동장", car: "자동차", bus: "버스",
            bollard: "볼라드", bicycle: "자전거", bench: "벤치",
            barricade: "차단봉",
        };
        return dict[cls.toLowerCase()] || cls; // 소문자로 비교
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