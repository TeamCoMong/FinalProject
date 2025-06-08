import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const SettingsHelpScreen = ({ navigation }) => {
    // 뒤로가기 버튼 설정
    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerLeft}>
                    <Image source={require('../../assets/left-arrow.png')} style={styles.arrowIcon} />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    // 기타 설정 도움말에서 'UserMain'으로 네비게이트하고, '기타 설정' 탭으로 이동
    const handleNavigate = () => {
        navigation.navigate('UserMain', {
            screen: '기타 설정', // '기타 설정' 탭으로 이동
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>⚙️ 기타 설정 기능</Text>
            <Text style={styles.content}>
                SmartVision의 다양한 설정 기능을 통해 사용자 맞춤형 서비스를
                경험할 수 있습니다. 테마 변경, 알림 설정 등을 지원합니다.
            </Text>

            <TouchableOpacity style={styles.button} onPress={handleNavigate}>
                <Text style={styles.buttonText}>기타 설정 시작하기</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3E5F5', // 부드러운 보라색 배경
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 20,
        color: '#8E24AA', // 강렬한 보라색
        textShadowColor: '#F8BBD0', // 텍스트 그림자 효과
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,
    },
    content: {
        fontSize: 18,
        color: '#5E35B1',
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    button: {
        backgroundColor: '#AB47BC', // 버튼 색상
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        alignItems: 'center',
        elevation: 5, // 그림자 효과
        shadowColor: '#8E24AA',
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

export default SettingsHelpScreen;
