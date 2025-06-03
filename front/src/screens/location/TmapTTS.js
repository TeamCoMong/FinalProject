import React, { useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform, View, Text, Button } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import Voice from '@react-native-voice/voice';
import { NativeModules } from 'react-native';

const { TmapModule } = NativeModules;

const TmapTTS = ({ userId }) => {
    const [startPoint, setStartPoint] = useState(null);
    const [endPoint, setEndPoint] = useState(null);
    const ws = useRef(null);

    // 1. 위치 권한 요청 및 GPS 수신
    const requestLocationPermission = async () => {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
    };

    const getCurrentLocation = async () => {
        const granted = await requestLocationPermission();
        if (!granted) return;
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setStartPoint({ lat: latitude, lon: longitude });
                ws.current?.send(
                    JSON.stringify({ userId, lat: latitude, lon: longitude })
                );
            },
            (err) => console.log(err),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    // 2. WebSocket 연결 (위치 공유)
    const setupWebSocket = () => {
        ws.current = new WebSocket('ws://10.0.2.2:8080/location');
        ws.current.onopen = () => console.log('WebSocket connected');
        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.userId !== userId) {
                // 보호자가 위치 수신
                console.log('상대 위치:', data);
            }
        };
        ws.current.onerror = (e) => console.error('WS error', e);
        ws.current.onclose = () => console.log('WS closed');
    };

    // 3. 음성으로 목적지 입력
    const startVoiceRecognition = () => {
        Voice.onSpeechResults = (e) => {
            const keyword = e.value[0];
            fetch(`https://apis.openapi.sk.com/tmap/pois?version=1&searchKeyword=${keyword}&resCoordType=WGS84GEO&reqCoordType=WGS84GEO&searchType=all&appKey=N58gCr0OpV7gn4udSAHyC3PZyY2HC7Jt8e4LQ5WB`)
                .then(res => res.json())
                .then(data => {
                    const poi = data.searchPoiInfo.pois.poi[0];
                    const lat = poi.frontLat;
                    const lon = poi.frontLon;
                    setEndPoint({ lat, lon });
                });
        };
        Voice.start('ko-KR');
    };

    // 4. 길안내 시작 (NativeModule)
    const startNavigation = () => {
        if (startPoint && endPoint) {
            TmapModule.startNavigation(
                startPoint.lat,
                startPoint.lon,
                endPoint.lat,
                endPoint.lon
            );
        }
    };

    // 5. 전체 흐름 컨트롤
    useEffect(() => {
        setupWebSocket();
        getCurrentLocation();
        setTimeout(() => startVoiceRecognition(), 3000); // 3초 후 음성 입력 시작
    }, []);

    useEffect(() => {
        if (endPoint) startNavigation();
    }, [endPoint]);

    return null; // 화면 구성 없음 (시각장애인용)
};

export default TmapTTS;
