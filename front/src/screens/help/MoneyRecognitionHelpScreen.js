import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const MoneyRecognitionHelpScreen = ({ navigation }) => {
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

    // 지폐 인식 기능 도움말에서 'UserMain'으로 네비게이트하고, '기타 설정' 탭으로 이동
    const handleNavigate = () => {
        navigation.navigate('UserMain', {
            screen: '지폐 인식', // '기타 설정' 탭으로 이동
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>💵 지폐 인식 기능</Text>
            <Text style={styles.content}>
                SafeWalk의 지폐 인식 기능을 통해 카메라로 지폐를 스캔하면
                금액을 음성으로 안내받을 수 있습니다.
            </Text>

            <TouchableOpacity style={styles.button} onPress={handleNavigate}>
                <Text style={styles.buttonText}>지폐 인식 시작하기</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF9C4', // 부드러운 노란색 배경
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 20,
        color: '#F9A825', // 강렬한 노란색
        textShadowColor: '#FFECB3', // 텍스트 그림자 효과
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,
    },
    content: {
        fontSize: 18,
        color: '#5D4037',
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    button: {
        backgroundColor: '#FFCA28', // 버튼 색상
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

export default MoneyRecognitionHelpScreen;
