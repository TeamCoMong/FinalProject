import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NGROK_URL } from '../../config/ngrok';
import { getEventSource } from '../../services/SSEService';

import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';

const UserRegisterScreen = () => {
    const navigation = useNavigation();
    const [name, setName] = useState('');

    const handleIntentEvent = (event) => {
        try {
            console.log('🔥 [SSE] intent 수신:', event);
            console.log('🌟 intent 이벤트의 event.data:', event.data);

            const data = JSON.parse(event.data);
            console.log('📦 파싱된 데이터:', data);

            if (data.intent === '회원가입_이름입력') {
                console.log('🧠 응답:', data.message);

                if (data.person) {
                    console.log('🧍 서버가 알려준 이름(SSE):', data.person);
                    setName(data.person);
                } else {
                    console.log('🚫 data.person 없음!');
                }
            }
        } catch (err) {
            console.error('❌ SSE intent 처리 실패:', err);
            console.error('❌ 실패 원본 event.data:', event.data);
        }
    };

    useEffect(() => {
        let isRegistered = false;

        const tryRegisterIntentListener = () => {
            const currentEventSource = getEventSource(); // ✅ 여기에 호출
            if (currentEventSource && !isRegistered) {
                console.log('✅ eventSource 준비됨, handleIntentEvent 등록');
                currentEventSource.addEventListener('intent', handleIntentEvent);  // ✅ 여기 변경
                isRegistered = true;
            } else if (!isRegistered) {
                console.warn('⏳ eventSource 아직 없음, 1초 후 재시도');
                setTimeout(tryRegisterIntentListener, 1000);
            }
        };

        tryRegisterIntentListener();

        const triggerSignupWelcome = async () => {
            try {
                const res = await fetch(`${NGROK_URL}/dialogflow/triggerEvent?event=signup_welcome`);
                const data = await res.json();
                console.log('🧠 웰컴 응답:', data.message);

                if (data.person) {
                    console.log('🧍 서버가 알려준 이름:', data.person);
                    setName(data.person);
                }

                Tts.stop();
                await Tts.speak(data.message);

                Tts.addEventListener('tts-finish', async () => {
                    console.log('🎤 TTS 끝났으니 음성 인식 시작');
                    try {
                        await Voice.start('ko-KR');
                    } catch (e) {
                        console.error('❌ 음성 인식 시작 실패:', e);
                    }
                });

            } catch (err) {
                console.error('❌ 웰컴 이벤트 호출 실패:', err);
            }
        };

        triggerSignupWelcome();

        Voice.onSpeechError = (e) => {
            console.error('❌ 음성 인식 오류:', e.error);
        };

        return () => {
            Tts.removeAllListeners('tts-finish');
            Voice.destroy().then(Voice.removeAllListeners);

            const currentEventSource = getEventSource(); // ✅
            if (currentEventSource) {
                currentEventSource.removeEventListener('intent', handleIntentEvent);
            }
        };
    }, []);

    const handleNextButtonPress = () => {
        if (name.trim() === '') {
            Alert.alert('입력 오류', '이름을 입력해주세요.');
        } else {
            console.log('입력한 이름:', name);
            // navigation.navigate('지문등록화면') 등 이동
        }
    };

    const handleBackButtonPress = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>회원가입</Text>
            <Text style={styles.label}>이름</Text>
            <TextInput
                style={styles.input}
                placeholder="이름을 입력해주세요"
                value={name}
                onChangeText={setName}
            />
            <TouchableOpacity style={styles.button} onPress={handleNextButtonPress}>
                <Text style={styles.buttonText}>지문등록 하러 가기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton} onPress={handleBackButtonPress}>
                <Text style={styles.backButtonText}>뒤로 가기</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 18,
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    backButton: {
        backgroundColor: '#f44336',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 30,
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default UserRegisterScreen;