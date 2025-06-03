import React, { useEffect, useState } from 'react';
import { View, Text, Platform, PermissionsAndroid, requireNativeComponent, NativeModules } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import Voice from '@react-native-voice/voice'; // 음성 인식 모듈


const { TmapModule } = NativeModules;

const TmapTTSP = () => {
    const [startPoint, setStartPoint] = useState(null);
    const [endPoint, setEndPoint] = useState(null);
    const [isReady, setIsReady] = useState(false);

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
        Geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setStartPoint({ lat: latitude, lon: longitude });
                setIsReady(true);
                // 실시간 위치 갱신
                TmapModule.setLocationPoint(longitude, latitude, true);
            },
            (err) => console.log('위치 오류:', err),
            { enableHighAccuracy: true, distanceFilter: 5 }
        );
    };

    const startVoiceRecognition = () => {
        Voice.onSpeechResults = (e) => {
            const keyword = e.value[0];
            console.log('음성 검색어:', keyword);
            fetch(`https://apis.openapi.sk.com/tmap/pois?version=1&searchKeyword=${keyword}&resCoordType=WGS84GEO&reqCoordType=WGS84GEO&searchType=all&appKey=N58gCr0OpV7gn4udSAHyC3PZyY2HC7Jt8e4LQ5WB`)
                .then(res => res.json())
                .then(data => {
                    const poi = data?.searchPoiInfo?.pois?.poi?.[0];
                    if (poi) {
                        const lat = parseFloat(poi.frontLat);
                        const lon = parseFloat(poi.frontLon);
                        setEndPoint({ lat, lon });
                    }
                })
                .catch(console.error);
        };
        Voice.start('ko-KR');
    };

    const startNavigation = () => {
        if (startPoint && endPoint) {
            TmapModule.setRoute(startPoint.lat, startPoint.lon, endPoint.lat, endPoint.lon);
            TmapModule.startNavigation(startPoint.lat, startPoint.lon, endPoint.lat, endPoint.lon);
        }
    };

    useEffect(() => {
        getCurrentLocation();
        setTimeout(() => {
            startVoiceRecognition();
        }, 3000);
    }, []);

    useEffect(() => {
        if (startPoint && endPoint) {
            startNavigation();
        }
    }, [endPoint]);

    return (
        <View style={{ flex: 1 }}>
            <Text style={{ padding: 10, fontSize: 16 }}>
                {startPoint ? `현재 위치: ${startPoint.lat}, ${startPoint.lon}` : '위치 가져오는 중...'}
            </Text>
            <TmapView style={{ flex: 1 }} />
        </View>
    );
};

export default TmapTTSP;
