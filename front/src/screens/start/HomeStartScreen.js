import React, { useEffect } from 'react';
import {
    View,
    StyleSheet,
    Text,
    NativeModules,
    Image
} from 'react-native';
import { useRoute } from '@react-navigation/native';

const { TMapLauncher } = NativeModules;

const HomeStartScreen = () => {
    const route = useRoute();
    const destination = route.params?.destination;
    console.log('HomeStartScreen에서 받은 destination:', destination);

    // destination param 감지 시 바로 Native로 전달
    useEffect(() => {
        if (destination) {
            console.log(`목적지 param 감지됨: ${destination}`);
            sendDestinationToNative(destination);
        } else {
            console.log('목적지 param 아직 없음. 대기중...');
        }
    }, [destination]);

    const sendDestinationToNative = (destination) => {
        if (TMapLauncher?.setDestination) {
            TMapLauncher.setDestination(destination);
            console.log(`Native로 목적지 전달됨: ${destination}`);

            TMapLauncher.openTMapActivity();
            console.log(`TMapActivity 실행됨`);
        } else {
            console.warn('TMapLauncher 모듈이 없습니다.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>목적지 처리 화면</Text>

            <Image
                source={require('../../assets/finddn.png')}
                style={{ width: 300, height: 300, marginBottom: 20 }}
                resizeMode="contain"
            />




            <Text style={styles.result}>
                {destination
                    ? `목적지: ${destination}\n경로 그리기 진행 중...`
                    : '목적지 대기 중...'}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333333' },
    result: { fontSize: 18, textAlign: 'center',color: '#333333' },
});

export default HomeStartScreen;