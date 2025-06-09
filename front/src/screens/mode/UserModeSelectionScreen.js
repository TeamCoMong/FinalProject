import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next'; // ✅ 추가

const UserModeSelectionScreen = ({ navigation }) => {
    const { t } = useTranslation(); // ✅ 번역 함수

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.replace('Intro')}>
                <Image source={require('../../assets/back-button.png')} style={styles.backButtonIcon} />
            </TouchableOpacity>

            <View style={styles.logoContainer}>
                <Image source={require('../../assets/schoolboy2.png')} style={styles.logo} />
                <View style={styles.textWrapper}>
                    <Text style={styles.appName}>{t('userMode.title')}</Text>
                </View>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('UserMain')}>
                    <Image source={require('../../assets/login.png')} style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>{t('userMode.login')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.signUpButton} onPress={() => navigation.navigate('UserRegisterScreen')}>
                    <Image source={require('../../assets/join.png')} style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>{t('userMode.signup')}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.iconSection}>
                <View style={styles.iconCard}>
                    <Image source={require('../../assets/joomin_map.png')} style={styles.icon} />
                    <Text style={styles.iconLabel}>{t('userMode.guide')}</Text>
                </View>
                <View style={styles.iconCard}>
                    <Image source={require('../../assets/technology.png')} style={styles.icon} />
                    <Text style={styles.iconLabel}>{t('userMode.voice')}</Text>
                </View>
                <View style={styles.iconCard}>
                    <Image source={require('../../assets/login_obstacles.png')} style={styles.icon} />
                    <Text style={styles.iconLabel}>{t('userMode.obstacle')}</Text>
                </View>
            </View>

            <View style={styles.footerContainer}>
                <Text style={styles.footerText}>{t('common.createdBy')}</Text>
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
        top: 50, // 숫자가 작을수록 위로 감
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
        justifyContent: 'center', // ✅ 세로 방향 중앙 정렬
    },

    appName: {
        fontSize: 35,
        fontWeight: 'bold',
        color: '#cd5c5c',
        marginTop: -5, // ⬅️ 숫자를 조절하면서 테스트 (예: -2, -3, -5)
    },

    buttonContainer: {
        flexDirection: 'column',
        width: '90%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 180, // 더 아래쪽에 위치
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
        elevation: 3, // 안드로이드 그림자
        shadowColor: '#000', // iOS 그림자
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
        marginLeft: 50, // 이미지와 텍스트 사이의 간격을 늘림
    },

    // 이미지 스타일
    buttonIcon: {
        width: 120,
        height: 120, // 이미지 크기 설정
    },

    iconSection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '90%',
        marginTop: 30, // 마진 탑을 적당히 설정
        marginBottom: 10,
        alignSelf: 'center',  // 가운데 정렬을 위해 추가
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
        fontWeight: '600', // 글씨 굵게
    },

    footerContainer: {
        flexDirection: 'row', // 가로 정렬
        alignItems: 'center', // 세로 중앙 정렬
        justifyContent: 'center', // 가운데 정렬
        position: 'absolute',
        bottom: 10,
        width: '100%',
    },
    footerText: {
        fontSize: 12,
        color: '#000', // 검정색으로 변경
        textAlign: 'center',
        marginRight: 5, // 아이콘과 간격 추가
        fontWeight: '600', // 글씨 굵게
    },
    footerIcon: {
        width: 14, // 아이콘 크기 조정
        height: 14,
    },

    // 뒤로 가기 버튼 스타일
    backButton: {
        position: 'absolute',
        top: 20, // 상단에서의 거리 조정
        left: 10, // 좌측에서의 거리 조정
        zIndex: 1, // 버튼이 다른 요소들 위에 위치하도록 설정
    },
    backButtonIcon: {
        width: 30, // 작은 크기로 설정
        height: 30, // 작은 크기로 설정
    },
});

export default UserModeSelectionScreen;
