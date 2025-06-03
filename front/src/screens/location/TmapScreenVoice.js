import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, NativeModules } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
const { TmapModule } = NativeModules;

const TmapScreenVoice = () => {
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);

    useEffect(() => {
        // 위치 정보를 가져옵니다.
        Geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                setLatitude(latitude);
                setLongitude(longitude);

                // 경로 안내 시작 (startNavigation 호출)
                if (latitude && longitude) {
                    TmapModule.startNavigation(latitude, longitude, 37.5700, 126.9850) // 예시로 목적지 경도, 위도 설정
                        .then(response => console.log(response))
                        .catch(error => console.log(error));
                }
            },
            error => {
                console.log('Error getting location', error);
            },
            { enableHighAccuracy: true }
        );
    }, []);

    return (
        <View style={styles.container}>
            {latitude && longitude ? (
                <Text>Current Location: {latitude}, {longitude}</Text>
            ) : (
                <View style={styles.loading}>
                    <Text>Loading...</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default TmapScreenVoice;
