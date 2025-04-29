import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';

const LoadingScreen = ({ navigation }) => {
    const logoAnim = useRef(new Animated.Value(0)).current; // 로고용 애니메이션
    const textAnim = useRef(new Animated.Value(0)).current; // 텍스트용 애니메이션

    useEffect(() => {
        // 로고 먼저 애니메이션
        Animated.sequence([
            Animated.timing(logoAnim, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            }),
            Animated.timing(textAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
        ]).start();

        const timer = setTimeout(() => {
            navigation.replace('Intro');
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigation, logoAnim, textAnim]);

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.logoContainer,
                    {
                        opacity: logoAnim,
                        transform: [
                            {
                                scale: logoAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.5, 1], // 작게 시작해서 정상 크기로
                                }),
                            },
                        ],
                    }
                ]}
            >
                <Image source={require('../assets/appicon2.png')} style={styles.logo} />
            </Animated.View>

            <Animated.View
                style={[
                    styles.textContainer,
                    {
                        opacity: textAnim,
                        transform: [
                            {
                                translateY: textAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [50, 0], // 밑에서 위로
                                }),
                            },
                        ],
                    }
                ]}
            >
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
        backgroundColor: '#FFFBEC',
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    logo: {
        width: 200,
        height: 200,
        borderWidth: 5,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    textContainer: {
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#5A5A5A',
        textShadowColor: '#fff',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,
        letterSpacing: 2,
    },
});

export default LoadingScreen;
