import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';

const SettingScreen = ({ navigation }) => {
    const { t, i18n } = useTranslation();
    const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
    const [isVoiceFeedbackEnabled, setIsVoiceFeedbackEnabled] = useState(true);

    const handleToggleLanguage = () => {
        const newLang = i18n.language === 'ko' ? 'en' : 'ko';
        i18n.changeLanguage(newLang);
    };

    const handleLogout = () => {
        navigation.navigate('LoginScreen');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t('settings.title')}</Text>

            <View style={styles.settingRow}>
                <Text style={styles.settingText}>
                    {t('settings.language')}: {i18n.language === 'ko' ? '한국어' : 'English'}
                </Text>
                <TouchableOpacity style={styles.languageButton} onPress={handleToggleLanguage}>
                    <Text style={styles.buttonText}>{t('settings.change_language')}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.settingRow}>
                <Text style={styles.settingText}>{t('settings.notifications')}</Text>
                <Switch
                    value={isNotificationEnabled}
                    onValueChange={() => setIsNotificationEnabled(!isNotificationEnabled)}
                />
            </View>

            <View style={styles.settingRow}>
                <Text style={styles.settingText}>{t('settings.voice_feedback')}</Text>
                <Switch
                    value={isVoiceFeedbackEnabled}
                    onValueChange={() => setIsVoiceFeedbackEnabled(!isVoiceFeedbackEnabled)}
                />
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('MyProfileInfoScreen')}>
                <Text style={styles.buttonText}>🔑 {t('settings.details')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>{t('settings.logout')}</Text>
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
        backgroundColor: '#4CAF50',
        paddingVertical: 12,           // 살짝 줄이기
        paddingHorizontal: 24,         // ✅ 기존 40 → 24
        borderRadius: 30,
        marginTop: 10,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#888',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        minWidth: undefined            // ✅ 제거하거나 숫자 축소
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