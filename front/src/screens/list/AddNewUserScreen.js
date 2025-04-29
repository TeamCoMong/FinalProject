import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const AddNewUserScreen = ({ navigation }) => {
    // 새로운 사용자 데이터를 저장할 state
    const [userCode, setUserCode] = useState('');
    const [userName, setUserName] = useState('');

    // 사용자가 입력한 데이터를 처리하는 함수
    const handleAddUser = () => {
        if (userCode.trim() === '' || userName.trim() === '') {
            Alert.alert('필수 입력란이 비어있습니다!', '사용자 코드와 이름을 모두 입력해주세요.');
            return;
        }

        // 사용자가 입력한 데이터를 처리하는 로직 (예: 서버에 저장하거나, 상태 관리에 저장)
        // 여기서는 단순히 콘솔에 로그로 보여줌
        console.log('새로운 사용자 정보:', { userCode, userName });

        // 사용자가 성공적으로 추가되면 뒤로가기 (사용자 목록 화면으로 돌아감)
        navigation.goBack();
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
