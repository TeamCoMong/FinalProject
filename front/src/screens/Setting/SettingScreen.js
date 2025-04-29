import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';

const SettingScreen = ({ navigation }) => {
    // 설정 상태 관리
    const [language, setLanguage] = useState('한국어'); // 기본 언어 설정
    const [isNotificationEnabled, setIsNotificationEnabled] = useState(true); // 알림 설정
    const [isVoiceFeedbackEnabled, setIsVoiceFeedbackEnabled] = useState(true); // 음성 피드백 설정

    // 로그아웃 기능
    const handleLogout = () => {
        // 로그아웃 동작 예시
        // 여기서는 간단히 로그인 화면으로 이동하도록 설정
        // 실제로는 세션 초기화 등을 해야 할 수 있습니다.
        navigation.navigate('LoginScreen');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>내 설정</Text>

            {/* 언어 설정 */}
            <View style={styles.settingRow}>
                <Text style={styles.settingText}>언어: {language}</Text>
                <TouchableOpacity
                    style={styles.languageButton} // 별도의 스타일 적용
                    onPress={() => {
                        setLanguage(language === '한국어' ? 'English' : '한국어');
                    }}
                >
                    <Text style={styles.buttonText}>언어 변경</Text>
                </TouchableOpacity>
            </View>

            {/* 알림 설정 */}
            <View style={styles.settingRow}>
                <Text style={styles.settingText}>알림</Text>
                <Switch
                    value={isNotificationEnabled}
                    onValueChange={() => setIsNotificationEnabled(!isNotificationEnabled)}
                />
            </View>

            {/* 음성 피드백 설정 */}
            <View style={styles.settingRow}>
                <Text style={styles.settingText}>음성 피드백</Text>
                <Switch
                    value={isVoiceFeedbackEnabled}
                    onValueChange={() => setIsVoiceFeedbackEnabled(!isVoiceFeedbackEnabled)}
                />
            </View>

            {/* 내 고유 코드 번호, 등록한 사용자 보기 버튼 (열쇠 아이콘) */}
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('MyProfileInfoScreen')}>
                <Text style={styles.buttonText}>🔑상세 정보</Text>
            </TouchableOpacity>


            {/* 로그아웃 버튼 */}
            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>로그 아웃</Text>
            </TouchableOpacity>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E0F7FA', // 하늘색 배경
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#333333', // 어두운 색으로 텍스트
        marginBottom: 60,
        fontFamily: 'sans-serif-medium',
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 25, // 각 항목 사이에 여유 공간 추가
    },
    settingText: {
        fontSize: 20, // 폰트 크기 키움
        fontWeight: '500', // 텍스트 강조
        color: '#333', // 어두운 색으로 텍스트
        marginRight: 15, // 각 항목 간의 간격 조정
    },
    button: {
        backgroundColor: '#4CAF50', // 기본적인 초록색 버튼
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        marginTop: 20, // 각 버튼 간격을 일정하게 유지
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5, // 그림자 효과
        shadowColor: '#888',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        minWidth: '80%', // 버튼 크기 동일하게 맞추기 위해 최소 너비 설정
    },
    languageButton: {
        backgroundColor: '#4CAF50', // 기존 버튼 스타일 그대로 유지
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        marginTop: 10, // 기존 버튼보다 약간 위로 올림
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#888',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        minWidth: '70%', // "언어 변경" 버튼 크기 줄이기
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'sans-serif',
        textAlign: 'center',
    },
    logoutButton: {
        backgroundColor: '#fff', // 흰색 배경
        borderWidth: 2,
        borderColor: '#F44336', // 빨간색 테두리
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        marginTop: 20, // 기존 버튼들과 간격 유지
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5, // 그림자 효과
        shadowColor: '#888',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        minWidth: '80%',
    },
    logoutButtonText: {
        color: '#F44336', // 빨간색 텍스트
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'sans-serif',
        textAlign: 'center',
    }
});

export default SettingScreen;
