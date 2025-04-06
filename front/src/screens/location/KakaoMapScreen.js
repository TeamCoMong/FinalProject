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
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=e84461afa8078822e18c5b6af6752df6&libraries=services"></script>
            <style>
                * { margin: 0; padding: 0; }
                html, body { width: 100%; height: 100%; overflow: hidden; }
                #map { width: 100%; height: 100%; }
                #info { position: absolute; top: 10px; left: 10px; background: white; padding: 5px; z-index: 100; }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <div id="info">거리: -, 예상 소요 시간: -</div>
            <script>
                var map;
                var marker = new kakao.maps.Marker();
                var destMarker = new kakao.maps.Marker();
                var polyline = new kakao.maps.Polyline({
                    strokeWeight: 5,
                    strokeColor: "#FF0000",
                    strokeOpacity: 0.7,
                    strokeStyle: "solid"
                });

                function initMap() {
                    var mapContainer = document.getElementById('map');
                    var mapOption = { center: new kakao.maps.LatLng(37.5665, 126.9780), level: 3 };
                    map = new kakao.maps.Map(mapContainer, mapOption);
                    marker.setMap(map);
                    destMarker.setMap(map);
                }
                initMap();
                
                document.addEventListener("message", function(event) {
                    var data = JSON.parse(event.data);
                
                    if (data.type === "CURRENT_LOCATION") {
                        var currentPosition = new kakao.maps.LatLng(data.latitude, data.longitude);
                        marker.setPosition(currentPosition);
                        map.setCenter(currentPosition);
                    }
                
                    if (data.type === "DRAW_ROUTE") {
                        drawRoute(data.path);
                    }
                });
                
                function drawRoute(pathArray) {
                    if (!Array.isArray(pathArray)) return;
                
                    var path = pathArray.map(coord => new kakao.maps.LatLng(coord[0], coord[1]));
                    
                    polyline.setPath(path);
                    polyline.setMap(map);
                
                    var distance = Math.round(polyline.getLength() / 1000);
                    var estimatedTime = Math.round((distance / 50) * 60); // 평균 50km/h
                    document.getElementById('info').innerText =
                        "거리: " + distance + " km, 예상 소요 시간: " + estimatedTime + " 분";
                
                    map.setCenter(path[path.length - 1]);
                }
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


















