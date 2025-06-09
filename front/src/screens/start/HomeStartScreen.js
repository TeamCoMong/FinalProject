import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Alert,
    PermissionsAndroid,
    Platform,
    ActivityIndicator,
    Text,
    TouchableOpacity,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { WebView } from 'react-native-webview';
import EncryptedStorage from 'react-native-encrypted-storage';

const HomeStartScreen = ({ navigation }) => {
    const [locationCoords, setLocationCoords] = useState(null);
    const [userId, setUserId] = useState('');
    const [name, setName] = useState('');
    const [accessToken, setAccessToken] = useState('');

    useEffect(() => {
        const loadUserData = async () => {
            const storedUserId = await EncryptedStorage.getItem('userId');
            const storedName = await EncryptedStorage.getItem('name'); // 선택적
            const storedAccessToken = await EncryptedStorage.getItem('accessToken'); // 선택적
            setUserId(storedUserId || '');
            setName(storedName || '');
            setAccessToken(storedAccessToken || '');
            console.log('📦 사용자 정보 불러옴:', storedUserId, storedName, storedAccessToken);
        };
        loadUserData();
    }, []);

    const requestLocationPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: '위치 권한 요청',
                    message: '앱에서 현재 위치를 사용하려면 권한이 필요합니다.',
                    buttonPositive: '허용',
                    buttonNegative: '취소',
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn('❌ 권한 요청 에러:', err);
            return false;
        }
    };

    useEffect(() => {
        const getLocation = async () => {
            const hasPermission = await requestLocationPermission();
            if (!hasPermission) {
                Alert.alert('위치 권한 거부됨', '현재 위치를 가져올 수 없습니다.');
                return;
            }

            Geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    setLocationCoords({ latitude, longitude });
                },
                error => {
                    console.warn('❌ 위치 에러:', error);
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

    const getMapHtml = (lat, lon) => `
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
              new Tmapv2.Marker({
                position: new Tmapv2.LatLng(${lat}, ${lon}),
                map: map
              });
            </script>
          </body>
        </html>
    `;

    return (
        <View style={styles.container}>
            <View style={styles.mapFrame}>
                {locationCoords ? (
                    <WebView
                        originWhitelist={['*']}
                        source={{ html: getMapHtml(locationCoords.latitude, locationCoords.longitude) }}
                        javaScriptEnabled={true}
                        style={{ flex: 1 }}
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
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingTop: 20,
    },
    mapFrame: {
        width: 350,
        height: 450,
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
    helpButton: {
        marginTop: 30,
        backgroundColor: '#42A5F5',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
        elevation: 3,
    },
    helpButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default HomeStartScreen;
