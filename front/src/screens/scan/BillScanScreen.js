import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BillScanScreen = () => {
    return (
        <View style={styles.container}>
            <View style={styles.mapContainer}>
                <View style={styles.cameraFrame}>
                    <Text style={styles.instructionText}>
                        확인하고 싶은 지폐를 화면에 올려주세요
                    </Text>
                </View>
            </View>
            {/* 금액은 파란색 프레임 바깥에 표시 */}
            <View style={styles.amountContainer}>
                <Text style={styles.amountText}>
                    금액: ________________ (원)
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f8ff',  // 배경색을 약간 수정하여 부드러운 하늘색으로 변경
        alignItems: 'center',
        justifyContent: 'center',
    },

    // 카메라 프리뷰 영역을 화면의 가장자리에 배치
    mapContainer: {
        position: 'absolute',
        top: 100,
        left: 0,
        right: 0,
        bottom: 0,
        borderWidth: 2,  // 파란 테두리 두께
        borderColor: 'blue',  // 파란 테두리 색상
        borderRadius: 15,  // 둥근 모서리
    },

    // 카메라가 비춰지는 영역, 안쪽 프레임
    cameraFrame: {
        flex: 1,
        margin: 20, // 바깥 테두리와 안쪽 프레임 사이의 여백
        borderWidth: 2,
        borderColor: 'green', // 카메라 프레임의 색상은 녹색으로 설정
        borderRadius: 10, // 둥근 모서리
    },

    // 지폐 올려달라는 텍스트 스타일
    instructionText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'center',
        marginTop: 30,  // 상단 여백 추가
    },

    // 금액 표시 영역 스타일 (파란색 프레임 바깥쪽으로 이동)
    amountContainer: {
        position: 'absolute',
        bottom: 30, // 화면 하단에 고정
        left: 0,
        right: 0,
        alignItems: 'center',
    },

    // 금액 텍스트 스타일
    amountText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
    },
});

export default BillScanScreen;
