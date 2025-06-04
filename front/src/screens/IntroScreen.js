import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const IntroScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image source={require('../assets/appicon2.png')} style={styles.logo} />
                <Text style={styles.appName}>SafeWalk</Text>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('UserModeSelectionScreen')}>
                    <Image source={require('../assets/blindness.png')} style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>사용자 모드</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.signUpButton} onPress={() => navigation.navigate('GuardianModeSelectionScreen')}>
                    <Image source={require('../assets/protector.png')} style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>보호자 모드</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.testButton2} onPress={() => navigation.navigate('GuardianTmapScreen')}>
                    <Text style={styles.buttonText}>보호자 길안내 테스트</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.iconSection}>
                <View style={styles.iconCard}>
                    <Image source={require('../assets/joomin_map.png')} style={styles.icon} />
                    <Text style={styles.iconLabel}>길안내</Text>
                </View>
                <View style={styles.iconCard}>
                    <Image source={require('../assets/technology.png')} style={styles.icon} />
                    <Text style={styles.iconLabel}>음성 안내</Text>
                </View>
                <View style={styles.iconCard}>
                    <Image source={require('../assets/login_obstacles.png')} style={styles.icon} />
                    <Text style={styles.iconLabel}>장애물 감지</Text>
                </View>
            </View>


             {/* face id 테스트*/}


            <View style={styles.footerContainer}>
                <Text style={styles.footerText}>Created by CoMong</Text>
                <Image source={require('../assets/copyright.png')} style={styles.footerIcon} />
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
    appName: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#cd5c5c',
        marginTop: 10,
        marginBottom: 20,
    },
    subAppName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#cd5c5c',
        marginTop: 10,
        marginBottom: 10,
    },
    mainDescription: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#D51',
        textAlign: 'center',
        marginBottom: 10,
    },
    subDescription: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
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
    // 주민 프론트 테스트 버튼 컨테이너
    singleButtonContainer: {
        width: '80%',
        marginTop: 100,
        borderRadius: 25,
    },
    // 주민 프론트 테스트 버튼 위치(임시)
    testButton2 : {
        backgroundColor: '#007BFF',
        paddingVertical: 15,
        width: '100%', // 가득 차도록 설정
        borderRadius: 25,
        alignItems: 'center', // 내부 텍스트 중앙 정렬
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
});


export default IntroScreen;