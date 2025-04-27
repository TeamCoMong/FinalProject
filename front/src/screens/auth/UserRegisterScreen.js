import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Dimensions } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import api from '../../api/api';

const { width, height } = Dimensions.get('window');
const rnBiometrics = new ReactNativeBiometrics();

const UserRegisterScreen = () => {
    const [name, setName] = useState('');
    const [isNameValid, setIsNameValid] = useState(true); // 이름 입력 유효성 체크
    const [isAuthSuccess, setIsAuthSuccess] = useState(false); // 인증 성공 여부
    const [userId, setUserId] = useState(null); // 생성된 userId 저장
    const [error, setError] = useState(''); // 에러 메시지

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

    // 회원가입 처리
    const handleRegister = async () => {
        if (!name) {
            setIsNameValid(false);
            Alert.alert('오류', '이름을 입력해주세요.');
            return;
        }
        if (!isAuthSuccess) {
            // 지문 인증을 건너뛰고 싶다면, 아래 라인 추가
            setIsAuthSuccess(true); // 강제로 인증 성공 상태로 변경
        }
        if (isAuthSuccess) {
            try {
                // 회원가입 요청
                const response = await api.post('/users/signup', { name });

                // 응답에서 userId 추출
                if (response.status === 200 && response.data.userId) {
                    setUserId(response.data.userId); // userId 상태 업데이트
                    Alert.alert('회원가입 성공', `회원가입이 완료되었습니다.\n사용자 ID: ${response.data.userId}`);
                } else {
                    Alert.alert('회원가입 실패', response.data.message);
                }
            } catch (error) {
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
