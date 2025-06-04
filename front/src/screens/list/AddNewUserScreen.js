import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage'; // 보호자 ID 저장되어 있다고 가정
import api from '../../api/api';

const AddNewUserScreen = ({ navigation }) => {
    // 새로운 사용자 데이터를 저장할 state
    const [userCode, setUserCode] = useState('');
    const [userName, setUserName] = useState('');

    // 사용자가 입력한 데이터를 처리하는 함수
    const handleAddUser = async () => {
        if (userCode.trim() === '' || userName.trim() === '') {
            Alert.alert('필수 입력란이 비어있습니다!', '사용자 코드와 이름을 모두 입력해주세요.');
            return;
        }

        try {
            const guardianId = await EncryptedStorage.getItem('guardianId'); // 🔥 보호자 ID 꺼내오기 (로그인 시 저장해놨을 것)

            if (!guardianId) {
                Alert.alert('오류', '로그인 정보가 없습니다. 다시 로그인 해주세요.');
                return;
            }

            // 🔥 서버에 보호자-사용자 연결 요청 보내기
            await api.post(`/guardians/${guardianId}/users/${userCode}`);

            Alert.alert('등록 완료', '새로운 사용자가 성공적으로 등록되었습니다!');
            navigation.goBack(); // 성공 후 목록으로 이동
        } catch (error) {
            console.error('사용자 등록 오류:', error);
            Alert.alert('오류', '사용자 등록 중 문제가 발생했습니다.');
        }
    };

    return (
        <View style={styles.container}>
            {/* 뒤로가기 버튼 */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>


            </TouchableOpacity>

            {/* 제목 */}
            <Text style={styles.title}>새로운 사용자 등록</Text>

            {/* 사용자 고유 코드 입력 */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>사용자 고유 코드</Text>
                <TextInput
                    style={styles.input}
                    value={userCode}
                    onChangeText={setUserCode}
                    placeholder="사용자 고유 코드를 입력하세요"
                    keyboardType="default"
                />
            </View>

            {/* 사용자 이름 입력 */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>사용자 이름</Text>
                <TextInput
                    style={styles.input}
                    value={userName}
                    onChangeText={setUserName}
                    placeholder="사용자 이름을 입력하세요"
                    keyboardType="default"
                />
            </View>

            {/* 등록 버튼 */}
            <TouchableOpacity style={styles.addButton} onPress={handleAddUser}>
                <Text style={styles.addButtonText}>등록</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f8ff',
        padding: 20,
    },

    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#007BFF',
        marginBottom: 30,
        fontFamily: 'Comic Sans MS', // 몽글몽글한 폰트로 수정
    },

    inputContainer: {
        width: '100%',
        marginBottom: 15,
    },

    label: {
        fontSize: 16,
        color: '#555',
    },

    input: {
        height: 40,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        paddingLeft: 10,
        marginTop: 5,
        fontSize: 16,
    },

    addButton: {
        backgroundColor: '#007BFF',
        padding: 15,
        borderRadius: 8,
        marginTop: 20,
        alignItems: 'center',
        width: '100%',
    },

    addButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },

    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 1,
    },
});

export default AddNewUserScreen;
