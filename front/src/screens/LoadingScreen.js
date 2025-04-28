// LoadingScreen.js

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';

const LoadingScreen = ({ navigation }) => {
    const fadeAnim = new Animated.Value(0); // 애니메이션을 위한 값

    useEffect(() => {
        // 애니메이션 시작
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
        }).start();

        const timer = setTimeout(() => {
            navigation.replace('Intro');  // 5초 후 IntroScreen으로 이동
        }, 5000);

        return () => clearTimeout(timer); // 타이머 클린업
    }, [navigation, fadeAnim]);

    return (
        <View style={styles.container}>
            <Animated.View style={{ ...styles.innerContainer, opacity: fadeAnim }}>
                <Image source={require('../assets/appicon2.png')} style={styles.logo} />
                <Text style={styles.loadingText}>SafeWalk</Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFBEC', // 부드러운 노란색 배경
    },
    innerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 200, // 로고 크기 조정
        height: 200,
        marginBottom: 30,
        borderWidth: 5,
        borderColor: '#fff', // 흰색 테두리
        shadowColor: '#000', // 그림자 효과 추가
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    loadingText: {
        fontSize: 28, // 글자 크기 조정
        fontWeight: 'bold',
        color: '#5A5A5A', // 부드러운 회색 텍스트
        textShadowColor: '#fff',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5, // 텍스트에 부드러운 그림자 추가
        letterSpacing: 2, // 글자 간격 추가
    },
});

export default LoadingScreen;
