import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const FavoriteScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>즐겨찾기 페이지입니다</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fffacd',  // 배경색 설정
        alignItems: 'center',
        justifyContent: 'center',
    },

    // 가장자리에 완전히 붙고, 위쪽은 살짝 내려서 여백을 추가한 스타일
    mapContainer: {
        position: 'absolute', // 화면의 가장자리에 배치
        top: 100, // 상단을 살짝 내리기 (원하는 만큼 조정 가능)
        left: 0, // 왼쪽 끝에 붙이기
        right: 0, // 오른쪽 끝에 붙이기
        bottom: 0, // 아래쪽 끝에 붙이기
        borderWidth: 2, // 파란 테두리 두께
        borderColor: 'blue', // 파란 테두리 색상
    },

    // 지도 위에 텍스트를 배치할 컨테이너 스타일
    textContainer: {
        position: 'absolute',
        top: 10,  // 지도에서 위쪽으로 여백을 설정
        left: 10, // 왼쪽 여백 설정
        right: 10, // 오른쪽 여백 설정
        backgroundColor: 'rgba(255, 255, 255, 0.7)', // 반투명 배경
        padding: 10,
        borderRadius: 10, // 둥근 테두리
        zIndex: 1,  // 지도 위에 텍스트가 올라오도록 설정
    },

    // 두 항목을 가로로 배치하는 스타일
    row: {
        flexDirection: 'row',  // 가로로 배치
        justifyContent: 'space-between',  // 양쪽 끝으로 배치
        marginBottom: 6,  // 아래쪽 간격 설정
    },

    // 텍스트 스타일
    text: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',  // 파란색 텍스트
        marginBottom: 5,
    },

    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#007BFF',
        marginBottom: 30,
    },
    logo: {
        width: 20,  // 이미지의 가로 크기
        height: 20,  // 이미지의 세로 크기
    },
});

export default FavoriteScreen;
