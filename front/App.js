import React, { useEffect } from 'react';
import { AppState, TouchableWithoutFeedback } from 'react-native';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Image } from 'react-native';

// 마이크 권한
import { PermissionsAndroid, Platform } from 'react-native';


import { View } from 'react-native';


// 👉 기존 import
import { startSSE, stopSSE } from './src/services/SSEService';
import { navigationRef } from './src/navigation/NavigationService';

// 👉 화면 import
import IntroScreen from './src/screens/IntroScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import FindAccountScreen from "./src/screens/auth/FindAccountScreen";
import ResetPasswordScreen from "./src/screens/auth/ResetPasswordScreen";
import KakaoMapScreen from "./src/screens/location/KakaoMapScreen";
import TestHomeScreen from "./src/screens/testscreen/TestHomeScreen";
import TestMyPageScreen from "./src/screens/testscreen/TestMyPageScreen";
import TestCommunityScreen from "./src/screens/testscreen/TestCommunityScreen";
import TestSearchScreen from "./src/screens/testscreen/TestSearchScreen";
import TestLoginScreen from "./src/screens/testscreen/TestLoginScreen";

// ✅ 탭 & 스택 네비게이터
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const screenOptions = ({ route }) => ({
    tabBarIcon: ({ focused, size }) => {
        let iconPath;
        switch (route.name) {
            case 'TestHomeScreen':
                iconPath = require('./src/assets/home.png');
                break;
            case 'TestSearchScreen':
                iconPath = require('./src/assets/search.png');
                break;
            case 'TestCommunityScreen':
                iconPath = require('./src/assets/community.png');
                break;
            case 'TestMyPageScreen':
                iconPath = require('./src/assets/mypage.png');
                break;
        }

        return <Image source={iconPath} style={{ width: size, height: size }} />;
    },
    tabBarActiveTintColor: '#007AFF',
    tabBarInactiveTintColor: '#A9A9A9',
});

const MainTabNavigator = () => (
    <Tab.Navigator screenOptions={screenOptions}>
        <Tab.Screen name="TestHomeScreen" component={TestHomeScreen} />
        <Tab.Screen name="TestSearchScreen" component={TestSearchScreen} />
        <Tab.Screen name="TestCommunityScreen" component={TestCommunityScreen} />
        <Tab.Screen name="TestMyPageScreen" component={TestMyPageScreen} />
    </Tab.Navigator>
);

const App = () => {
    useEffect(() => {
        Tts.setDefaultLanguage('ko-KR');

        const requestPermissions = async () => {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                    {
                        title: '마이크 권한 요청',
                        message: '음성 인식을 위해 마이크 접근 권한이 필요합니다.',
                        buttonNeutral: '나중에',
                        buttonNegative: '거부',
                        buttonPositive: '허용',
                    },
                );
                console.log('🔐 마이크 권한:', granted);

                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    Tts.speak('TTS 테스트입니다.');
                }
            }
        };

        requestPermissions();

        Voice.onSpeechResults = (e) => {
            const text = e.value?.[0];
            if (!text) {
                console.log("⚠️ 음성 인식 결과 없음");
                return;
            }

            console.log('🎤 인식된 말:', text);
            fetch(`http://10.0.2.2:8080/dialogflow/message?query=${encodeURIComponent(text)}`)
                .then(res => res.json())
                .then(data => {
                    console.log('🧠 응답:', data.message);
                    Tts.speak(data.message);
                })
                .catch(err => {
                    console.error('❌ 서버 오류:', err);
                    Tts.speak('서버에 연결할 수 없습니다.');
                });
        };

        Voice.onSpeechError = (e) => {
            console.log('❌ 음성 인식 에러:', e.error);
        };

        startSSE();
        const subscription = AppState.addEventListener('change', (nextState) => {
            if (nextState === 'active') {
                startSSE();
            }
        });

        return () => {
            stopSSE();
            Voice.destroy().then(Voice.removeAllListeners);
            subscription.remove();
        };
    }, []);


    // ✅ 전체 화면 터치 시 STT 시작
    const handleStartListening = async () => {
        try {
            console.log('🟢 음성 인식이 시작되었습니다');
            Tts.speak('음성 인식이 시작되었습니다.');
            await Voice.start('ko-KR');
        } catch (e) {
            console.error('🎤 음성인식 시작 실패:', e);
            Tts.speak('음성 인식 시작에 실패했습니다.');
        }
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={handleStartListening}>
                <View style={{ flex: 1 }}>
                    <NavigationContainer ref={navigationRef}>
                        <Stack.Navigator initialRouteName="Intro" screenOptions={{ headerShown: false }}>
                            <Stack.Screen name="Intro" component={IntroScreen} />
                            <Stack.Screen name="Login" component={LoginScreen} />
                            <Stack.Screen name="Register" component={RegisterScreen} />
                            <Stack.Screen name="FindAccount" component={FindAccountScreen} />
                            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
                            <Stack.Screen name="KakaoMap" component={KakaoMapScreen} />

                            {/* 테스트 */}
                            <Stack.Screen name="TestLoginScreen" component={TestLoginScreen} />
                            <Stack.Screen name="TestHomeScreen" component={TestHomeScreen} />
                            <Stack.Screen name="TestCommunityScreen" component={TestCommunityScreen} />
                            <Stack.Screen name="TestMyPageScreen" component={TestMyPageScreen} />
                            <Stack.Screen name="TestSearchScreen" component={TestSearchScreen} />

                            <Stack.Screen name="Main" component={MainTabNavigator} />
                        </Stack.Navigator>
                    </NavigationContainer>
                </View>
            </TouchableWithoutFeedback>
        </GestureHandlerRootView>
    );
};

export default App;
