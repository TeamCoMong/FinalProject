import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Image, TouchableWithoutFeedback, PermissionsAndroid, Platform, AppState, View } from 'react-native';

import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import Sound from 'react-native-sound';

import { NGROK_URL } from './src/config/ngrok';
import { startSSE, stopSSE } from './src/services/SSEService';
import { navigationRef } from './src/navigation/NavigationService';

import Camera from "./src/screens/Camera";
import TestBiometricsScreen from "./src/screens/testscreen/TestBiometricsScreen";


import ManagerTempScreen2 from "./src/screens/testscreen/ManagerTempScreen2"; // 관리자 임시 통계탭 2
import ManagerSettingScreen from "./src/screens/Setting/ManagerSettingScreen"; // 관리자 세팅 페이지

import HomeStartScreen from "./src/screens/start/HomeStartScreen";
import BillScanScreen from "./src/screens/scan/BillScanScreen";
import SettingScreen from "./src/screens/Setting/SettingScreen";
import UserHelpScreen from "./src/screens/help/UserHelpScreen";

import NavigationHelpScreen from "./src/screens/help/NavigationHelpScreen";
import MoneyRecognitionHelpScreen from "./src/screens/help/MoneyRecognitionHelpScreen";
import GuardianRegisterHelpScreen from "./src/screens/help/GuardianRegisterHelpScreen";
import SettingsHelpScreen from "./src/screens/help/SettingsHelpScreen";

import IntroScreen from './src/screens/IntroScreen';
import FindAccountScreen from "./src/screens/auth/FindAccountScreen";
import ResetPasswordScreen from "./src/screens/auth/ResetPasswordScreen";

import MyProfileInfoScreen from "./src/screens/Setting/MyProfileInfoScreen";

import GuardianHomeScreen from "./src/screens/start/GuardianHomeScreen";
import GuardianSettingScreen from "./src/screens/Setting/GuardianSettingScreen";
import LinkedUserListScreen from "./src/screens/list/LinkedUserListScreen";
import AddNewUserScreen from "./src/screens/list/AddNewUserScreen";

import GuardianModeSelectionScreen from './src/screens/mode/GuardianModeSelectionScreen';
import UserModeSelectionScreen from './src/screens/mode/UserModeSelectionScreen';

import GuardianLoginScreen from './src/screens/auth/GuardianLoginScreen';
import GuardianRegisterScreen from './src/screens/auth/GuardianRegisterScreen';
import UserLoginScreen from './src/screens/auth/UserLoginScreen';
import UserRegisterScreen from './src/screens/auth/UserRegisterScreen';
import ManagerTempScreen from "./src/screens/testscreen/ManagerTempScreeen";
import AdminSecondPwScreen from "./src/screens/auth/AdminSecondPwScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const userScreenOptions = ({ route }) => ({
    tabBarIcon: ({ size }) => {
        let iconPath;
        switch (route.name) {
            case '홈 키':
                iconPath = require('./src/assets/home.png');
                break;
            case '지폐 인식':
                iconPath = require('./src/assets/search.png');
                break;
            case '도움말':
                iconPath = require('./src/assets/info.png');
                break;
            case '기타 설정':
                iconPath = require('./src/assets/gear.png');
                break;
        }
        return <Image source={iconPath} style={{ width: size, height: size }} />;
    },
    tabBarActiveTintColor: '#007AFF',
    tabBarInactiveTintColor: '#A9A9A9',
});

const guardianScreenOptions = ({ route }) => ({
    tabBarIcon: ({ size }) => {
        let iconPath;
        switch (route.name) {
            case '사용자 위치확인':
                iconPath = require('./src/assets/schoolboy2.png');
                break;
            case '등록 사용자 리스트':
                iconPath = require('./src/assets/userList.png');
                break;
            case '기타 설정':
                iconPath = require('./src/assets/gear.png');
                break;
        }
        return <Image source={iconPath} style={{ width: size, height: size }} />;
    },
    tabBarActiveTintColor: '#007AFF',
    tabBarInactiveTintColor: '#A9A9A9',
});

const MainTabNavigator = () => (
    <Tab.Navigator screenOptions={userScreenOptions}>
        <Tab.Screen name="홈 키" component={HomeStartScreen} />
        <Tab.Screen name="지폐 인식" component={BillScanScreen} />
        <Tab.Screen name="도움말" component={UserHelpScreen} />
        <Tab.Screen name="기타 설정" component={SettingScreen} />
    </Tab.Navigator>
);


