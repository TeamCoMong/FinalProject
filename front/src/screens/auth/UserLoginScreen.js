import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import ReactNativeBiometrics from 'react-native-biometrics';
import api from '../../api/api';

const rnBiometrics = new ReactNativeBiometrics();

const UserLoginScreen = ({ navigation }) => {

    const handleFingerprintLogin = async () => {
        try {
            const { available } = await rnBiometrics.isSensorAvailable();
            if (!available) {
                Alert.alert('지원 불가', '디바이스에서 생체 인증을 지원하지 않습니다.');

                // 테스트용으로 로그인 강제 처리 (에뮬레이터나 생체 인증 미지원 기기에서 우회용)
                const userId = 'user002';  // 하드코딩된 userId
                console.log("로그인 시도 userId:", userId); // 확인용

                const response = await api.post('/users/biometric-login', { userId });

                if (response.status === 200) {
                    const { accessToken, refreshToken, name } = response.data;

                    // Refresh Token을 EncryptedStorage에 저장
                    await EncryptedStorage.setItem('refreshToken', refreshToken);

                    // 로그인 후 메인 화면으로 이동
                    navigation.replace('Main', {
                        username: userId,
                        name: name,
                        accessToken: accessToken,
                    });
                } else {
                    Alert.alert('로그인 실패', '서버에서 로그인에 실패했습니다.');
                }
                return; // 생체 인증 실패 후 강제로 로그인 시도
            }

            // 생체 인증이 가능할 경우
            const { success } = await rnBiometrics.simplePrompt({ promptMessage: '지문으로 로그인 해주세요.' });
            if (!success) {
                Alert.alert('지문 인증 실패', '지문 인증에 실패했습니다.');
                return;
            }

            // 실제 로그인 시 저장된 userId를 가져옵니다.
            const userId = await EncryptedStorage.getItem('userId');
            if (!userId) {
                Alert.alert('오류', '저장된 사용자 정보가 없습니다. 회원가입이 필요합니다.');
                return;
            }

            // 사용자 ID를 통해 서버로 로그인 요청
            const response = await api.post('/users/biometric-login', { userId });

            if (response.status === 200) {
                const { accessToken, refreshToken, name } = response.data;

                // 서버로부터 받은 Refresh Token을 안전한 저장소에 저장
                await EncryptedStorage.setItem('refreshToken', refreshToken);

                // 로그인 성공 후 메인 화면으로 이동
                navigation.replace('UserMain', {
                    username: userId,
                    name: name,
                    accessToken: accessToken,
                });
            } else {
                Alert.alert('로그인 실패', '서버에서 로그인에 실패했습니다.');
            }
        } catch (error) {
            console.error('지문 로그인 에러:', error);
            Alert.alert('오류', '지문 로그인 중 오류가 발생했습니다.');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image source={require('../../assets/schoolboy2.png')} style={styles.logo} />
                <Text style={styles.title}>사용자 지문 로그인</Text>
            </View>

            {/* 지문 인증 로그인 버튼 */}
            <TouchableOpacity style={styles.loginButton} onPress={handleFingerprintLogin}>
                <View style={styles.buttonContent}>
                    <Image source={require('../../assets/UserFaceId.png')} style={styles.buttonIcon} />
                    <Text style={styles.loginButtonText}>지문 인증 로그인</Text>
                </View>
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
    },
    buttonIcon: {
        width: 50,
        height: 50,
        marginRight: 10,
    },
    loginButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
    },
});

export default UserLoginScreen;
