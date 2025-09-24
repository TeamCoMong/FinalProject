import React, { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { NativeModules ,DeviceEventEmitter } from 'react-native';
const { TMapLauncher } = NativeModules;
const GuardianHomeScreen = () => {
    const ws = useRef(null);
    const webviewRef = useRef(null);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [address, setAddress] = useState('');

    useEffect(() => {
        ws.current = new WebSocket('ws://192.168.34.30:8080/location/user');

        ws.current.onopen = () => {
            console.log('Connected to WebSocket server');
        };

        ws.current.onmessage = (e) => {
            console.log('Received message:', e.data);
            try {
                const locationData = JSON.parse(e.data);

                console.log('현재 위치:', locationData.lat, locationData.lon);
                setLatitude(locationData.lat);
                setLongitude(locationData.lon);

                // WebView 로 좌표 전송
                if (webviewRef.current && locationData.lat && locationData.lon) {
                    webviewRef.current.postMessage(JSON.stringify({
                        latitude: locationData.lat,
                        longitude: locationData.lon
                    }));
                }

            } catch (err) {
                console.error('JSON parse error:', err);
            }
        };

        ws.current.onerror = (e) => {
            console.error('WebSocket error:', e.message);
        };

        ws.current.onclose = (e) => {
            console.log('WebSocket closed');
        };

        return () => {
            ws.current?.close();
        };
    }, []);

    useEffect(() => {
        console.log('ReverseGeocodeAddress listener mounted → Ready flag 전송');

        // Listener 등록
        const subscription = DeviceEventEmitter.addListener('ReverseGeocodeAddress', (event) => {
            console.log('ReverseGeocodeAddress 수신:', event.address);
        });

        // Ready flag 보내기 (약간 delay 주면 안전함)
        setTimeout(() => {
            if (TMapLauncher?.notifyReverseGeoReady) {
                console.log('TMapLauncher.notifyReverseGeoReady() 존재함 → 호출 시도');
                try {
                    TMapLauncher.notifyReverseGeoReady();
                    console.log('TMapLauncher.notifyReverseGeoReady() 호출 완료');
                } catch (e) {
                    console.log('Native 호출 에러 발생:', e);
                }
            }
        }, 500); // 500ms 정도 delay 주면 Native module attach 문제 거의 없음

        // cleanup
        return () => {
            subscription.remove();
            console.log('📡 ReverseGeocodeAddress listener unmounted');
        };
    }, []);


    // WebView 에 사용할 HTML (document.addEventListener 사용 버전)
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
            let map;
            let marker;
            let mapReady = false;

            function initTmap() {
                map = new Tmapv3.Map("map_div", {
                    center: new Tmapv3.LatLng(37.56520450, 126.98702028),
                    width: "100%",
                    height: "100%",
                    zoom: 16
                });
                mapReady = true;
                console.log("TMap 초기화 완료");
            }

            // React Native 에서 postMessage 로 좌표 받을 때 처리
            document.addEventListener('message', function(event) {
                try {
                    const data = JSON.parse(event.data);
                    console.log("WebView 내부 메시지 수신:", data);

                    if (data.latitude && data.longitude && mapReady && map) {
                        const latLng = new Tmapv3.LatLng(data.latitude, data.longitude);

                        // 기존 마커 삭제
                        if (marker) {
                            marker.setMap(null);
                        }

                        // 새 마커 추가
                        marker = new Tmapv3.Marker({
                            position: latLng,
                            map: map
                        });

                        // 지도 중심 이동
                        map.setCenter(latLng);
                        console.log("마커 업데이트 완료:", latLng);
                    }
                } catch (e) {
                    console.error('메시지 파싱 실패:', e);
                }
            });
        </script>
    </body>
    </html>
    `;

    return (
        <View style={{ flex: 1 }}>
            <WebView
                ref={webviewRef}
                originWhitelist={['*']}
                source={{ html: htmlContent }}
                style={{ flex: 1 }}
                javaScriptEnabled={true}
                injectedJavaScript={`true;`} // 초기화 후 반드시 true; 리턴 필요 (안전성)
            />

            {/*<View style={{ padding: 10 }}>*/}
            {/*    <Text style={{ fontSize: 16 }}>*/}
            {/*        /!*{latitude && longitude*!/*/}
            {/*        /!*    ? `현재 위치 → 위도: ${latitude}, 경도: ${longitude}`*!/*/}
            {/*        /!*    : '아직 위치 수신 없음...'}*!/*/}
            {/*    </Text>*/}

            {/*    <Text style={{ fontSize: 16, marginLeft: 10 }}>*/}
            {/*        /!*{address ? `주소: ${address}` : '주소 수신 대기중...'}*!/*/}
            {/*    </Text>*/}
            {/*</View>*/}
        </View>
    );
};

export default GuardianHomeScreen;