// ✅  관리자 메인 탭 네비게이터
const ManagerMainTabNavigator = () => (
    <Tab.Navigator screenOptions={ManagerScreenOptions}>
        <Tab.Screen name="통계 데이터" component={ManagerTempScreen} />
        <Tab.Screen name="AI객체감지 데이터" component={ManagerTempScreen2} />
        <Tab.Screen name="관리자 설정" component={ManagerSettingScreen} />
    </Tab.Navigator>
);


const GuardianMainTabNavigator = ({ route }) => {
    const { guardianId } = route.params;

    return (
        <Tab.Navigator screenOptions={guardianScreenOptions}>
            <Tab.Screen name="사용자 위치확인" component={GuardianHomeScreen} />
            <Tab.Screen name="등록 사용자 리스트" component={LinkedUserListScreen} initialParams={{ guardianId }} />
            <Tab.Screen name="기타 설정" component={GuardianSettingScreen} />
        </Tab.Navigator>
    );
};

const playSound = (filename) => {
    const sound = new Sound(filename, Sound.MAIN_BUNDLE, (error) => {
        if (error) {
            console.error('❌ 사운드 로드 실패:', error);
            return;
        }
        sound.play((success) => {
            if (!success) {
                console.error('❌ 사운드 재생 실패');
            }
            sound.release();
        });
    });
};

// ✅ 관리자 탭 아이콘 및 스타일 설정Add commentMore actions
const ManagerScreenOptions = ({ route }) => ({
    tabBarIcon: ({ focused, size }) => {
        let iconPath;
        switch (route.name) {
            case '통계 데이터':
                iconPath = require('./src/assets/manage-data.png');
                break;
            case 'AI객체감지 데이터' :
                iconPath = require('./src/assets/manage-data2.png');
                break;
            case '관리자 설정':
                iconPath = require('./src/assets/gear.png');
                break;
        }
        return (
            <Image source={iconPath} style={{ width: size, height: size }} />
        );
    },
    tabBarActiveTintColor: '#007AFF',
    tabBarInactiveTintColor: '#A9A9A9',



});





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
            fetch(`${NGROK_URL}/dialogflow/message?query=${encodeURIComponent(text)}`)
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

        Voice.onSpeechEnd = () => {
            console.log('🛑 음성 인식이 끝났습니다');
            playSound('end');
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

    const handleStartListening = async () => {
        try {
            console.log('🟢 음성 인식이 시작되었습니다');
            playSound('start');
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
                            <Stack.Screen name="FindAccount" component={FindAccountScreen} />
                            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

                            <Stack.Screen name="GuardianModeSelectionScreen" component={GuardianModeSelectionScreen} />
                            <Stack.Screen name="UserModeSelectionScreen" component={UserModeSelectionScreen} />

                            <Stack.Screen name="GuardianRegisterScreen" component={GuardianRegisterScreen} />
                            <Stack.Screen name="GuardianLoginScreen" component={GuardianLoginScreen} />
                            <Stack.Screen name="UserRegisterScreen" component={UserRegisterScreen} />
                            <Stack.Screen name="UserLoginScreen" component={UserLoginScreen} />
                            <Stack.Screen name="AddNewUserScreen" component={AddNewUserScreen} />

                            <Stack.Screen name="BillScanScreen" component={BillScanScreen} />
                            <Stack.Screen name="HomeStartScreen" component={HomeStartScreen} />

                            <Stack.Screen name="NavigationHelpScreen" component={NavigationHelpScreen} />
                            <Stack.Screen name="MoneyRecognitionHelpScreen" component={MoneyRecognitionHelpScreen} />
                            <Stack.Screen name="GuardianRegisterHelpScreen" component={GuardianRegisterHelpScreen} />
                            <Stack.Screen name="SettingsHelpScreen" component={SettingsHelpScreen} />

                            <Stack.Screen name="MyProfileInfoScreen" component={MyProfileInfoScreen} />
                            <Stack.Screen name="UserMain" component={MainTabNavigator} />
                            <Stack.Screen name="GuardianMain" component={GuardianMainTabNavigator} />
                            <Stack.Screen name="ManagerMain" component={ManagerMainTabNavigator} />
                            <Stack.Screen name="AdminSecondPwScreen" component={AdminSecondPwScreen} />
                            <Stack.Screen name="Camera" component={Camera} />
                        </Stack.Navigator>
                    </NavigationContainer>
                </View>
            </TouchableWithoutFeedback>
        </GestureHandlerRootView>
    );
};

export default App;
