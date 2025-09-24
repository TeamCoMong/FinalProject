import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';

const GuardianRegisterHelpScreen = ({ navigation }) => {
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
        navigation.navigate('MyGuardianListScreen');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>👨‍👩‍👧‍👦 {t('guardianHelp.title')}</Text>
            <Text style={styles.content}>
                {t('guardianHelp.description')}
            </Text>

            <TouchableOpacity style={styles.button} onPress={handleNavigate}>
                <Text style={styles.buttonText}>{t('guardianHelp.button')}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 20,
        color: '#1565C0',
        textShadowColor: '#BBDEFB',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,
    },
    content: {
        fontSize: 18,
        color: '#37474F',
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    button: {
        backgroundColor: '#42A5F5',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#0D47A1',
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

export default GuardianRegisterHelpScreen;
