import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';

const GuardianModeSelectionScreen = ({ navigation }) => {
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            {/* 🔙 뒤로가기 버튼 */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Image
                    source={require('../../assets/back-button.png')}
                    style={styles.backIcon}
                />
            </TouchableOpacity>

            {/* 👤 로고 + 앱명 */}
            <View style={styles.logoContainer}>
                <Image source={require('../../assets/protector.png')} style={styles.logo} />
                <View style={styles.textWrapper}>
                    <Text style={styles.appName}>{t('guardianMode.title', '보호자 모드')}</Text>
                </View>
            </View>

            {/* 🔐 로그인 / 회원가입 버튼 */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => navigation.navigate('GuardianLoginScreen')}
                >
                    <Image source={require('../../assets/login.png')} style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>{t('guardianMode.login', '로그인')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.signUpButton}
                    onPress={() => navigation.navigate('GuardianRegisterScreen')}
                >
                    <Image source={require('../../assets/join.png')} style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>{t('guardianMode.signup', '회원가입')}</Text>
                </TouchableOpacity>
            </View>

            {/* 🌐 기능 아이콘 설명 */}
            <View style={styles.iconSection}>
                <View style={styles.iconCard}>
                    <Image source={require('../../assets/joomin_map.png')} style={styles.icon} />
                    <Text style={styles.iconLabel}>{t('guardianMode.feature.navigation', '길안내')}</Text>
                </View>
                <View style={styles.iconCard}>
                    <Image source={require('../../assets/technology.png')} style={styles.icon} />
                    <Text style={styles.iconLabel}>{t('guardianMode.feature.voice', '음성 안내')}</Text>
                </View>
                <View style={styles.iconCard}>
                    <Image source={require('../../assets/login_obstacles.png')} style={styles.icon} />
                    <Text style={styles.iconLabel}>{t('guardianMode.feature.obstacle', '장애물 감지')}</Text>
                </View>
            </View>

            {/* 👣 푸터 */}
            <View style={styles.footerContainer}>
                <Text style={styles.footerText}>{t('common.createdBy', 'Created by CoMong')}</Text>
                <Image source={require('../../assets/copyright.png')} style={styles.footerIcon} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fffacd',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    logo: {
        width: 110,
        height: 110,
    },
    textWrapper: {
        backgroundColor: '#B0E0E6',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        marginTop: 10,
        width: '98%',
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
    },
    appName: {
        fontSize: 35,
        fontWeight: 'bold',
        color: '#cd5c5c',
        marginTop: -5,
    },
    buttonContainer: {
        flexDirection: 'column',
        width: '90%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 180,
    },
    loginButton: {
        backgroundColor: '#66cdaa',
        paddingVertical: 22,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        borderRadius: 25,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    signUpButton: {
        backgroundColor: '#00C853',
        paddingVertical: 22,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        borderRadius: 25,
        marginBottom: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    buttonText: {
        color: 'black',
        fontSize: 30,
        textAlign: 'center',
        fontWeight: 'bold',
        marginLeft: 50,
    },
    buttonIcon: {
        width: 120,
        height: 120,
    },
    iconSection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '90%',
        marginTop: 30,
        marginBottom: 10,
        alignSelf: 'center',
    },
    iconCard: {
        alignItems: 'center',
    },
    icon: {
        width: 60,
        height: 60,
        marginBottom: 10,
    },
    iconLabel: {
        fontSize: 14,
        color: '#555',
        fontWeight: '600',
    },
    footerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 10,
        width: '100%',
    },
    footerText: {
        fontSize: 12,
        color: '#000',
        textAlign: 'center',
        marginRight: 5,
        fontWeight: '600',
    },
    footerIcon: {
        width: 14,
        height: 14,
    },
    backButton: {
        position: 'absolute',
        top: 30,
        left: 20,
        zIndex: 10,
    },
    backIcon: {
        width: 24,
        height: 24,
        tintColor: '#333',
    },
});

export default GuardianModeSelectionScreen;
