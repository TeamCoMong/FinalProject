import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import ReactNativeBiometrics from 'react-native-biometrics';
import api from '../../api/api';

import Sound from 'react-native-sound';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import { NGROK_URL } from '../../config/ngrok';
import { getEventSource } from "../../services/SSEService";
import { useNavigation } from '@react-navigation/native'; // ✅ 박주민테스트
const rnBiometrics = new ReactNativeBiometrics();

const UserLoginScreen = ({ navigation }) => {

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

            if (data.intent === '로그인') {
                console.log("인텐트: 로그인_웰컴");
                handleFingerprintLogin();
            }
        } catch (err) {
            console.error('SSE intent 처리 실패', err);
        }
    };

    // 박주민 테스트
    const handleTestLogin = () => {
        // 인증 없이 HomeStartScreen으로 이동
        navigation.navigate('HomeStartScreen');
    };

    const handleFingerprintLogin = async () => {
        try {
            const { available } = await rnBiometrics.isSensorAvailable();
            if (!available) {
                Alert.alert('지원 불가', '디바이스에서 생체 인증을 지원하지 않습니다.');

                const userId = await EncryptedStorage.getItem('userId');
                console.log('✅ (No Biometric) 로그인 시도 userId:', userId);

                const response = await api.post('/users/biometric-login', { userId });

                if (response.status === 200) {
                    const { accessToken, refreshToken, name } = response.data;
                    await EncryptedStorage.setItem('refreshToken', refreshToken);

                    Tts.stop();
                    await Tts.speak('로그인이 성공했어요. 메인 페이지로 이동할게요.');

                    setTimeout(() => {
                        navigation.replace('UserMain', {
                            username: userId,
                            name: name,
                            accessToken: accessToken,
                        });
                    }, 3000); // TTS 끝나기를 기다리는 대략적인 시간
                } else {
                    Alert.alert('로그인 실패', '서버에서 로그인에 실패했습니다.');
                }
                return;
            }

            const { success } = await rnBiometrics.simplePrompt({ promptMessage: '지문으로 로그인 해주세요.' });
            if (!success) {
                Alert.alert('지문 인증 실패', '지문 인증에 실패했습니다.');
                return;
            }

            const userId = await EncryptedStorage.getItem('userId');
            if (!userId) {
                Alert.alert('오류', '저장된 사용자 정보가 없습니다. 회원가입이 필요합니다.');
                return;
            }
            console.log('✅ (Biometric Success) 로그인 시도 userId:', userId);

            const response = await api.post('/users/biometric-login', { userId });

            if (response.status === 200) {
                const { accessToken, refreshToken, name } = response.data;
                await EncryptedStorage.setItem('refreshToken', refreshToken);

                Tts.stop();
                await Tts.speak('로그인이 성공했어요. 메인 페이지로 이동할게요.');

                setTimeout(() => {
                    navigation.replace('UserMain', {
                        username: userId,
                        name: name,
                        accessToken: accessToken,
                    });
                }, 3000);
            } else {
                Alert.alert('로그인 실패', '서버에서 로그인에 실패했습니다.');
            }
        } catch (error) {
            console.error('지문 로그인 에러:', error);
            Alert.alert('오류', '지문 로그인 중 오류가 발생했습니다.');
        }
    };

    useEffect(() => {
        Voice.onSpeechEnd = () => {
            playSound('end');
        };

        const triggerLoginWelcome = async () => {
            try {
                const res = await fetch(`${NGROK_URL}/dialogflow/triggerEvent?event=login_welcome`);
                const data = await res.json();

                Tts.stop();
                await Tts.speak(data.message);
            } catch (err) {
                console.error('웰컴 이벤트 호출 실패:', err);
            }
        };
        triggerLoginWelcome();
    }, []);

    useEffect(() => {
        let isLogin = false;

        const tryLoginIntentListener = () => {
            const currentEventSource = getEventSource();
            if (currentEventSource && !isLogin) {
                console.log('SSE 로그인 intent 리스너 등록');
                currentEventSource.addEventListener('intent', handleIntentEvent);
                isLogin = true;
            } else if (!isLogin) {
                setTimeout(tryLoginIntentListener, 1000);
            }
        };

        tryLoginIntentListener();

        return () => {
            const currentEventSource = getEventSource();
            if (currentEventSource && typeof currentEventSource.removeEventListener === 'function') {
                currentEventSource.removeEventListener('intent', handleIntentEvent);
            }
        };
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image source={require('../../assets/schoolboy2.png')} style={styles.logo} />
                <Text style={styles.title}>사용자 지문 로그인</Text>
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleFingerprintLogin}>
                <View style={styles.buttonContent}>
                    <Image source={require('../../assets/UserFaceId.png')} style={styles.buttonIcon} />
                    <Text style={styles.loginButtonText}>지문 인증 로그인</Text>
                </View>
            </TouchableOpacity>

            {/* ✅ 테스트 로그인 버튼 추가 */}
            <TouchableOpacity style={styles.testButton2} onPress={() => navigation.navigate('UserMain')}>
                <Text style={styles.buttonText}>(사용자)프론트 테스트</Text>
            </TouchableOpacity>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fffacd',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#cd5c5c',
    },
    loginButton: {
        backgroundColor: '#66cdaa',
        paddingVertical: 20,
        paddingHorizontal: 40,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 5,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonIcon: {
        width: 80,
        height: 80,
        marginRight: 8, // 텍스트와의 간격 (왼쪽 이미지니까 marginRight)
    },
});

export default UserLoginScreen;
