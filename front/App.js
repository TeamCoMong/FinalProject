import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TouchableWithoutFeedback } from 'react-native';

// 마이크 권한
import { PermissionsAndroid, Platform } from 'react-native';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';

import { View } from 'react-native';

import { NGROK_URL } from './src/config/ngrok';

import Sound from 'react-native-sound';

// 👉 기존 import

import { Image, AppState } from 'react-native';
import { startSSE, stopSSE } from './src/services/SSEService';
import { navigationRef } from './src/navigation/NavigationService';


// 스크린 import
import LoadingScreen from "./src/screens/LoadingScreen"
//사용자 탭 네비게이션 4개 (그중 하나를 즐겨찾기,도움말 중 뭐 넣을지 고민중 4/27 -주민-


import UserHelpScreen from "./src/screens/help/UserHelpScreen"; // 사용자 도움말 페이지

import HomeStartScreen from "./src/screens/start/HomeStartScreen";
import BillScanScreen from "./src/screens/scan/BillScanScreen";
import SettingScreen from "./src/screens/Setting/SettingScreen";
//도움말 각 버튼 페이지 (사용자 메인 탭)
import NavigationHelpScreen from "./src/screens/help/NavigationHelpScreen";  // 사용자 도움말 - 길 안내 기능
import MoneyRecognitionHelpScreen from "./src/screens/help/MoneyRecognitionHelpScreen"; // 지폐 인식 기능
import GuardianRegisterHelpScreen from "./src/screens/help/GuardianRegisterHelpScreen"; // 보호자 연동 기능
import SettingsHelpScreen from "./src/screens/help/SettingsHelpScreen"; // 기타 설정 기능

import MyGuardianListScreen from "./src/screens/list/MyGuardianListScreen"; // 사용자 - 나를 등록한 보호자 (설정)

import IntroScreen from './src/screens/IntroScreen'; // 어플리케이션 시작 페이지 ( 사용자,보호자 모드 설정)
import FindAccountScreen from "./src/screens/auth/FindAccountScreen"; // 계정 찾기 ( 제작 x )
import ResetPasswordScreen from "./src/screens/auth/ResetPasswordScreen"; //  현재 제작 x
import KakaoMapScreen from "./src/screens/location/KakaoMapScreen"; // 창현 테스트 파일

import GuardianHomeScreen from "./src/screens/start/GuardianHomeScreen"; // 보호자 모드 메인 시작화면 ( 사용자 현재 위치 보기 페이지 )
import GuardianSettingScreen from "./src/screens/Setting/GuardianSettingScreen"; // 보호자 모드 환경 설정
import LinkedUserListScreen from "./src/screens/list/LinkedUserListScreen"; // 보호자 모드 - 보호자가 등록한 사용자 리스트 페이지
import AddNewUserScreen from "./src/screens/list/AddNewUserScreen"; // 보호자 모드 - 새로운 사용자 추가

import GuardianModeSelectionScreen from './src/screens/mode/GuardianModeSelectionScreen'; // 보호자 모드 (로그인/회원가입) 페이지
import UserModeSelectionScreen from './src/screens/mode/UserModeSelectionScreen' // 사용자 모드 (로그인/회원가입) 페이지

import GuardianLoginScreen from './src/screens/auth/GuardianLoginScreen'; // 보호자 로그인 페이지
import GuardianRegisterScreen from './src/screens/auth/GuardianRegisterScreen'; // 보호자 회원가입 페이지
import UserLoginScreen from './src/screens/auth/UserLoginScreen'; // 사용자 로그인 페이지
import UserRegisterScreen from './src/screens/auth/UserRegisterScreen'; // 사용자 회원가입 페이지
import MyUniqueCodeScreen from "./src/screens/Setting/MyUniqueCodeScreen"; // 사용자 고유 코드 보기 페이지

import ManagerTempScreen from "./src/screens/testscreen/ManagerTempScreeen"; // 관리자 임시 통계탭 1
import ManagerTempScreen2 from "./src/screens/testscreen/ManagerTempScreen2"; // 관리자 임시 통계탭 2
import ManagerSettingScreen from "./src/screens/Setting/ManagerSettingScreen"; // 관리자 세팅 페이지

