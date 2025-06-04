import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, DeviceEventEmitter  } from 'react-native';
import { WebView } from 'react-native-webview';

const GuardianHomeScreen = ({ navigation }) => {
    // 상태 변수 선언
    const [currentTime, setCurrentTime] = useState('');  // 현재 시간
    const [currentLocation, setCurrentLocation] = useState('서울, 대한민국'); // 기본 위치 설정
    const [weather, setWeather] = useState('맑음'); // 날씨 예시
    const [date, setDate] = useState('');  // 날짜
    const webviewRef = useRef(null); // WebView에 접근하기 위한 ref

    useEffect(() => {
        const locationListener = DeviceEventEmitter.addListener("LiveLocationUpdate", (data) => {
            console.log("📡 사용자 현재 위치 수신됨:", data);
            const { latitude, longitude } = data;

            // WebView에 좌표 전송 (string으로 serialize)
            if (webviewRef.current) {
                webviewRef.current.postMessage(JSON.stringify({ latitude, longitude }));
            }

            // 예: 현재 위치 텍스트로 표시
            setCurrentLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        });

        return () => locationListener.remove();
    }, []);



    useEffect(() => {
        // navigation.setOptions를 사용하여 탭 아이콘 설정
        navigation.setOptions({
            tabBarIcon: ({ focused, size }) => {
                const iconPath = require('../../assets/schoolboy2.png'); // 탭 아이콘
                return <Image source={iconPath} style={{ width: size, height: size }} />;
            },
            tabBarLabel: '사용자 위치확인', // 탭 라벨 설정
            tabBarActiveTintColor: '#007AFF', // 활성화된 탭 색상
            tabBarInactiveTintColor: '#8E8E93', // 비활성화된 탭 색상
        });

        // 현재 시간과 날짜를 매초마다 업데이트
        const interval = setInterval(() => {
            const now = new Date();

            // 한국 시간 포맷 설정
            const timeFormatter = new Intl.DateTimeFormat('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: 'Asia/Seoul', // 한국 시간대
            });

            // 한국 날짜 포맷 설정
            const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                timeZone: 'Asia/Seoul', // 한국 시간대
            });

            setCurrentTime(timeFormatter.format(now));  // 시간 업데이트
            setDate(dateFormatter.format(now));  // 날짜 업데이트
        }, 1000);

        return () => clearInterval(interval); // 컴포넌트 언마운트 시 interval 해제
    }, [navigation]);

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <title>TMap 지도</title>
        <script src="https://apis.openapi.sk.com/tmap/vectorjs?version=1&appKey=N58gCr0OpV7gn4udSAHyC3PZyY2HC7Jt8e4LQ5WB"></script>
        <style>
            html, body { margin: 0; padding: 0; height: 100%; }
            #map_div { width: 100%; height: 100%; }
        </style>
    </head>
    <body onload="initTmap()">
        <div id="map_div"></div>
        <script>
              function initTmap() {
                window.map = new Tmapv3.Map("map_div", {
                  center: new Tmapv3.LatLng(37.56520450, 126.98702028),
                  width: "100%",
                  height: "100%",
                  zoom: 16
                });
            }
        </script>
    </body>
    </html>
    `;








    return (
        <View style={styles.container}>
            {/* 가장자리에 완전히 붙고, 위쪽은 살짝 내려서 여백을 추가 */}
            <View style={styles.mapContainer}>
                <WebView
                    ref={webviewRef}
                    originWhitelist={['*']}
                    source={{ html: htmlContent }}
                    style={styles.webview}
                    javaScriptEnabled={true}
                    injectedJavaScript={`
                    window.addEventListener('message', function(event) {
                      try {
                        const data = JSON.parse(event.data);
                        if (data.latitude && data.longitude && window.map) {
                          const marker = new Tmapv3.Marker({
                            position: new Tmapv3.LatLng(data.latitude, data.longitude),
                            map: window.map
                          });
                          window.map.setCenter(new Tmapv3.LatLng(data.latitude, data.longitude));
                        }
                      } catch (e) {
                        console.error('📛 메시지 파싱 실패:', e);
                      }
                    });
                    true;
                  `}
                />
            </View>

            {/* 지도 위에 텍스트를 표시할 컨테이너 */}
            <View style={styles.textContainer}>
                {/* 날짜와 위치, 날씨를 두 줄로 나누어 표시 */}
                <View style={styles.row}>
                    <Text style={styles.text}>현재 시각 : {date}</Text>
                    <Text style={styles.text}>현재 위치: {currentLocation}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.text}>현재 시각: {currentTime}</Text>
                    <Image source={require('../../assets/sun.png')} style={styles.logo} />
                    <Text style={styles.text}>날씨: {weather}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fffacd',  // 배경색 설정
        alignItems: 'center',
        justifyContent: 'center',
    },

    // 가장자리에 완전히 붙고, 위쪽은 살짝 내려서 여백을 추가한 스타일
    mapContainer: {
        position: 'absolute', // 화면의 가장자리에 배치
        top: 100, // 상단을 살짝 내리기 (원하는 만큼 조정 가능)
        left: 0, // 왼쪽 끝에 붙이기
        right: 0, // 오른쪽 끝에 붙이기
        bottom: 0, // 아래쪽 끝에 붙이기
        borderWidth: 2, // 파란 테두리 두께
        borderColor: 'blue', // 파란 테두리 색상
    },

    // 지도 위에 텍스트를 배치할 컨테이너 스타일
    textContainer: {
        position: 'absolute',
        top: 10,  // 지도에서 위쪽으로 여백을 설정
        left: 10, // 왼쪽 여백 설정
        right: 10, // 오른쪽 여백 설정
        backgroundColor: 'rgba(255, 255, 255, 0.7)', // 반투명 배경
        padding: 10,
        borderRadius: 10, // 둥근 테두리
        zIndex: 1,  // 지도 위에 텍스트가 올라오도록 설정
    },

    // 두 항목을 가로로 배치하는 스타일
    row: {
        flexDirection: 'row',  // 가로로 배치
        justifyContent: 'space-between',  // 양쪽 끝으로 배치
        marginBottom: 6,  // 아래쪽 간격 설정
    },

    // 텍스트 스타일
    text: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',  // 파란색 텍스트
        marginBottom: 5,
    },

    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#007BFF',
        marginBottom: 30,
    },
    logo: {
        width: 20,  // 이미지의 가로 크기
        height: 20,  // 이미지의 세로 크기
    },
});

export default GuardianHomeScreen;
