import React, { useEffect, useRef, useState } from "react";
import { View, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { WebView } from "react-native-webview";
import Geolocation from "@react-native-community/geolocation";
import api from '../../api/api';

const KakaoMapScreen = () => {
    const webViewRef = useRef(null);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [destination, setDestination] = useState("");
    const [loading, setLoading] = useState(true);

    // 현재 위치 가져오기
    useEffect(() => {
        Geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                setLatitude(lat);
                setLongitude(lon);
                setLoading(false);

                // WebView에 현재 위치 전달
                setTimeout(() => {
                    if (webViewRef.current) {
                        webViewRef.current.postMessage(
                            JSON.stringify({ type: "CURRENT_LOCATION", latitude: lat, longitude: lon })
                        );
                    }
                }, 1000);
            },
            (error) => {
                console.log("위치 정보를 가져올 수 없음:", error);
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    }, []);

    // 목적지 검색 및 WebView에 전달
    const fetchDestinations = async () => {
        if (!destination.trim()) {
            Alert.alert("🚨 목적지를 입력하세요!");
            return;
        }
        try {
            const response = await api.get(`/directions`, {
                params: {
                    startLat: latitude,
                    startLng: longitude,
                    destinationName: destination,
                }
            });

            if (response.data && Array.isArray(response.data.path)) {
                if (webViewRef.current) {
                    webViewRef.current.postMessage(
                        JSON.stringify({
                            type: "DRAW_ROUTE",
                            path: response.data.path
                        })
                    );
                }
            } else {
                Alert.alert("❌ 경로를 불러올 수 없습니다.");
            }
        } catch (error) {
            console.error("❌ 경로 요청 실패:", error);
            Alert.alert("❌ 오류", "경로 데이터를 불러올 수 없습니다.");
        }
    };

    const kakaoMapHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Tmap 지도</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://apis.openapi.sk.com/tmap/jsv2?version=1&appKey=N58gCr0OpV7gn4udSAHyC3PZyY2HC7Jt8e4LQ5WB"></script>
    <style>
      html, body, #map {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      const map = new Tmapv2.Map("map", {
        center: new Tmapv2.LatLng(37.5665, 126.9780),
        width: "100%",
        height: "100%",
        zoom: 15
      });
    </script>
  </body>
</html>`;

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="목적지를 입력하세요"
                    value={destination}
                    onChangeText={setDestination}
                />
                <Button title="경로 찾기" onPress={fetchDestinations} />
            </View>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <WebView
                    ref={webViewRef}
                    originWhitelist={["*"]}
                    source={{ html: kakaoMapHtml }}
                    javaScriptEnabled
                    domStorageEnabled
                    style={styles.webview}
                    onMessage={(event) => {
                        console.log("📩 WebView에서 받은 메시지:", event.nativeEvent.data);
                    }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    inputContainer: { flexDirection: "row", padding: 10 },
    input: { flex: 1, borderWidth: 1, borderColor: "#ccc", padding: 8 },
    webview: { flex: 1 }
});

export default KakaoMapScreen;