// ✅ 탭 & 스택 네비게이터
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ✅ 사용자 탭 아이콘 및 스타일 설정
const userScreenOptions = ({ route }) => ({
    tabBarIcon: ({ focused, size }) => {
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
        return (
            <Image source={iconPath} style={{ width: size, height: size }} />
        );
    },
    tabBarActiveTintColor: '#007AFF',
    tabBarInactiveTintColor: '#A9A9A9',
});

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

// ✅ 보호자 탭 아이콘 및 스타일 설정
const guardianScreenOptions = ({ route }) => ({
    tabBarIcon: ({ focused, size }) => {
        let iconPath;
        switch (route.name) {
            case '사용자 위치확인':
                iconPath = require('./src/assets/schoolboy2.png');
                break;
            case '등록 사용자 리스트' :
                iconPath = require('./src/assets/userList.png');
                break;
            case '기타 설정':
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

// ✅ 관리자 탭 아이콘 및 스타일 설정
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

// ✅  사용자 메인 탭 네비게이터
const MainTabNavigator = () => (
    <Tab.Navigator screenOptions={userScreenOptions}>
        <Tab.Screen name="홈 키" component={HomeStartScreen} />
        <Tab.Screen name="지폐 인식" component={BillScanScreen} />
        <Tab.Screen name="도움말" component={UserHelpScreen} />
        <Tab.Screen name="기타 설정" component={SettingScreen} />
    </Tab.Navigator>
);

// ✅  보호자 메인 탭 네비게이터
const GuardianMainTabNavigator = () => (
    <Tab.Navigator screenOptions={guardianScreenOptions}>
        <Tab.Screen name="사용자 위치확인" component={GuardianHomeScreen} />
        <Tab.Screen name="등록 사용자 리스트" component={LinkedUserListScreen} />
        <Tab.Screen name="기타 설정" component={GuardianSettingScreen} />
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

            playSound('end'); // end.mp3 (띠롱)
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
                        <Stack.Navigator initialRouteName="Loading" screenOptions={{ headerShown: false }}>
                            <Stack.Screen name="Loading" component={LoadingScreen} />
                            <Stack.Screen name="Intro" component={IntroScreen} />
                            <Stack.Screen name="FindAccount" component={FindAccountScreen} />
                            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
                            <Stack.Screen name="KakaoMap" component={KakaoMapScreen} />


                            {/* 4/24 메인 이전 로그인/회원가입 화면 */}
                            <Stack.Screen name="GuardianModeSelectionScreen" component={GuardianModeSelectionScreen} />
                            <Stack.Screen name="UserModeSelectionScreen" component={UserModeSelectionScreen} />

                            {/* 4/24 프론트화면*/}

                            <Stack.Screen name="GuardianRegisterScreen" component={GuardianRegisterScreen} />
                            <Stack.Screen name="GuardianLoginScreen" component={GuardianLoginScreen} />
                            <Stack.Screen name="UserRegisterScreen" component={UserRegisterScreen} />
                            <Stack.Screen name="UserLoginScreen" component={UserLoginScreen} />
                            <Stack.Screen name="AddNewUserScreen" component={AddNewUserScreen} />

                            {/* 4/28 기능별 도움말 페이지*/}

                            <Stack.Screen name="NavigationHelpScreen" component={NavigationHelpScreen} />
                            <Stack.Screen name="MoneyRecognitionHelpScreen" component={MoneyRecognitionHelpScreen} />
                            <Stack.Screen name="GuardianRegisterHelpScreen" component={GuardianRegisterHelpScreen} />
                            <Stack.Screen name="SettingsHelpScreen" component={SettingsHelpScreen} />

                            <Stack.Screen name="MyGuardianListScreen" component={MyGuardianListScreen} />
                            <Stack.Screen name="MyUniqueCodeScreen" component={MyUniqueCodeScreen} />

                            {/* 메인 탭  (사용자 / 보호자 / 관리자 */}
                            <Stack.Screen name="UserMain" component={MainTabNavigator} />
                            <Stack.Screen name="GuardianMain" component={GuardianMainTabNavigator} />
                            <Stack.Screen name="ManagerMain" component={ManagerMainTabNavigator} />
                        </Stack.Navigator>
                    </NavigationContainer>
                </View>
            </TouchableWithoutFeedback>
        </GestureHandlerRootView>
    );
};

export default App;
