import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Button,
    StyleSheet,
    PermissionsAndroid,
    Platform,
    Alert, NativeEventEmitter,
} from 'react-native';

import Tts from 'react-native-tts';
import Voice from '@react-native-voice/voice';
import { NativeModules } from 'react-native';

const { TMapLauncher } = NativeModules;

const UserTmapScreen = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [recognizedText, setRecognizedText] = useState('');

    // 1️⃣ TTS 설정 (앱 로드 시 한 번만)
    useEffect(() => {
        Tts.setDefaultLanguage('ko-KR');
        Tts.setDefaultRate(0.5);
        Tts.setDefaultPitch(1.0);
    }, []);


    useEffect(() => {
        Voice.onSpeechStart = onSpeechStart;
        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechError = onSpeechError;

        return () => {
            Voice.destroy().then(Voice.removeAllListeners);
        };
    }, []);

    // 2️⃣ TTS 이벤트 감지 및 음성인식 재시작
    useEffect(() => {
        const eventEmitter = new NativeEventEmitter(NativeModules.TMapLauncher);

        const handlePoiSearchFailed = () => {
            console.warn("❌ 목적지 검색 실패, 음성 재시작");

            setRecognizedText('');
            Tts.stop();
            Tts.speak('다시 목적지를 말씀해 주세요');

            const onTtsFinish = () => {
                startVoiceRecognition();
                Tts.removeEventListener('tts-finish', onTtsFinish);
            };

            Tts.addEventListener('tts-finish', onTtsFinish);
        };

        const subscription = eventEmitter.addListener("PoiSearchFailed", handlePoiSearchFailed);

        return () => {
            subscription.remove();
            Tts.removeAllListeners('tts-finish');
        };
    }, []);




    const onSpeechStart = () => {
        console.log('🎤 음성 인식 시작됨');
    };

    const onSpeechResults = async (event) => {
        const result = event.value[0];
        console.log('🗣️ 인식 결과:', result);
        setRecognizedText(result);

        try {
            await Voice.stop(); // 🔑 먼저 마이크 세션 종료
            console.log("🎙️ 음성 세션 종료됨");

            sendDestinationToNative(result); // 이후 Native로 목적지 전달 및 Activity 실행
        } catch (e) {
            console.error("❌ 음성 종료 중 오류", e);
        }
    };

    const onSpeechError = (error) => {
        const errorCode = error?.error?.code;
        // 5번 오류는 무시 (Client side error)
        if (errorCode === '5/Client side error') return;

        console.error('❌ 심각한 음성 오류:', error);
    };

    const requestPermission = async () => {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                {
                    title: '음성 인식 권한 요청',
                    message: '음성 인식을 위해 마이크 접근 권한이 필요합니다.',
                    buttonNeutral: '나중에',
                    buttonNegative: '취소',
                    buttonPositive: '허용',
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
    };

    const startVoiceRecognition = async () => {
        const hasPermission = await requestPermission();
        if (!hasPermission) {
            Alert.alert('권한 거부됨', '마이크 권한이 필요합니다.');
            return;
        }

        try {
            setIsRecording(true);
            await Voice.start('ko-KR');
        } catch (e) {
            console.error('🎙️ 음성 시작 오류:', e);
        }
    };

    const stopVoiceRecognition = async () => {
        try {
            setIsRecording(false);
            await Voice.stop();
        } catch (e) {
            console.error('🎙️ 음성 정지 오류:', e);
        }
    };

    const sendDestinationToNative = (destination) => {
        if (TMapLauncher?.setDestination) {
            TMapLauncher.setDestination(destination);
            console.log(`✅ Native로 목적지 전달됨: ${destination}`);

            TMapLauncher.openTMapActivity(); // 이 타이밍이 중요!
            console.log(`🗺️ TMapActivity 실행됨`);
        } else {
            console.warn('⚠️ TMapLauncher 모듈이 없습니다.');
        }
    };


    return (
        <View style={styles.container}>
            <Text style={styles.title}>🎯 목적지 음성 입력</Text>
            <Text style={styles.result}>📢 인식된 텍스트: {recognizedText}</Text>

            <View style={styles.buttonContainer}>
                <Button
                    title={isRecording ? '🛑 중지' : '🎙️ 시작'}
                    onPress={isRecording ? stopVoiceRecognition : startVoiceRecognition}
                    color={isRecording ? 'red' : 'green'}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    result: { fontSize: 18, marginBottom: 40 },
    buttonContainer: { width: '60%' },
});

export default UserTmapScreen;
