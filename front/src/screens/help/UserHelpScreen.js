import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const UserHelpScreen = () => {
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>도움말</Text>
            <View style={styles.textContainer}>
                <Text style={styles.text}>
                    이 앱은 AI 기반 보행 보조 앱으로, 시각장애인들이 더 안전하고 편리하게 이동할 수 있도록 돕습니다.
                    사용자에게 실시간으로 환경 정보를 제공하고, 주변 장애물을 탐지하여 안내합니다.
                </Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.subTitle}>주요 기능:</Text>
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.text}>
                    1. 실시간 장애물 탐지: 사용자의 앞에 있는 장애물을 감지하여 경고음과 진동으로 알려줍니다.
                </Text>
                <Text style={styles.text}>
                    2. 음성 내비게이션: 목적지까지 음성으로 길을 안내합니다.
                </Text>
                <Text style={styles.text}>
                    3. 안전 구역 설정: 지정된 안전 구역을 벗어나지 않도록 알림을 제공합니다.
                </Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.subTitle}>앱 사용 방법:</Text>
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.text}>
                    1. 앱을 실행하고, 사용자의 위치를 확인합니다.
                </Text>
                <Text style={styles.text}>
                    2. 길 찾기 시작을 클릭하여 목적지를 설정합니다.
                </Text>
                <Text style={styles.text}>
                    3. 음성 안내에 따라 안전하게 이동하세요.
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f8ff',  // 배경색 설정
        padding: 20,  // 여백 추가
    },

    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#007BFF', // 제목 색상
        textAlign: 'center',
        marginBottom: 20, // 제목 아래 간격
    },

    subTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',  // 서브 제목 색상
        marginTop: 20,
        marginBottom: 10, // 간격 설정
    },

    textContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)', // 반투명 흰색 배경
        padding: 15,
        borderRadius: 10,
        marginBottom: 15, // 항목 간격 설정
    },

    text: {
        fontSize: 16,
        color: '#000000',  // 검정색 텍스트
        lineHeight: 24, // 줄 간격 설정
        marginBottom: 8, // 항목 간격 설정
    },

    row: {
        flexDirection: 'row',  // 가로로 배치
        justifyContent: 'space-between',  // 양쪽 끝으로 배치
        marginBottom: 4,  // 아래쪽 간격 설정
    },

    logo: {
        width: 20,  // 이미지의 가로 크기
        height: 20,  // 이미지의 세로 크기
    },
});

export default UserHelpScreen;
