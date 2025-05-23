import React, { useEffect, useState, useRef } from 'react';
import { View, Text, PermissionsAndroid, NativeModules, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import Voice from '@react-native-voice/voice';
import TmapView from '../../components/TmapNativeView';

const { TmapModule } = NativeModules;
const WEBSOCKET_URL = 'ws://10.0.2.2:8080/location/user';

const UserTmapScreen = ({ userId = 'user1' }) => {
    const [startPoint, setStartPoint] = useState(null);
    const [endPoint, setEndPoint] = useState(null);
    const [mapReady, setMapReady] = useState(false);
    const [renderMap, setRenderMap] = useState(false);

    const socketRef = useRef(null);
    const watchIdRef = useRef(null);

    const requestPermissions = async () => {
        try {
            const locationGranted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
            const audioGranted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
            return locationGranted === PermissionsAndroid.RESULTS.GRANTED &&
                audioGranted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (error) {
            console.error('❌ 권한 요청 중 에러:', error);
            return false;
        }
    };

    const initWebSocket = () => {
        const ws = new WebSocket(WEBSOCKET_URL);
        ws.onopen = () => console.log('✅ WebSocket 연결됨');
        ws.onerror = e => console.error('❌ WebSocket 에러:', e.message);
        ws.onclose = () => console.log('🔌 WebSocket 종료됨');
        socketRef.current = ws;
    };

    const startLocationTracking = () => {
        watchIdRef.current = Geolocation.watchPosition(
            ({ coords }) => {
                const { latitude, longitude } = coords;
                const point = { lat: latitude, lon: longitude };
                setStartPoint(point);

                if (socketRef.current?.readyState === WebSocket.OPEN) {
                    socketRef.current.send(JSON.stringify({ userId, lat: latitude, lon: longitude }));
                }
            },
            err => console.error('📡 위치 추적 에러:', err),
            { enableHighAccuracy: true, distanceFilter: 5 }
        );
    };

    const fetchDestinationFromVoice = async (keyword) => {
        try {
            const res = await fetch(`https://apis.openapi.sk.com/tmap/pois?version=1&searchKeyword=${keyword}&resCoordType=WGS84GEO&reqCoordType=WGS84GEO&searchType=all&appKey=N58gCr0OpV7gn4udSAHyC3PZyY2HC7Jt8e4LQ5WB`);
            const data = await res.json();
            const poi = data?.searchPoiInfo?.pois?.poi?.[0];

            if (poi) {
                setEndPoint({
                    lat: parseFloat(poi.frontLat),
                    lon: parseFloat(poi.frontLon),
                });
            } else {
                console.warn('❗ 목적지를 찾을 수 없습니다.');
            }
        } catch (error) {
            console.error('🌐 목적지 요청 에러:', error);
        }
    };

    const startVoiceRecognition = () => {
        try {
            Voice.start('ko-KR');
        } catch (error) {
            console.error('❌ 음성 인식 시작 실패:', error);
        }
    };

    useEffect(() => {
        const setup = async () => {
            const granted = await requestPermissions();
            if (!granted) {
                Alert.alert('권한 거부', '위치 및 마이크 권한이 필요합니다.');
                return;
            }

            initWebSocket();
            startLocationTracking();
            setTimeout(() => startVoiceRecognition(), 300);
        };

        Voice.onSpeechResults = e => {
            const keyword = e.value?.[0];
            if (keyword) fetchDestinationFromVoice(keyword);
        };

        Voice.onSpeechError = e => console.error('🚫 음성 인식 에러:', e);
        Voice.onSpeechStart = () => console.log('🎧 음성 인식 시작됨');

        setup();

        return () => {
            Voice.destroy().then(Voice.removeAllListeners);
            if (watchIdRef.current !== null) Geolocation.clearWatch(watchIdRef.current);
            if (socketRef.current) socketRef.current.close();
        };
    }, []);

    useEffect(() => {
        if (!mapReady) return;

        if (startPoint) {
            setTimeout(() => {
                TmapModule.addMarker('현재 위치', startPoint.lat, startPoint.lon);
            }, 200);
        }

        if (endPoint) {
            setTimeout(() => {
                TmapModule.addMarker('목적지', endPoint.lat, endPoint.lon);
            }, 200);
        }
    }, [mapReady, startPoint, endPoint]);

    useEffect(() => {
        if (mapReady && startPoint && endPoint) {
            setTimeout(() => {
                TmapModule.setRoute(startPoint.lat, startPoint.lon, endPoint.lat, endPoint.lon);
                TmapModule.startNavigation(startPoint.lat, startPoint.lon, endPoint.lat, endPoint.lon);
            }, 300);
        }
    }, [mapReady, endPoint]);

    return (
        <View
            style={{ flex: 1 }}
            onLayout={() => {
                console.log('📐 Layout 완료 → 지도 렌더링 시작');
                setTimeout(() => setRenderMap(true), 100);
            }}
        >
            <Text>
                현재 위치:{' '}
                {startPoint ? `${startPoint.lat.toFixed(6)}, ${startPoint.lon.toFixed(6)}` : '로딩 중...'}
            </Text>

            {renderMap && (
                <TmapView
                    style={{ flex: 1, minHeight: 300 }}
                    onMapReady={() => {
                        NativeModules.TmapModule.initializeMap();
                        console.log('🗺️ 지도 로딩 완료');
                        setMapReady(true);
                    }}
                    onMapError={(error) => {
                        console.error('🗺️ 지도 로딩 실패:', error);
                        Alert.alert('지도 로딩 실패', `에러: ${error.message}`);
                    }}
                />
            )}
        </View>
    );
};

export default UserTmapScreen;
