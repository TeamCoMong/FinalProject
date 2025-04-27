import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // 요거 추가!!

const UserRegisterScreen = () => {
    const navigation = useNavigation(); // 요거 추가!!
    const [name, setName] = useState('');

    const handleNextButtonPress = () => {
        if (name.trim() === '') {
            alert('이름을 입력해주세요.');
        } else {
            console.log('입력한 이름:', name);
            // 예: navigation.navigate('지문등록화면') 이런 것도 가능
        }
    };

    const handleBackButtonPress = () => {
        navigation.goBack(); // 요걸로 진짜 뒤로 가기
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>회원가입</Text>
            <Text style={styles.label}>이름</Text>
            <TextInput
                style={styles.input}
                placeholder="이름을 입력해주세요"
                value={name}
                onChangeText={setName}
            />
            <TouchableOpacity style={styles.button} onPress={handleNextButtonPress}>
                <Text style={styles.buttonText}>지문등록 하러 가기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton} onPress={handleBackButtonPress}>
                <Text style={styles.backButtonText}>뒤로 가기</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 18,
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    backButton: {
        backgroundColor: '#f44336',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 30,
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default UserRegisterScreen;
