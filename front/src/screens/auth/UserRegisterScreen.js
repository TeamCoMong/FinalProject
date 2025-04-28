import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NGROK_URL } from '../../config/ngrok';
import { getEventSource } from '../../services/SSEService';
import EncryptedStorage from 'react-native-encrypted-storage'; // ⬅️ 이거 상단에 import 추가!

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Dimensions } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import api from '../../api/api';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
const { width, height } = Dimensions.get('window');
const rnBiometrics = new ReactNativeBiometrics();

const UserRegisterScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [isNameValid, setIsNameValid] = useState(true); // 이름 입력 유효성 체크
    const [isAuthSuccess, setIsAuthSuccess] = useState(false); // 인증 성공 여부
    const [userId, setUserId] = useState(null); // 생성된 userId 저장
    const [error, setError] = useState(''); // 에러 메시지

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

    // 지문인식 요청
    const handleBiometricAuth = async () => {
        try {
            const { available, error } = await rnBiometrics.isSensorAvailable();
            if (available) {
                const { success } = await rnBiometrics.simplePrompt({ promptMessage: '지문으로 인증해주세요.' });
                if (success) {
                    setIsAuthSuccess(true); // 인증 성공
                    Alert.alert('인증 성공', '지문 인증에 성공했습니다.');
                } else {
                    setIsAuthSuccess(false);
                    Alert.alert('인증 실패', '지문 인증에 실패했습니다.');
                }
            } else {
                Alert.alert('지원 불가', '이 디바이스에서는 생체 인증을 사용할 수 없습니다.');
            }
        } catch (err) {
            console.log('지문 인증 오류:', err);
            Alert.alert('오류', '지문 인증 중 문제가 발생했습니다.');
        }
    };

    //회원가입 처리
    const handleRegister = async () => {
        if (!name) {
            setIsNameValid(false);
            Alert.alert('오류', '이름을 입력해주세요.');
            return;
        }
        if (!isAuthSuccess) {
            setIsAuthSuccess(true); // 테스트용 강제 성공
            // Alert.alert('오류', '지문 인증을 먼저 진행해주세요.'); 나중에 바꾸기 위에 지우고
            // return;
        }
        if (isAuthSuccess) {
            try {
                const response = await api.post('/users/signup', { name });

                if (response.status === 200 && response.data.userId) {
                    const newUserId = response.data.userId;

                    // ✅ userId 안전 저장
                    await EncryptedStorage.setItem('userId', newUserId);

                    // ✅ 알림 띄우고
                    Alert.alert('회원가입 성공', `회원가입이 완료되었습니다.`);

                    // ✅ 로그인 화면으로 이동
                    navigation.replace('UserLoginScreen');
                } else {
                    Alert.alert('회원가입 실패', response.data.message);
                }
            } catch (error) {
                console.error(error);
                setError('회원가입 중 문제가 발생했습니다.');
                Alert.alert('오류', '회원가입 중 문제가 발생했습니다.');
            }
        } else {
            Alert.alert('오류', '지문 인증을 먼저 진행해주세요.');
        }
    };


    return (
        <View style={styles.container}>
            <Text style={styles.title}>사용자 회원가입</Text>

            {/* 이름 입력 */}
            <TextInput
                style={[styles.input, !isNameValid ? styles.inputError : {}]}
                placeholder="이름을 입력해주세요"
                value={name}
                onChangeText={setName}
            />

            {/* 지문 인증 버튼 */}
            <TouchableOpacity style={styles.authButton} onPress={handleBiometricAuth}>
                <Text style={styles.buttonText}>지문 인증</Text>
            </TouchableOpacity>

            {/* 회원가입 버튼 */}
            <TouchableOpacity
                style={[styles.submitButton, isAuthSuccess && name ? styles.activeButton : styles.inactiveButton]}
                // disabled={!isAuthSuccess || !name} 회원가입 테스트 때문에 막아둠
                disabled={!name}
                onPress={handleRegister}
            >
                <Text style={styles.buttonText}>회원가입</Text>
            </TouchableOpacity>

            {/* 회원가입 후 생성된 userId 표시 */}
            {userId && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultText}>회원가입 완료!</Text>
                    <Text style={styles.resultText}>사용자 ID: {userId}</Text>
                </View>
            )}

            {/*/!* 에러 메시지 *!/*/}
            {/*{error && <Text style={styles.errorText}>{error}</Text>}*/}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        padding: width * 0.05,
    },
    title: {
        fontSize: height * 0.035,
        fontWeight: 'bold',
        color: '#007BFF',
        marginBottom: height * 0.03,
    },
    input: {
        width: '100%',
        height: height * 0.06,
        backgroundColor: '#FFFFFF',
        borderRadius: height * 0.015,
        paddingHorizontal: width * 0.04,
        marginBottom: height * 0.02,
    },
    inputError: {
        borderColor: 'red',
        borderWidth: 2,
    },
    authButton: {
        width: '100%',
        height: height * 0.06,
        backgroundColor: '#007BFF',
        borderRadius: height * 0.015,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: height * 0.03,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    submitButton: {
        width: '100%',
        height: height * 0.06,
        borderRadius: height * 0.015,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: height * 0.03,
    },
    activeButton: {
        backgroundColor: '#007BFF',
    },
    inactiveButton: {
        backgroundColor: '#CCC',
    },
    resultContainer: {
        marginTop: height * 0.03,
        alignItems: 'center',
    },
    resultText: {
        fontSize: height * 0.02,
        color: '#007BFF',
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
        marginTop: height * 0.02,
    },
});

export default UserRegisterScreen;
