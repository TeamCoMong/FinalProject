import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TouchableWithoutFeedback, View, Text, StyleSheet } from 'react-native'; // Text, StyleSheet 사용 가능
import './src/config/firebaseConfig';
// 마이크 권한
import { PermissionsAndroid, Platform } from 'react-native';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';

import { NGROK_URL } from './src/config/ngrok';

import Sound from 'react-native-sound';

// 기존 import
import { Image, AppState } from 'react-native';
import { startSSE, stopSSE } from './src/services/SSEService';
import { navigationRef } from './src/navigation/NavigationService';

import {
    startDetectionService,
    stopDetectionService,
} from './src/services/DetectionService'; // DetectionService 경로 확인!

// 스크린 import (기존과 동일하게 유지)

import HomeStartScreen from "./src/screens/start/HomeStartScreen";
import BillScanScreen from "./src/screens/scan/BillScanScreen";
import SettingScreen from "./src/screens/Setting/SettingScreen";
import UserHelpScreen from "./src/screens/help/UserHelpScreen";
import NavigationHelpScreen from "./src/screens/help/NavigationHelpScreen";
import MoneyRecognitionHelpScreen from "./src/screens/help/MoneyRecognitionHelpScreen";
import LinkedGuardiansScreen from "./src/screens/help/LinkedGuardiansScreen";
import SettingsHelpScreen from "./src/screens/help/SettingsHelpScreen";
import IntroScreen from './src/screens/IntroScreen';
import FindAccountScreen from "./src/screens/auth/FindAccountScreen";
import ResetPasswordScreen from "./src/screens/auth/ResetPasswordScreen";
import KakaoMapScreen from "./src/screens/location/KakaoMapScreen";
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

import UserTmapScreen from "./src/screens/location/UserTmapScreen";
import GuardianTmapScreen from "./src/screens/location/GuardianTmapScreen";

import AdminSecondPwScreen from "./src/screens/auth/AdminSecondPwScreen";
import AdminStatsScreen from './src/screens/Admin/AdminStatsScreen';
import AdminAIDetectionScreen from './src/screens/Admin/AdminAIDetectionScreen';
import AdminSettingsScreen from './src/screens/Admin/AdminSettingsScreen';


import GuardianMapScreen from "./src/screens/location/GuardianMapScreen";

import TestPOI from "./src/screens/location/TestPOI";

// 탭 & 스택 네비게이터
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 사용자 탭 아이콘 및 스타일 설정
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
        return <Image source={iconPath} style={{ width: size, height: size }} />;
    },
    tabBarActiveTintColor: '#007AFF',
    tabBarInactiveTintColor: '#A9A9A9',
});

