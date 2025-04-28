import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const MyUniqueCodeScreen = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            {/* 뒤로가기 버튼 */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Image
                    source={require('../../assets/back-button.png')} // 아이콘 경로 수정 필요
                    style={styles.backIcon}
                />
            </TouchableOpacity>

            <Text style={styles.title}>홍길동 님의 고유 코드</Text>
            <View style={styles.codeContainer}>
                <Text style={styles.code}>ABS29DP</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E0F7FA', // 하늘색 배경
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#37474F',
        marginBottom: 30,
        fontFamily: 'sans-serif-medium',
        textAlign: 'center',
    },
    codeContainer: {
        backgroundColor: '#ffffff', // 흰색 배경
        paddingVertical: 30,
        paddingHorizontal: 40,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    code: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1E88E5', // 강조된 파란색
        letterSpacing: 2, // 코드 간격을 살짝 띄워서 스타일을 강조
    },
    backButton: {
        position: 'absolute',
        top: 25, // 상단에 위치
        left: 20, // 왼쪽으로 위치
        zIndex: 1, // 다른 요소 위에 배치되도록
    },
    backIcon: {
        width: 30,
        height: 30,
    },
});

export default MyUniqueCodeScreen;
