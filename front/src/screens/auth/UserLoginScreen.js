import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import api from '../../api/api'; // 서버 API 호출 파일 import
import EncryptedStorage from 'react-native-encrypted-storage';

const UserLoginScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);

    // 일반 로그인 처리
    const handleLogin = async () => {
        try {
            const response = await api.post('/auth/login', { username, password });

            if (response.status === 200) {
                const { accessToken, refreshToken, username, email, name } = response.data;

                // 🔒 보안 저장소에 Refresh Token 저장
                await EncryptedStorage.setItem('refreshToken', refreshToken);

                // 🔄 홈 화면으로 이동하며 사용자 데이터 전달
                navigation.replace('Main', {
                    username: username,
                    email: email,
                    name: name,
                    accessToken: accessToken,
                });
            }
        } catch (error) {
            console.error(error);
            Alert.alert('로그인 실패', '아이디 또는 비밀번호를 확인하세요.');
        }
    };



    // // 소셜 로그인 처리
    // const handleSocialLogin = async (platform) => {
    //     try {
    //         const response = await api.get(`/auth/${platform}`);
    //         if (response.status === 200) {
    //             const { redirectUrl } = response.data;
    //             navigation.navigate('WebView', { redirectUrl, platform });
    //         }
    //     } catch (error) {
    //         console.error(error);
    //         Alert.alert('소셜 로그인 실패', '다시 시도해주세요.');
    //     }
    // };

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image source={require('../../assets/schoolboy2.png')} style={styles.logo} />
                <View style={styles.textWrapper}>
                    <Text style={styles.appName}>사용자 로그인</Text>
                </View>
            </View>


            {/* 사용자 로그인 */}
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <View style={styles.buttonContent}>
                    <Image
                        source={require('../../assets/fingerprint.png')} // PNG 파일 경로
                        style={styles.buttonIcon}
                    />
                    <Text style={styles.loginButtonText}>지문인식 로그인</Text>
                </View>
            </TouchableOpacity>



            <TouchableOpacity style={styles.testButton2} onPress={() => navigation.navigate('UserMain')}>
                <Text style={styles.buttonText}>(사용자)프론트 테스트</Text>
            </TouchableOpacity>


            {/* 계정 찾기 및 회원가입 */}
            <View style={styles.footer}>
                <TouchableOpacity onPress={() => navigation.navigate('FindAccount')}>
                    <Text style={styles.footerText}>계정 찾기</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('UserRegister')}>
                    <Text style={styles.footerText}>회원가입</Text>
                </TouchableOpacity>
            </View>
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
        position: 'absolute',
        top: 50, // 숫자가 작을수록 위로 감
        left: 0,
        right: 0,
        alignItems: 'center',
    },

    logo: {
        width: 110,
        height: 110,
    },
    textWrapper: {
        backgroundColor: '#B0E0E6',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        marginTop: 10,
        width: '98%',
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center', // ✅ 세로 방향 중앙 정렬
    },


    appName: {
        fontSize: 35,
        fontWeight: 'bold',
        color: '#cd5c5c',
        marginTop: -5, // ⬅️ 숫자를 조절하면서 테스트 (예: -2, -3, -5)
    },

    subAppName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#cd5c5c',
        marginTop: 10,
        marginBottom: 10,
    },
    mainDescription: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#D51',
        textAlign: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#007BFF',
        marginBottom: 30,
    },
    input: {
        width: '80%',
        height: 50,
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    passwordContainer: {
        width: '80%',
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    passwordInput: {
        flex: 1,
    },
    eyeIcon: {
        width: 24,
        height: 24,
    },


    loginButton: {
        backgroundColor: '#66cdaa',
        paddingVertical: 120, // 버튼 높이를 더 키움
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%', // 너비는 그대로 두거나 원하는 크기로 변경
        borderRadius: 35, // 모서리 둥글기를 더 키움
        marginBottom: 20,
        marginTop: 60, // 버튼을 더 아래로 내리기 위해 marginTop을 60으로 설정
        elevation: 6, // 안드로이드 그림자
        shadowColor: '#000', // iOS 그림자
        shadowOffset: { width: 0, height: 4 }, // 그림자 위치를 더 아래로
        shadowOpacity: 0.25,
        shadowRadius: 6, // 그림자 크기 더 크게 설정
    },


    loginButtonText: {
        color: 'black',
        fontSize: 25,
        fontWeight: 'bold',
    },
    socialLoginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
        marginBottom: 20,
    },
    socialIcon: {
        width: 50,
        height: 50,
        marginHorizontal: 10,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginTop: 20,
    },
    footerText: {
        fontSize: 14,
        color: '#007BFF',
        textDecorationLine: 'underline',
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
