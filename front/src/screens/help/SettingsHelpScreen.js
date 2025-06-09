import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';

const SettingsHelpScreen = ({ navigation }) => {
    const { t } = useTranslation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerLeft}>
                    <Image source={require('../../assets/left-arrow.png')} style={styles.arrowIcon} />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    const handleNavigate = () => {
        navigation.navigate('UserMain', {
            screen: t('tabs.settings'), // 다국어 탭 라벨 사용
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>⚙️ {t('settingsHelp.title')}</Text>
            <Text style={styles.content}>
                {t('settingsHelp.description')}
            </Text>

            <TouchableOpacity style={styles.button} onPress={handleNavigate}>
                <Text style={styles.buttonText}>{t('settingsHelp.button')}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3E5F5',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 20,
        color: '#8E24AA',
        textShadowColor: '#F8BBD0',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,
    },
    content: {
        fontSize: 18,
        color: '#5E35B1',
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    button: {
        backgroundColor: '#AB47BC',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#8E24AA',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    headerLeft: {
        marginLeft: 10,
    },
    arrowIcon: {
        width: 30,
        height: 30,
    },
});

export default SettingsHelpScreen;
