import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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
import { startSSE, stopSSE } from './src/services/SSEService';
import { navigationRef } from './src/navigation/NavigationService';
import { AppState } from 'react-native';

// 스크린 import

import PersonalStudyMainScreen from './src/screens/personal/PersonalStudyMainScreen';
import GroupStudyMainScreen from './src/screens/group/GroupStudyMainScreen';
import MyPageMainScreen from './src/screens/mypage/MyPageMainScreen';
import HomeStartScreen from "./src/screens/start/HomeStartScreen";
import FavoriteScreen from "./src/screens/favorite/FavoriteScreen";
import BillScanScreen from "./src/screens/scan/BillScanScreen";
import SettingScreen from "./src/screens/Setting/SettingScreen";
import IntroScreen from './src/screens/IntroScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import FindAccountScreen from "./src/screens/auth/FindAccountScreen";
import ResetPasswordScreen from "./src/screens/auth/ResetPasswordScreen";
import KakaoMapScreen from "./src/screens/location/KakaoMapScreen";
import GuardianSettingScreen from "./src/screens/Setting/GuardianSettingScreen";
import GuardianHomeScreen from "./src/screens/start/GuardianHomeScreen";
import GuardianModeSelectionScreen from './src/screens/mode/GuardianModeSelectionScreen';
import UserModeSelectionScreen from './src/screens/mode/UserModeSelectScreen';
import GuardianLoginScreen from './src/screens/auth/GuardianLoginScreen';
import GuardianRegisterScreen from './src/screens/auth/GuardianRegisterScreen';
import UserLoginScreen from './src/screens/auth/UserLoginScreen';
import UserRegisterScreen from './src/screens/auth/UserRegisterScreen';
import TestLoginScreen from "./src/screens/testscreen/TestLoginScreen";

// ✅ 탭 & 스택 네비게이터
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ✅ 공통 탭 아이콘 및 스타일 설정
const screenOptions = ({ route }) => ({
    tabBarIcon: ({ focused, size }) => {
        let iconPath;
        switch (route.name) {
            case '홈 키':
                iconPath = require('./src/assets/home.png');
                break;
            case '지폐 인식':
                iconPath = require('./src/assets/search.png');
                break;
            case '즐겨찾기':
                iconPath = require('./src/assets/star.png');
                break;
            case '기타 설정':
                iconPath = require('./src/assets/gear.png');
                break;
        }

        const iconColor = focused ? '#007AFF' : '#A9A9A9';

        return (
            <Image
                source={iconPath}
                style={{
                    width: size,
                    height: size,
                }}
            />
        );
    },
    tabBarActiveTintColor: '#007AFF',
    tabBarInactiveTintColor: '#A9A9A9',
});

// ✅ 보호자 탭 아이콘 및 스타일 설정
const guardianScreenOptions = ({ route }) => ({
    tabBarIcon: ({ focused, size }) => {
        let iconPath;
        switch (route.name) {
            case '사용자 위치보기':
                iconPath = require('./src/assets/home.png');
                break;
            case '설정':
                iconPath = require('./src/assets/gear.png');
                break;
        }

        const iconColor = focused ? '#007AFF' : '#A9A9A9';

        return (
            <Image
                source={iconPath}
                style={{
                    width: size,
                    height: size,
                }}
            />
        );
    },
    tabBarActiveTintColor: '#007AFF',
    tabBarInactiveTintColor: '#A9A9A9',
});

// ✅ 사용자 메인 탭 네비게이터
const MainTabNavigator = () => (
    <Tab.Navigator screenOptions={screenOptions}>
        <Tab.Screen name="홈 키" component={HomeStartScreen} />
        <Tab.Screen name="지폐 인식" component={BillScanScreen} />
        <Tab.Screen name="즐겨찾기" component={FavoriteScreen} />
        <Tab.Screen name="기타 설정" component={SettingScreen} />
    </Tab.Navigator>
);

// ✅ 보호자 메인 탭 네비게이터
const GuardianTabNavigator = () => (
    <Tab.Navigator screenOptions={guardianScreenOptions}>
        <Tab.Screen name="사용자 위치보기" component={GuardianHomeScreen} />
        <Tab.Screen name="설정" component={GuardianSettingScreen} />
    </Tab.Navigator>
);

// ✅ 앱 전체 구성
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
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator initialRouteName="Intro" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Intro" component={IntroScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="FindAccount" component={FindAccountScreen} />
                <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
                <Stack.Screen name="KakaoMap" component={KakaoMapScreen} />

                {/* 테스트 전용 */}
                <Stack.Screen name="TestLoginScreen" component={TestLoginScreen} />

                {/* 4/24 메인 이전 로그인/회원가입 화면 */}
                <Stack.Screen name="GuardianModeSelectionScreen" component={GuardianModeSelectionScreen} />
                <Stack.Screen name="UserModeSelectionScreen" component={UserModeSelectionScreen} />

                {/* 4/24 프론트화면 */}
                <Stack.Screen name="GuardianRegisterScreen" component={GuardianRegisterScreen} />
                <Stack.Screen name="GuardianLoginScreen" component={GuardianLoginScreen} />
                <Stack.Screen name="UserRegisterScreen" component={UserRegisterScreen} />
                <Stack.Screen name="UserLoginScreen" component={UserLoginScreen} />

                {/* 메인 탭 */}
                <Stack.Screen name="UserMain" component={MainTabNavigator} />
                <Stack.Screen name="GuardianMain" component={GuardianTabNavigator} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;
