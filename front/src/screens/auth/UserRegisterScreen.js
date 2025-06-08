import React, { useState, useEffect } from 'react';
import { NGROK_URL } from '../../config/ngrok';
import { getEventSource } from '../../services/SSEService';
import EncryptedStorage from 'react-native-encrypted-storage';

import Sound from 'react-native-sound';

import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Dimensions } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import api from '../../api/api';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
const { width, height } = Dimensions.get('window');
const rnBiometrics = new ReactNativeBiometrics();

const UserRegisterScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [isAuthSuccess, setIsAuthSuccess] = useState(false);
    const [userId, setUserId] = useState(null);

    const playSound = (filename) => {
        const sound = new Sound(filename, Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.error('❌ 사운드 로드 실패:', error);
                return;
            }
            sound.play((success) => {
                if (!success) {
                    console.error('❌ 사운드 재생 실패');
                }
                sound.release();
            });
        });
    };

    const handleIntentEvent = (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log('📦 파싱된 데이터:', data);

            if (data.intent === '회원가입_이름입력') {
                if (data.person) {
                    console.log('🧍 이름 세팅:', data.person);
                    setName(data.person);
                }
            }

            if (data.intent === '회원가입_이름확인') {
                if (data.outputContext && data.outputContext.includes('awaiting_finger')) {
                    console.log('🖐️ 지문 인증 시작');
                    handleBiometricAuth();
                }
            }
        } catch (err) {
            console.error('❌ SSE intent 처리 실패:', err);
        }
    };

    const handleBiometricAuth = async () => {
        try {
            const { available } = await rnBiometrics.isSensorAvailable();
            if (available) {
                const { success } = await rnBiometrics.simplePrompt({ promptMessage: '지문으로 인증해주세요.' });
                if (success) {
                    console.log('✅ 지문 인증 성공');
                    setIsAuthSuccess(true);
                    // Alert.alert('인증 성공', '지문 인증에 성공했습니다.');
                } else {
                    setIsAuthSuccess(false);
                    Alert.alert('인증 실패', '지문 인증에 실패했습니다.');
                }
            } else {
                Alert.alert('지원 불가', '이 디바이스에서는 생체 인증을 사용할 수 없습니다.');
            }
        } catch (err) {
            console.error('지문 인증 오류:', err);
            Alert.alert('오류', '지문 인증 중 문제가 발생했습니다.');
        }
    };

    const handleRegister = async () => {
        if (!name || name.trim() === '') {
            Alert.alert('오류', '이름을 입력해주세요.');
            return;
        }
        if (!isAuthSuccess) {
            Alert.alert('오류', '지문 인증을 먼저 진행해주세요.');
            return;
        }

        try {
            const response = await api.post('/users/signup', { name });

            if (response.status === 200 && response.data.userId) {
                const newUserId = response.data.userId;

                await EncryptedStorage.setItem('userId', newUserId);
                await EncryptedStorage.setItem('name', name);
                await EncryptedStorage.setItem('accessToken', '');

                console.log('✅ EncryptedStorage 저장됨:', newUserId, name);

                const checkId = await EncryptedStorage.getItem('userId');
                const checkName = await EncryptedStorage.getItem('name');
                console.log('🔎 EncryptedStorage에서 확인된 값:', checkId, checkName);

                setUserId(newUserId);                                 // ✅ state 반영

                const spacedId = newUserId.split('').map(char => `${char}.`).join(' ');
                const ttsMessage = `회원가입이 완료되었습니다. 회원님의 아이디는 ${spacedId} 입니다.`;
                Tts.speak(ttsMessage);

                // Alert.alert('회원가입 성공', `회원가입이 완료되었습니다.\n사용자 ID: ${newUserId}`);
                setTimeout(() => {
                    navigation.replace('MainTab', {
                        username: newUserId,
                        name: name,
                        accessToken: null, // or ''
                    });
                }, 6000);
            } else {
                Alert.alert('회원가입 실패', response.data.message);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('오류', '회원가입 중 문제가 발생했습니다.');
        }
    };

    useEffect(() => {
        let isRegistered = false;

        const tryRegisterIntentListener = () => {
            const currentEventSource = getEventSource();
            if (currentEventSource && !isRegistered) {
                currentEventSource.addEventListener('intent', handleIntentEvent);
                isRegistered = true;
            } else if (!isRegistered) {
                setTimeout(tryRegisterIntentListener, 1000);
            }
        };

        tryRegisterIntentListener();

        Voice.onSpeechEnd = () => {
            console.log('🛑 음성 인식이 끝났습니다');

            playSound('end'); // end.mp3 (띠롱)
        };

        const triggerSignupWelcome = async () => {
            try {
                const res = await fetch(`${NGROK_URL}/dialogflow/triggerEvent?event=signup_welcome`);
                const data = await res.json();
                if (data.person) {
                    setName(data.person);
                }

                Tts.stop();
                await Tts.speak(data.message);

                Tts.addEventListener('tts-finish', async () => {
                    try {
                        playSound('start');
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

            const currentEventSource = getEventSource();
            if (currentEventSource && typeof currentEventSource.removeEventListener === 'function') {
                currentEventSource.removeEventListener('intent', handleIntentEvent);
            }
        };
    }, []);

    // ✅ 지문 인증 성공 + 이름 입력 완료 감시
    useEffect(() => {
        if (isAuthSuccess && name.trim() !== '') {
            console.log('🧠 지문 인증 성공 + 이름 입력 완료 → 회원가입 시도');
            handleRegister();
        }
    }, [isAuthSuccess, name]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>사용자 회원가입</Text>

            <TextInput
                style={styles.input}
                placeholder="이름을 입력해주세요"
                value={name}
                onChangeText={setName}
            />

            <TouchableOpacity style={styles.authButton} onPress={handleBiometricAuth}>
                <Text style={styles.buttonText}>지문 인증</Text>
            </TouchableOpacity>

            {/*<TouchableOpacity*/}
            {/*    style={[styles.submitButton, isAuthSuccess && name ? styles.activeButton : styles.inactiveButton]}*/}
            {/*    disabled={!name}*/}
            {/*    onPress={handleRegister}*/}
            {/*>*/}
            {/*    <Text style={styles.buttonText}>회원가입</Text>*/}
            {/*</TouchableOpacity>*/}

            {userId && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultText}>회원가입 완료!</Text>
                    <Text style={styles.resultText}>사용자 ID: {userId}</Text>
                </View>
            )}

            {!userId && isAuthSuccess && name.trim() !== '' && (
                <Text style={{ marginTop: height * 0.02, fontSize: 16, color: '#555', fontWeight: 'bold' }}>
                    ✅ 지문 인증 완료. 회원가입을 진행 중입니다...
                </Text>
            )}

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
