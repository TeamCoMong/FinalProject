import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const ManagerTempScreen2 = () => {
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>AI 객체감지 데이터 </Text>

            {/* 대충 원형 그래프처럼 보이게 하는 직사각형들 */}
            <View style={styles.graphContainer}>
                <View style={[styles.graphSegment, { backgroundColor: '#ff6347', height: '50%' }]} />
                <View style={[styles.graphSegment, { backgroundColor: '#4caf50', height: '30%' }]} />
                <View style={[styles.graphSegment, { backgroundColor: '#3f51b5', height: '20%' }]} />
            </View>

            {/* 대충 채운 통계 정보 */}
            <View style={styles.statContainer}>
                <Text style={styles.statText}>AI 데이터 통계</Text>
                <Text style={styles.statText}>향상된 정확도 34건</Text>
                <Text style={styles.statText}>활동 중인 센서: 8개</Text>
                <Text style={styles.statText}>누적 데이터: 11명</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f8ff',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    graphContainer: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 30,
    },
    graphSegment: {
        width: '100%',
    },
    statContainer: {
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    statText: {
        fontSize: 16,
        color: '#333',
        marginVertical: 5,
    },
});

export default ManagerTempScreen2;
