import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';

const SettingScreen = ({ navigation }) => {
    // 설정 상태 관리
    const [language, setLanguage] = useState('한국어'); // 기본 언어 설정
    const [isNotificationEnabled, setIsNotificationEnabled] = useState(true); // 알림 설정
    const [isVoiceFeedbackEnabled, setIsVoiceFeedbackEnabled] = useState(true); // 음성 피드백 설정

    return (
        <View style={styles.container}>
            <Text style={styles.title}>기타 설정</Text>

            {/* 언어 설정 */}
            <View style={styles.settingRow}>
                <Text style={styles.settingText}>언어: {language}</Text>
                <TouchableOpacity
                    style={styles.button}
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f8ff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#007BFF',
        marginBottom: 30,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    settingText: {
        fontSize: 18,
        color: '#333',
    },
    button: {
        backgroundColor: '#66cdaa',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginLeft: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default SettingScreen;
