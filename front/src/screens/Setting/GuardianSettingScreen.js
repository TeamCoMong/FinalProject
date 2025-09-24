import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useTranslation } from 'react-i18next'; // ✅ 다국어 처리

const GuardianSettingScreen = ({ navigation }) => {
    const { t } = useTranslation(); // ✅ 번역 훅

    const [language, setLanguage] = useState('한국어');
    const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
    const [isVoiceFeedbackEnabled, setIsVoiceFeedbackEnabled] = useState(true);

    const handleLogout = () => {
        navigation.replace('GuardianLoginScreen');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t('settings.title')}</Text>

            {/* 언어 설정 */}
            <View style={styles.settingRow}>
                <Text style={styles.settingText}>{t('settings.language')}: {language}</Text>
                <TouchableOpacity
                    style={styles.languageButton}
                    onPress={() => {
                        const newLang = language === '한국어' ? 'English' : '한국어';
                        setLanguage(newLang);
                        // 실제 언어 변경
                        const i18nLang = newLang === '한국어' ? 'ko' : 'en';
                        i18n.changeLanguage(i18nLang);
                    }}
                >
                    <Text style={styles.buttonText}>{t('settings.changeLanguage')}</Text>
                </TouchableOpacity>
            </View>

            {/* 알림 설정 */}
            <View style={styles.settingRow}>
                <Text style={styles.settingText}>{t('settings.notifications')}</Text>
                <Switch
                    value={isNotificationEnabled}
                    onValueChange={() => setIsNotificationEnabled(!isNotificationEnabled)}
                />
            </View>

            {/* 음성 피드백 설정 */}
            <View style={styles.settingRow}>
                <Text style={styles.settingText}>{t('settings.voiceFeedback')}</Text>
                <Switch
                    value={isVoiceFeedbackEnabled}
                    onValueChange={() => setIsVoiceFeedbackEnabled(!isVoiceFeedbackEnabled)}
                />
            </View>

            {/* 로그아웃 버튼 */}
            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>{t('settings.logout')}</Text>
            </TouchableOpacity>
        </View>
    );
};

export default GuardianSettingScreen;
