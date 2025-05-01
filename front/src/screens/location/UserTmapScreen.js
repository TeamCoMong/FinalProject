import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';

const UserTmapScreen = () => {
    const webViewRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const ws = new WebSocket('ws://10.0.2.2:8080/location'); // 로컬 테스트 시 10.0.2.2

        ws.onopen = () => {
            console.log('✅ User WebSocket 연결됨');
        };

        ws.onmessage = (e) => {
            const data = JSON.parse(e.data);
            if (data.type === 'LOCATION') {
                if (webViewRef.current) {
                    webViewRef.current.postMessage(
                        JSON.stringify({
                            type: 'UPDATE_LOCATION',
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
            console.log('🛑 WebSocket 연결 종료됨');
        };

        setSocket(ws);
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
                let map, marker;

                function initTmap() {
                    map = new Tmapv2.Map("map_div", {
                        center: new Tmapv2.LatLng(37.5665, 126.9780),
                        width: "100%",
                        height: "100%",
                        zoom: 17
                    });
                }

                function updateMarker(lat, lng) {
                    const position = new Tmapv2.LatLng(lat, lng);
                    if (!marker) {
                        marker = new Tmapv2.Marker({
                            position,
                            map
                        });
                    } else {
                        marker.setPosition(position);
                    }
                    map.setCenter(position);
                }

                document.addEventListener("DOMContentLoaded", () => {
                    initTmap();
                    document.addEventListener("message", function (event) {
                        const data = JSON.parse(event.data);
                        if (data.type === 'UPDATE_LOCATION') {
                            updateMarker(data.latitude, data.longitude);
                        }
                    });
                });
            </script>
        </body>
        </html>
    `;

    return (
        <View style={{ flex: 1 }}>
            {loading ? (
                <ActivityIndicator size="large" color="blue" />
            ) : null}
            <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html }}
                javaScriptEnabled
                onLoadEnd={() => setLoading(false)}
                style={styles.webview}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    webview: {
        flex: 1
    }
});

export default UserTmapScreen;