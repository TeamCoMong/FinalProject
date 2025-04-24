import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Image } from 'react-native';
import {startSSE, stopSSE} from './src/services/SSEService';
import { navigationRef } from './src/navigation/NavigationService';
import { AppState } from 'react-native';

// 스크린 import
import CommunityScreen from './src/screens/community/CommunityMainScreen';
import PersonalStudyMainScreen from './src/screens/personal/PersonalStudyMainScreen';
import GroupStudyMainScreen from './src/screens/group/GroupStudyMainScreen';
import MyPageMainScreen from './src/screens/mypage/MyPageMainScreen';
import IntroScreen from './src/screens/IntroScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import FindAccountScreen from "./src/screens/auth/FindAccountScreen";
import ResetPasswordScreen from "./src/screens/auth/ResetPasswordScreen";
import KakaoMapScreen from "./src/screens/location/KakaoMapScreen";


import GuardianModeSelectionScreen from './src/screens/mode/GuardianModeSelectionScreen';
import UserModeSelectionScreen from './src/screens/mode/UserModeSelectScreen'
import GuardianLoginScreen from './src/screens/auth/GuardianLoginScreen';
import GuardianRegisterScreen from './src/screens/auth/GuardianRegisterScreen';
import UserLoginScreen from './src/screens/auth/UserLoginScreen';
import UserRegisterScreen from './src/screens/auth/UserRegisterScreen';
import TestHomeScreen from "./src/screens/testscreen/TestHomeScreen";
import TestMyPageScreen from "./src/screens/testscreen/TestMyPageScreen";
import TestCommunityScreen from "./src/screens/testscreen/TestCommunityScreen";
import TestSearchScreen from "./src/screens/testscreen/TestSearchScreen";
import TestLoginScreen from "./src/screens/testscreen/TestLoginScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ✅ 탭 아이콘 및 스타일 설정
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
            case '보호자 설정':
                iconPath = require('./src/assets/community.png');
                break;
            case '기타 설정':
                iconPath = require('./src/assets/mypage.png');
                break;
        }

        const iconColor = focused ? '#007AFF' : '#A9A9A9';

        return (
            <Image
                source={iconPath}
                style={{
                    width: size,
                    height: size,
                    // tintColor: iconColor  // 아이콘 색상 조정 필요 시 사용
                }}
            />
        );
    },
    tabBarActiveTintColor: '#007AFF',
    tabBarInactiveTintColor: '#A9A9A9',
});

// ✅ 메인 탭 네비게이터
const MainTabNavigator = () => (
    <Tab.Navigator screenOptions={screenOptions}>
        <Tab.Screen name="홈 키" component={TestHomeScreen} />
        <Tab.Screen name="지폐 인식" component={TestSearchScreen} />
        <Tab.Screen name="보호자 설정" component={TestCommunityScreen} />
        <Tab.Screen name="기타 설정" component={TestMyPageScreen} />
    </Tab.Navigator>
);

// ✅ 앱 전체 구성
const App = () => {
    useEffect(() => {
        startSSE(); // 앱 실행 시 최초 연결

        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                console.log("🔙 앱이 포그라운드로 돌아옴 → SSE 재연결 시도");
                startSSE(); // 이미 연결돼 있으면 무시됨
            }
        });

        return () => {
            stopSSE(); // 앱 unmount 시 SSE 정리
            subscription.remove(); // 이벤트 리스너 해제
        };
    }, []);

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
                <Stack.Screen name="TestHomeScreen" component={TestHomeScreen} />
                <Stack.Screen name="TestCommunityScreen" component={TestCommunityScreen} />
                <Stack.Screen name="TestMyPageScreen" component={TestMyPageScreen} />
                <Stack.Screen name="TestSearchScreen" component={TestSearchScreen} />

                {/* 4/24 메인 이전 로그인/회원가입 화면 */}
                <Stack.Screen name="GuardianModeSelectionScreen" component={GuardianModeSelectionScreen} />
                <Stack.Screen name="UserModeSelectionScreen" component={UserModeSelectionScreen} />

                {/* 4/24 프론트화면*/}

                <Stack.Screen name="GuardianRegisterScreen" component={GuardianRegisterScreen} />
                <Stack.Screen name="GuardianLoginScreen" component={GuardianLoginScreen} />
                <Stack.Screen name="UserRegisterScreen" component={UserRegisterScreen} />
                <Stack.Screen name="UserLoginScreen" component={UserLoginScreen} />



                {/* 메인 탭 */}
                <Stack.Screen name="Main" component={MainTabNavigator} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;
