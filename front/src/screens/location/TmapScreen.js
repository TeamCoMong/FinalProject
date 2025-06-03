import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import Geolocation from '@react-native-community/geolocation';

const TmapScreen = () => {
    const webViewRef = useRef(null);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [destination, setDestination] = useState('');
    const [loading, setLoading] = useState(true);

    const TMAP_API_KEY = 'N58gCr0OpV7gn4udSAHyC3PZyY2HC7Jt8e4LQ5WB';

    useEffect(() => {
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLatitude(latitude);
                setLongitude(longitude);
                setLoading(false);

                // WebView에 위치 정보 전달
                if (webViewRef.current) {
                    webViewRef.current.postMessage(
                        JSON.stringify({
                            type: 'CURRENT_LOCATION',
                            latitude,
                            longitude
                        })
                    );
                }
            },
            (error) => {
                console.log('위치 정보를 가져올 수 없음:', error);
                setLoading(false);
                Alert.alert('🚨 위치 정보 오류', '위치 정보를 가져올 수 없습니다.');
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    }, []);

    const geocodeDestination = async (keyword) => {
        try {
            const res = await fetch(
                `https://apis.openapi.sk.com/tmap/pois?version=1&format=json&searchKeyword=${encodeURIComponent(keyword)}&resCoordType=WGS84GEO&reqCoordType=WGS84GEO&count=1&appKey=N58gCr0OpV7gn4udSAHyC3PZyY2HC7Jt8e4LQ5WB`
            );
            const json = await res.json();
            if (json.searchPoiInfo?.pois?.poi?.length > 0) {
                const poi = json.searchPoiInfo.pois.poi[0];
                return { lat: poi.frontLat, lon: poi.frontLon };
            } else {
                throw new Error('목적지를 찾을 수 없습니다.');
            }
        } catch (error) {
            console.error(error);
            throw new Error('목적지 검색 중 오류가 발생했습니다.');
        }
    };

    const fetchRoute = async () => {
        if (!destination.trim()) {
            Alert.alert('🚨 목적지를 입력하세요!');
            return;
        }

        try {
            const dest = await geocodeDestination(destination);

            // 출발지와 목적지 좌표 확인
            if (!latitude || !longitude || !dest.lat || !dest.lon) {
                throw new Error('출발지 또는 목적지 좌표가 잘못되었습니다.');
            }

            console.log('출발지:', { latitude, longitude });
            console.log('목적지:', dest);

            // Tmap API에 전달할 파라미터 준비
            const requestBody = {
                startX: longitude.toString(),  // 출발지 경도 (숫자로 변환)
                startY: latitude.toString(),   // 출발지 위도 (숫자로 변환)
                endX: parseFloat(dest.lon).toString(),  // 목적지 경도 (숫자로 변환)
                endY: parseFloat(dest.lat).toString(),  // 목적지 위도 (숫자로 변환)
                reqCoordType: 'WGS84GEO',      // 요청 좌표 타입
                resCoordType: 'WGS84GEO',      // 응답 좌표 타입 (EPSG3857)
                startName: '출발지',           // 출발지 이름 추가
                endName: '도착지'              // 목적지 이름 추가
            };

            console.log('Tmap 요청 파라미터:', requestBody);  // 전달될 파라미터 확인

            const response = await fetch(
                'https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        appKey: TMAP_API_KEY
                    },
                    body: JSON.stringify(requestBody)
                }
            );

            const responseText = await response.text();
            if (!responseText) {
                throw new Error('API 응답이 비어 있습니다.');
            }

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (error) {
                throw new Error('응답을 JSON으로 파싱할 수 없습니다.');
            }

            // 응답 데이터 로그 출력
            console.log('API 응답 데이터:', data);

            // 응답 데이터 구조 확인
            if (!data.features || data.features.length === 0) {
                throw new Error('경로 데이터를 찾을 수 없습니다.');
            }

            // 경로를 그릴 수 있는 좌표 정보 추출
            const path = data.features
                .filter((f) => f.geometry && f.geometry.type === 'LineString')
                .flatMap((f) => f.geometry.coordinates)
                .map(([lng, lat]) => ({ lat, lng }));

            console.log('경로 좌표:', path);

            // WebView에 경로를 전달
            if (webViewRef.current) {
                webViewRef.current.postMessage(
                    JSON.stringify({
                        type: 'DRAW_ROUTE',
                        path
                    })
                );
            }
        } catch (error) {
            console.error('API 호출 오류:', error);
            Alert.alert('❌ 오류', error.message || '경로 데이터를 불러올 수 없습니다.');
        }
    };

    const tmapHtml = `
        <!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <script src="https://apis.openapi.sk.com/tmap/jsv2?version=1&appKey=N58gCr0OpV7gn4udSAHyC3PZyY2HC7Jt8e4LQ5WB"></script>
    <style>
        html, body { height: 100%; margin: 0; padding: 0; }
        #map_div { width: 100%; height: 90%; }
        #info { height: 10%; padding: 10px; background: #f9f9f9; font-size: 16px; }
    </style>
</head>
    <body>
    <div id="map_div"></div>
    <div id="info">경로를 불러오는 중...</div>
    <script>
        let map, routeLine, startMarker, endMarker;

        function initTmap() {
        map = new Tmapv2.Map("map_div", {
            center: new Tmapv2.LatLng(37.5665, 126.9780),
            width: "100%",
            height: "100%",
            zoom: 16
        });
    }

        function drawRoute(path) {
        if (routeLine) routeLine.setMap(null);
        if (startMarker) startMarker.setMap(null);
        if (endMarker) endMarker.setMap(null);

        const startLatLng = new Tmapv2.LatLng(path[0].lat, path[0].lng);
        const endLatLng = new Tmapv2.LatLng(path[path.length - 1].lat, path[path.length - 1].lng);

        startMarker = new Tmapv2.Marker({
        position: startLatLng,
        icon: "https://topopen.tmap.co.kr/imgs/point_s.png",
        iconSize: new Tmapv2.Size(24, 38),
        map: map
    });

        endMarker = new Tmapv2.Marker({
        position: endLatLng,
        icon: "https://topopen.tmap.co.kr/imgs/point_e.png",
        iconSize: new Tmapv2.Size(24, 38),
        map: map
    });

        const latLngArray = path.map(p => new Tmapv2.LatLng(p.lat, p.lng));
        routeLine = new Tmapv2.Polyline({
        path: latLngArray,
        strokeColor: "#FF0000",
        strokeWeight: 6,
        map: map
    });

        map.setCenter(startLatLng);
    }

        document.addEventListener("DOMContentLoaded", function () {
        initTmap();
        document.addEventListener("message", function (event) {
        const data = JSON.parse(event.data);
        if (data.type === 'DRAW_ROUTE') {
        drawRoute(data.path);
        const infoDiv = document.getElementById("info");
        if (data.info) {
        infoDiv.innerText = "거리: " + data.info.distance + "km, 소요 시간: " + data.info.time + "분";
    }
    }
    });
    });
    </script>
    </body>
</html>
    `;

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="목적지를 입력하세요"
                    value={destination}
                    onChangeText={setDestination}
                />
                <Button title="경로 찾기" onPress={fetchRoute} />
            </View>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <WebView
                    ref={webViewRef}
                    originWhitelist={['*']}
                    source={{ html: tmapHtml }}
                    javaScriptEnabled
                    domStorageEnabled
                    style={styles.webview}
                    onLoadEnd={() => {
                        // 맵 로딩 이후에 현재 위치 전송
                        if (latitude && longitude && webViewRef.current) {
                            webViewRef.current.postMessage(
                                JSON.stringify({
                                    type: 'CURRENT_LOCATION',
                                    latitude,
                                    longitude
                                })
                            );
                        }
                    }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        alignItems: 'center'
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        marginRight: 5
    },
    webview: { flex: 1 }
});

export default TmapScreen;
