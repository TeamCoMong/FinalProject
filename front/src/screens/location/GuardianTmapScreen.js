import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';

const GuardianTmapScreen = () => {
    const webViewRef = useRef(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const ws = new WebSocket('ws://10.0.2.2:8080/location'); // IP는 서버 환경에 맞게 수정

        ws.onopen = () => {
            console.log('✅ Guardian WebSocket 연결됨');
        };

        ws.onmessage = (e) => {
            const data = JSON.parse(e.data);
            if (data.type === 'LOCATION') {
                if (webViewRef.current) {
                    webViewRef.current.postMessage(
                        JSON.stringify({
                            type: 'UPDATE_USER_LOCATION',
                            latitude: data.latitude,
                            longitude: data.longitude
                        })
                    );
                }
            }
        };

        ws.onerror = (e) => {
            console.error('❌ WebSocket 오류:', e.message);
            Alert.alert('WebSocket 오류', e.message);
        };

        ws.onclose = () => {
            console.log('🛑 WebSocket 종료됨');
        };

        return () => ws.close();
    }, []);

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <script src="https://apis.openapi.sk.com/tmap/jsv2?version=1&appKey=N58gCr0OpV7gn4udSAHyC3PZyY2HC7Jt8e4LQ5WB"></script>
            <style>html, body, #map_div { margin:0; padding:0; height:100%; }</style>
        </head>
        <body>
            <div id="map_div"></div>
            <script>
                let map, userMarker;

                function initTmap() {
                    map = new Tmapv2.Map("map_div", {
                        center: new Tmapv2.LatLng(37.5665, 126.9780),
                        width: "100%",
                        height: "100%",
                        zoom: 17
                    });
                }

                function updateUserMarker(lat, lng) {
                    const pos = new Tmapv2.LatLng(lat, lng);
                    if (!userMarker) {
                        userMarker = new Tmapv2.Marker({
                            position: pos,
                            label: "User",
                            map: map
                        });
                    } else {
                        userMarker.setPosition(pos);
                    }
                    map.setCenter(pos);
                }

                document.addEventListener("DOMContentLoaded", () => {
                    initTmap();
                    document.addEventListener("message", (event) => {
                        const data = JSON.parse(event.data);
                        if (data.type === 'UPDATE_USER_LOCATION') {
                            updateUserMarker(data.latitude, data.longitude);
                        }
                    });
                });
            </script>
        </body>
        </html>
    `;

    return (
        <View style={styles.container}>
            {loading && <ActivityIndicator size="large" color="blue" />}
            <WebView
                ref={webViewRef}
                source={{ html }}
                originWhitelist={['*']}
                javaScriptEnabled
                onLoadEnd={() => setLoading(false)}
                style={styles.webview}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    webview: {
        flex: 1
    }
});

export default GuardianTmapScreen;
