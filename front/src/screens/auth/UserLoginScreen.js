import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import ReactNativeBiometrics from 'react-native-biometrics';
import api from '../../api/api';

import Sound from 'react-native-sound';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';

const rnBiometrics = new ReactNativeBiometrics();

const UserLoginScreen = ({ navigation }) => {
    const playSound = (filename) => {
        const sound = new Sound(filename, Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.error('❌ 사운드 로드 실패:', error);
                return;
            }
            sound.play(success => {
                if (!success) console.error('❌ 사운드 재생 실패');
                sound.release();
            });
        });
    };

    const handleFingerprintLogin = async () => {

        try {
            console.log('🟢 로그인 버튼 클릭됨');
            const { available } = await rnBiometrics.isSensorAvailable();
            if (!available) {
                Alert.alert('지원 불가', '디바이스에서 생체 인증을 지원하지 않습니다.');
                return;
            }

            // ✅ 무조건 지문 인증 시도
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

            const response = await api.post('/users/biometric-login', { userId });
            if (response.status === 200) {
                const { accessToken, refreshToken, name } = response.data;
                await EncryptedStorage.setItem('refreshToken', refreshToken);

                Tts.stop();
                await Tts.speak('로그인이 성공했어요. 메인 페이지로 이동할게요.');

                setTimeout(() => {
                    navigation.replace('MainTab');
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
        // 앱 시작 시 자동으로 지문 인증 시도
        const tryAutoLogin = async () => {
            console.log('🔐 자동 지문 로그인 시도');
            await handleFingerprintLogin();
        };
        tryAutoLogin();
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
                    <Text style={styles.loginButtonText}>지문 인증 다시 시도</Text>
                </View>
            </TouchableOpacity>

            {/*<TouchableOpacity*/}
            {/*    style={[styles.loginButton, { marginTop: 20, backgroundColor: '#ffa07a' }]}*/}
            {/*    onPress={() => {*/}
            {/*        Tts.stop();*/}
            {/*        Tts.speak('프론트 테스트 성공입니다.');*/}
            {/*        Alert.alert('프론트 테스트', '프론트 테스트 성공!');*/}

            {/*        setTimeout(() => {*/}
            {/*            navigation.replace('MainTab');*/}
            {/*        }, 2500);*/}
            {/*    }}*/}
            {/*>*/}
            {/*    <View style={styles.buttonContent}>*/}
            {/*        <Text style={styles.loginButtonText}>🧪 프론트 테스트</Text>*/}
            {/*    </View>*/}
            {/*</TouchableOpacity>*/}
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
        marginRight: 8,
    },
    loginButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
});

export default UserLoginScreen;
