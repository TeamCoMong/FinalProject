import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Alert,
    PermissionsAndroid,
    Platform,
    ActivityIndicator,
    Text
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { WebView } from 'react-native-webview';

const HomeStartScreen = () => {
    const [locationCoords, setLocationCoords] = useState(null);

    // Android 위치 권한 요청
    const requestLocationPermission = async () => {
        console.log('📍 위치 권한 요청 시작');
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: '위치 권한 요청',
                    message: '앱에서 현재 위치를 사용하려면 위치 권한이 필요합니다.',
                    buttonNeutral: '나중에 묻기',
                    buttonNegative: '취소',
                    buttonPositive: '허용',
                }
            );
            console.log('🔐 권한 요청 결과:', granted);
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn('❌ 권한 요청 중 에러:', err);
            return false;
        }
    };

    useEffect(() => {
        console.log('🌀 useEffect 시작');
        const getLocation = async () => {
            const hasPermission = await requestLocationPermission();
            if (!hasPermission) {
                Alert.alert('위치 권한 거부됨', '현재 위치를 가져올 수 없습니다.');
                return;
            }

            Geolocation.getCurrentPosition(
                position => {
                    console.log('✅ 위치 정보 가져옴:', position);



                    const { latitude, longitude } = position.coords;
                    setLocationCoords({ latitude, longitude });
                },
                error => {
                    console.warn('❌ 위치 정보 에러:', error);
                    Alert.alert('위치 오류', '현재 위치를 가져올 수 없습니다.');
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 10000,
                }
            );
        };

        getLocation();
    }, []);

    // Tmap HTML 생성
    const getMapHtml = (lat, lon) => {
        return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>T map 예제</title>
        <style>
          html, body { height: 100%; margin: 0; padding: 0; }
          #map_div { width: 100%; height: 90%; }
          h1 {
            margin: 0;
            padding: 10px;
            background-color: #f2f2f2;
            text-align: center;
            font-family: Arial, sans-serif;
          }
        </style>
        <script src="https://apis.openapi.sk.com/tmap/js?version=1&appKey=2AfJLYy4Roajsr0IORYof7BzkNDbphv8axCMrOFv"></script>
      </head>
      <body>
        <h1>T map 예제</h1>
        <div id="map_div"></div>
        <script>
          var map = new Tmapv2.Map("map_div", {
            center: new Tmapv2.LatLng(${lat}, ${lon}),
            width: "100%",
            height: "100%",
            zoom: 15
          });

          var marker = new Tmapv2.Marker({
            position: new Tmapv2.LatLng(${lat}, ${lon}),
            map: map
          });
        </script>
      </body>
    </html>
    `;
    };

    return (
        <View style={styles.container}>
            <View style={styles.mapFrame}>
                {locationCoords ? (
                    <WebView
                        originWhitelist={['*']}
                        source={{ html: getMapHtml(locationCoords.latitude, locationCoords.longitude) }}
                        javaScriptEnabled={true}
                        style={{ flex: 1 }}
                        onError={({ nativeEvent }) => {
                            console.warn('🚫 WebView error: ', nativeEvent);
                        }}
                        onHttpError={({ nativeEvent }) => {
                            console.warn('🚫 WebView HTTP error: ', nativeEvent.statusCode);
                        }}
                    />
                ) : (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#0000ff" />
                        <Text style={styles.loadingText}>위치 정보를 가져오는 중입니다...</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    mapFrame: {
        width: 350,       // 기존 300 -> 350으로 증가
        height: 450,      // 기존 400 -> 450으로 증가
        borderWidth: 3,
        borderColor: 'red',
        borderRadius: 8,
        overflow: 'hidden',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
});

export default HomeStartScreen;
