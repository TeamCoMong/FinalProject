import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import api from '../../api/api'; // 🔁 API 요청 모듈 import

const AdminSecondPwScreen = ({ route, navigation }) => {
    const { adminId } = route.params; // 1차 로그인에서 전달된 adminId
    const [secondPw, setSecondPw] = useState('');

    // ✅ 2차 비밀번호 검증 함수
    const handleVerify = async () => {
        try {
            const response = await api.post('/admin/verify-second-pw', {
                adminId,
                secondPw
            });

            if (response.status === 200 && response.data.success) {
                navigation.replace('ManagerMain'); // 🎯 관리자 메인 페이지로 이동
            } else {
                Alert.alert('인증 실패', response.data.error || '2차 비밀번호가 틀렸습니다.');
            }
        } catch (err) {
            console.error(err);
            Alert.alert('에러', '서버 오류가 발생했습니다.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>2차 비밀번호 입력</Text>

            <TextInput
                style={styles.input}
                placeholder="2차 비밀번호"
                secureTextEntry
                value={secondPw}
                onChangeText={setSecondPw}
            />

            <TouchableOpacity style={styles.button} onPress={handleVerify}>
                <Text style={styles.buttonText}>확인</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#007BFF',
    },
    input: {
        width: '80%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 20,
        backgroundColor: '#fff',
    },
    button: {
        width: '80%',
        height: 50,
        backgroundColor: '#007BFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AdminSecondPwScreen;