const playSound = (filenameWithExtension) => {
    const sound = new Sound(filenameWithExtension, Sound.MAIN_BUNDLE, (error) => {
        if (error) {
            console.error(`❌ 사운드 로드 실패 (${filenameWithExtension}):`, error);
            return;
        }
        sound.play((success) => {
            if (!success) {
                console.error(`❌ 사운드 재생 실패 (${filenameWithExtension})`);
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
// ✅ 관리자 메인 탭 네비게이터 함수형 컴포넌트
const ManagerMainTabNavigator = () => (
    <Tab.Navigator screenOptions={ManagerScreenOptions} >
        <Tab.Screen name="통계 데이터" component={AdminStatsScreen} options={{ headerShown: false}}/>
        <Tab.Screen name="AI객체감지 데이터" component={AdminAIDetectionScreen} options={{ headerShown: false}}/>
        <Tab.Screen name="관리자 설정" component={AdminSettingsScreen} options={{ headerShown: false}}/>
    </Tab.Navigator>
);

// ✅  사용자 메인 탭 네비게이터
const MainTabNavigator = () => (
    <Tab.Navigator screenOptions={userScreenOptions}>
        <Tab.Screen name="홈 키" component={HomeStartScreen} options={{ headerShown: false}} />
        {/*<Tab.Screen name="지폐 인식" component={BillScanScreen} options={{ headerShown: false}} />*/}
        <Tab.Screen name="도움말" component={UserHelpScreen} options={{ headerShown: false}} />
        <Tab.Screen name="기타 설정" component={SettingScreen} options={{ headerShown: false}} />
    </Tab.Navigator>
);

// ✅  보호자 메인 탭 네비게이터
const GuardianMainTabNavigator = ({ route }) => {
    const {guardianId} = route.params;

    return (
        <Tab.Navigator screenOptions={guardianScreenOptions}>
            <Tab.Screen name="사용자 위치확인" component={GuardianHomeScreen} />
            <Tab.Screen
                name="등록 사용자 리스트"
                component={LinkedUserListScreen}
                initialParams={{guardianId}} // ✅ 여기서 전달
            />
            <Tab.Screen name="기타 설정" component={GuardianSettingScreen}/>
        </Tab.Navigator>
    );
};



const VOICE_RECOGNITION_ALLOWED_SCREENS = [
    'Intro',
    'UserModeSelectionScreen',
    'UserLoginScreen',
    'UserRegisterScreen',
    'MoneyRecognitionHelpScreen',
    'NavigationHelpScreen',
    'UserHelpScreen',
    'SettingHelpScreen',
    'HomeStartScreen',
    'BillScanScreen',
    'MyProfileInfoScreen',
    '홈 키',
    '지폐 인식',
    '도움말',
    '기타 설정'
];


// ✅ 앱 전체 구성
const App = () => {
    const [currentRouteName, setCurrentRouteName] = useState(null);
    const [isVoiceListening, setIsVoiceListening] = useState(false);

    const routeNameRef = useRef(null);

    useEffect(() => {
        Tts.setDefaultLanguage('ko-KR');
        // 앱 시작 시 TTS 엔진 준비 (선택적이지만, 첫 TTS 지연 감소에 도움될 수 있음)
        Tts.getInitStatus().then(() => {
            console.log("TTS 엔진 초기화 완료 또는 이미 준비됨.");
        }).catch((err) => {
            if (err.code === 'no_engine') {
                Tts.requestInstallEngine();
            }
            console.error("TTS 엔진 초기화 오류:", err);
        });


        const requestPermissions = async () => {
            if (Platform.OS === 'android') {
                try {
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
                    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                        console.warn("마이크 권한이 거부되었습니다.");
                        // Tts.speak("음성 인식을 사용하려면 마이크 권한이 필요합니다."); // 사용자에게 알림
                    }
                } catch (err) {
                    console.warn("마이크 권한 요청 중 오류:", err);
                }
            }
        };

        requestPermissions();

        Voice.onSpeechResults = (e) => {
            const text = e.value?.[0];
            if (!text || text.trim() === "") {
                console.log("⚠️ 음성 인식 결과 없음 또는 빈 문자열");
                return;
            }
            console.log('🎤 인식된 말:', text);
            fetch(`${NGROK_URL}/dialogflow/message?query=${encodeURIComponent(text)}`)
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`Dialogflow 서버 응답 오류: ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    console.log('🧠 Dialogflow 응답:', data); // 서버에서 받은 그대로 출력

                    // 1. Dialogflow의 일반 응답 TTS
                    if (data && data.message) {
                        Tts.speak(data.message);
                    } else {
                        console.warn("Dialogflow 응답에 'message' 필드가 없습니다.");
                    }

                    // 2. 인텐트에 따라 DetectionService 제어
                    // data.intentName 대신 data.intent 사용!
                    if (data && data.intent) { // <--- 여기를 수정했습니다!
                        const intentName = data.intent.toLowerCase(); // <--- 여기를 수정했습니다!
                        console.log('🔍 감지된 인텐트 (수정 후):', intentName);

                        if (intentName === 'detection') {
                            console.log('🚀 "detection" 인텐트 수신. DetectionService 시작 요청.');
                            // data.message ("보행 보조를 시작할게요...")가 이미 충분한 피드백이므로
                            // 여기서 추가적인 TTS는 필요 없을 수 있습니다.
                            startDetectionService();
                        } else if (intentName === 'detection_stop') {
                            console.log('🛑 "detection_stop" 인텐트 수신. DetectionService 중지 요청.');
                            stopDetectionService();
                        }
                        // 여기에 다른 인텐트 처리 로직 추가
                    } else {
                        // 이 로그는 이제 'intent' 필드가 있다면 발생하지 않아야 합니다.
                        console.warn("Dialogflow 응답에 'intent' 필드가 없습니다. (수정 후 확인 필요)");
                    }
                })
                .catch(err => {
                    console.error('❌ Dialogflow 요청 또는 처리 오류:', err);
                    Tts.speak('죄송합니다. 다시 시도해주세요.');
                });
        };

        Voice.onSpeechError = (e) => {
            console.log('❌ 음성 인식 에러:', e.error);
            // 사용자에게 피드백 (예: "음성 인식 중 오류가 발생했습니다.")
            // Tts.speak("음성 인식 중 오류가 발생했습니다. 다시 시도해주세요.");
        };

        Voice.onSpeechEnd = () => {
            console.log('🛑 음성 인식이 끝났습니다');
            playSound('end.mp3'); // .mp3 확장자 확인
        };

        // SSE 서비스 시작
        startSSE();
        const sseSubscription = AppState.addEventListener('change', (nextState) => {
            if (nextState === 'active') {
                console.log("앱 활성화됨. SSE 재시작 (필요시).");
                startSSE();
            } else if (nextState.match(/inactive|background/)) {
                console.log("앱 비활성화됨. SSE 연결 유지 또는 중지 정책 필요.");

            }
        });


        return () => {
            // 컴포넌트 언마운트 시 정리
            console.log("App 컴포넌트 언마운트. 리소스 정리.");
            stopSSE();
            Voice.destroy().then(Voice.removeAllListeners).catch(e => console.error("Voice destroy error", e));
            sseSubscription.remove();
        };
    }, []);


    // ✅ 전체 화면 터치 시 STT 시작
    const handleStartListening = async () => {
       const activeRouteName = routeNameRef.current;
       console.log(`화면 터치됨. ${activeRouteName}, 인식 중: ${isVoiceListening}`);

       if(VOICE_RECOGNITION_ALLOWED_SCREENS.includes(activeRouteName)){
           if(isVoiceListening){
               console.log('음성인식 중 중지 시도');
               try{
                   await Voice.stop();
               } catch(e){
                   console.error('중지 실패', e);
                   setIsVoiceListening(false);
               }
           } else{
               console.log(`${activeRouteName} 화면에서 음성인식 시도.`);
               playSound('start.mp3');
               try{
                   await Voice.start('ko-KR');
               } catch(e){
                   console.error('음성인식 시작 실패', e);
               }
           }
       } else{
           console.log(`${activeRouteName} 화면은 음성인식 X`);
       }
    };

    const handleNavigationStateChange = (state) => {
        const findCurrentRoute = (navState) => {
            if (!navState) return null;
            const route = navState.routes[navState.index];
            if (route.state) {
                return findCurrentRoute(route.state); // 중첩된 네비게이터 처리
            }
            return route.name;
        };
        const currentName = findCurrentRoute(state);
        setCurrentRouteName(currentName);
        routeNameRef.current = currentName; // ref에도 업데이트
        console.log('Navigation state changed, Current Route:', currentName);
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={handleStartListening} style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                    <NavigationContainer ref={navigationRef}
                    onStateChange={handleNavigationStateChange}
                    onReady={() => {
                        const initialRouteName = navigationRef.current?.getCurrentRoute()?.name;
                        routeNameRef.current = initialRouteName;
                        setCurrentRouteName(initialRouteName);
                        console.log('Navigation Ready Initial Route: ', initialRouteName);
                    }}>
                        <Stack.Navigator initialRouteName="Intro" screenOptions={{ headerShown: false }}>
                            {/* 모든 스크린 정의 */}
                            <Stack.Screen name="Intro" component={IntroScreen} />
                            <Stack.Screen name="FindAccount" component={FindAccountScreen} />
                            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
                            <Stack.Screen name="KakaoMap" component={KakaoMapScreen} />

                            {/* 사용자 테스트 전용 */}
                            <Stack.Screen name="UserTmapScreen" component={UserTmapScreen} />
                            {/* 보호자 테스트 전용 */}
                            <Stack.Screen name="GuardianTmapScreen" component={GuardianTmapScreen} />
                            {/* 보호자 테스트 2222 */}
                            <Stack.Screen name="GuardianMapScreen" component={GuardianMapScreen} />

                            {/* POT 테스트 2222 */}
                            <Stack.Screen name="TestPOI" component={TestPOI} />

                            {/*창현 T-map 스크린 끝*/}
                            {/* 4/24 메인 이전 로그인/회원가입 화면 */}
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
                            <Stack.Screen name="LinkedGuardiansScreen" component={LinkedGuardiansScreen} />
                            <Stack.Screen name="SettingsHelpScreen" component={SettingsHelpScreen} />
                            <Stack.Screen name="MainTab" component={MainTabNavigator} />
                            <Stack.Screen name="MyProfileInfoScreen" component={MyProfileInfoScreen} />
                            <Stack.Screen name="GuardianMain" component={GuardianMainTabNavigator} />
                            <Stack.Screen name="ManagerMain" component={ManagerMainTabNavigator} />

                            <Stack.Screen name="AdminSecondPwScreen" component={AdminSecondPwScreen} />
                        </Stack.Navigator>
                    </NavigationContainer>
                </View>
            </TouchableWithoutFeedback>
        </GestureHandlerRootView>
    );
};

export default App;