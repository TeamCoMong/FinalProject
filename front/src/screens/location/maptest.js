import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, AppState } from "react-native";
import TcpSocket from "react-native-tcp-socket";

const APP_SERVER_PORT = 5000;

export default function GuidePage() {
    const serverRef = useRef(null);
    const clientSocketRef = useRef(null);
    const [objectInfo, setObjectInfo] = useState(null);
    const [distanceInfo, setDistanceInfo] = useState(null);
    const [isConnectedToRPi, setIsConnectedToRPi] = useState(false);
    const appState = useRef(AppState.currentState);

    const translateClass = (cls) => {
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
        return dict[cls.toLowerCase()] || cls;
    };

    const parseAndUpdateSentences = (raw) => {
        try {
            const items = raw.trim().split(',');
            if (items.length === 0 || raw.trim() === "") return;

            if (raw.trim().toUpperCase() === "NO_OBJECT") {
                setObjectInfo("주변에 감지된 객체가 없습니다.");
                return;
            }

            items.forEach(item => {
                const [cls, confStr] = item.split(':');
                if (!cls || !confStr) return;

                if (cls.trim().toLowerCase() === "distance") {
                    const cm = parseFloat(confStr);
                    if (!isNaN(cm)) {
                        setDistanceInfo(`장애물까지의 거리는 약 ${Math.round(cm)}cm입니다.`);
                    }
                } else {
                    const clsKor = translateClass(cls.trim());
                    const conf = parseFloat(confStr);
                    if (!isNaN(conf)) {
                        const percent = Math.round(conf * 100);
                        setObjectInfo(`${clsKor}이(가) ${percent}% 확률로 감지되었습니다.`);
                    }
                }
            });
        } catch (e) {
            console.error("📛 메시지 파싱 오류:", e);
        }
    };

    const sendCommandToRPi = (command) => {
        const socket = clientSocketRef.current;
        if (socket && !socket._destroyed && socket._readyState === "open") {
            try {
                socket.write(`${command}\n`);
                console.log(`📲 명령 전송됨: ${command}`);
            } catch (e) {
                console.error("🚨 명령 전송 실패:", e);
            }
        }
    };

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                if (isConnectedToRPi) sendCommandToRPi("START_DETECTION");
            } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
                sendCommandToRPi("STOP_DETECTION");
            }
            appState.current = nextAppState;
        });

        const server = TcpSocket.createServer((socket) => {
            console.log("📥 라즈베리파이 연결됨");
            clientSocketRef.current = socket;
            setIsConnectedToRPi(true);
            setObjectInfo(null);
            setDistanceInfo(null);

            setTimeout(() => sendCommandToRPi("START_DETECTION"), 300);

            socket.on("data", (data) => {
                const msg = data.toString().trim();
                console.log("📦 받은 데이터:", msg);
                parseAndUpdateSentences(msg);
            });

            socket.on("close", () => {
                setIsConnectedToRPi(false);
                clientSocketRef.current = null;
                setObjectInfo("라즈베리파이 연결 끊김.");
                setDistanceInfo(null);
            });

            socket.on("error", (err) => {
                console.error("🚨 소켓 오류:", err);
            });
        });

        server.listen({ port: APP_SERVER_PORT, host: "0.0.0.0" }, () => {
            console.log(`✅ 앱 TCP 서버 실행 중 (포트: ${APP_SERVER_PORT})`);
        });
        serverRef.current = server;

        return () => {
            subscription.remove();
            sendCommandToRPi("STOP_DETECTION");
            if (clientSocketRef.current) {
                clientSocketRef.current.destroy();
                clientSocketRef.current = null;
            }
            if (serverRef.current) {
                serverRef.current.close();
                serverRef.current = null;
            }
            setIsConnectedToRPi(false);
        };
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>길 안내 중입니다</Text>
            <Text style={styles.subtitle}>
                {isConnectedToRPi ? "라즈베리파이와 연결됨" : "라즈베리파이 연결 대기 중..."}
            </Text>
            <Text style={[styles.infoText, !isConnectedToRPi && styles.disconnectedText]}>
                {(objectInfo || "객체 감지 정보 없음.") + "\n\n" + (distanceInfo || "거리 정보 없음.")}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
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
        minHeight: 120,
    },
    disconnectedText: {
        color: '#ffdddd',
    }
});
