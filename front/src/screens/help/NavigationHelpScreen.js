import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const NavigationHelpScreen = ({ navigation }) => {
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

    // 길 안내 시작 버튼 클릭 시 'UserMain'으로 네비게이트하고, '기타 설정' 탭으로 이동
    const handleNavigate = () => {
        navigation.navigate('UserMain', {
            screen: '홈 키', // '홈 키'
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🚶 길 안내 기능</Text>
            <Text style={styles.content}>
                SmartVision의 길 안내 기능을 통해 사용자는 목적지까지 안전하게 이동할 수 있습니다.
                경로 안내와 음성 지시를 지원합니다.
            </Text>

            <TouchableOpacity style={styles.button} onPress={handleNavigate}>
                <Text style={styles.buttonText}>길 안내 시작하기</Text>
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

export default NavigationHelpScreen;
