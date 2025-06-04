import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const GuardianRegisterHelpScreen = ({ navigation }) => {

    // '나를 등록한 보호자 보기' 버튼 클릭 시 MyGuardiansListScreen으로 네비게이트
    const handleNavigate = () => {
        navigation.navigate('MyGuardianListScreen'); // 올바른 화면 이름으로 네비게이트
    };

    // 뒤로 가기 버튼 추가

    return (
        <View style={styles.container}>
            <Text style={styles.title}>👨‍👩‍👧‍👦 보호자 등록 기능</Text>
            <Text style={styles.content}>
                보호자가 사용자의 고유 코드를 입력받고, 사용자의 위치 정보를 공유 받으며, 등록한 보호자를 볼 수 있습니다.
            </Text>

            <TouchableOpacity style={styles.button} onPress={handleNavigate}>
                <Text style={styles.buttonText}>나를 등록한 보호자 보기</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E3F2FD', // 부드러운 파란색 배경
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 20,
        color: '#1565C0', // 강렬한 파란색
        textShadowColor: '#BBDEFB', // 텍스트 그림자 효과
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,
    },
    content: {
        fontSize: 18,
        color: '#37474F',
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    button: {
        backgroundColor: '#42A5F5', // 버튼 색상
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        alignItems: 'center',
        elevation: 5, // 그림자 효과
        shadowColor: '#0D47A1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    headerLeft: {
        marginLeft: 10,
    },
    arrowIcon: {
        width: 30,
        height: 30,
    },
});

export default GuardianRegisterHelpScreen;
