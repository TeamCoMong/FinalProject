// AdminStatsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { database } from '../../config/firebaseConfig';
import { ref, onValue } from 'firebase/database';

const getStrengthLevel = (value) => {
    if (value < 100) return { level: '약함', color: '#FFCDD2' };
    if (value < 500) return { level: '보통', color: '#FFF9C4' };
    if (value < 1500) return { level: '좋음', color: '#C8E6C9' };
    if (value < 3000) return { level: '매우 좋음', color: '#B3E5FC' };
    return { level: '매우 강함', color: '#D1C4E9' };
};

const StrengthLegend = () => (
    <View style={styles.legendBlock}>
        <Text style={styles.legendTitle}>💡 강도(Level) 해석 기준</Text>
        <View style={styles.legendRow}><View style={[styles.colorBox, { backgroundColor: '#FFCDD2' }]} /><Text style={styles.legendText}>0~100 : 약함 (감지 신뢰도 낮음)</Text></View>
        <View style={styles.legendRow}><View style={[styles.colorBox, { backgroundColor: '#FFF9C4' }]} /><Text style={styles.legendText}>100~500 : 보통 (주의 필요)</Text></View>
        <View style={styles.legendRow}><View style={[styles.colorBox, { backgroundColor: '#C8E6C9' }]} /><Text style={styles.legendText}>500~1500 : 좋음</Text></View>
        <View style={styles.legendRow}><View style={[styles.colorBox, { backgroundColor: '#B3E5FC' }]} /><Text style={styles.legendText}>1500~3000 : 매우 좋음</Text></View>
        <View style={styles.legendRow}><View style={[styles.colorBox, { backgroundColor: '#D1C4E9' }]} /><Text style={styles.legendText}>3000↑ : 매우 강함 (가까운 대상)</Text></View>
    </View>
);

const AdminStatsScreen = () => {
    const [entries, setEntries] = useState([]);
    const [distanceData, setDistanceData] = useState([]);

    useEffect(() => {
        const dbRef = ref(database, '/distance');

        const unsubscribe = onValue(dbRef, (snapshot) => {
            const data = snapshot.val();

            if (data) {
                const formatted = Object.entries(data)
                    .map(([id, item]) => {
                        const distance = Number(item.distance);
                        const strength = Number(item.strength);
                        const temp = Number(item.temp);

                        if (!isFinite(distance) || !isFinite(strength) || !isFinite(temp)) {
                            return null;
                        }

                        return { id, distance, strength, temp };
                    })
                    .filter((item) => item !== null)
                    .reverse();

                const recent = formatted.slice(0, 10); // 최신 10개만 사용
                setEntries(recent);
                setDistanceData(recent.map((item) => item.distance));
            }
        });

        return () => unsubscribe();
    }, []);

    const renderItem = ({ item }) => {
        const { level, color } = getStrengthLevel(item.strength);
        return (
            <View style={[styles.item, { backgroundColor: color }]}>
                <Text style={styles.itemText}>📏 거리: {item.distance}cm</Text>
                <Text style={styles.itemText}>💡 강도: {item.strength} ({level})</Text>
                <Text style={styles.itemText}>🌡 온도: {item.temp}°C</Text>
            </View>
        );
    };

    const renderHeader = () => (
        <>
            <Text style={styles.title}>📊 거리 변화 추이</Text>
            {distanceData.length > 0 ? (
                <LineChart
                    data={{
                        labels: distanceData.map((_, i) => `${i + 1}`),
                        datasets: [{ data: distanceData }],
                    }}
                    width={Dimensions.get('window').width - 20}
                    height={220}
                    yAxisSuffix="cm"
                    chartConfig={{
                        backgroundColor: '#ffffff',
                        backgroundGradientFrom: '#ffffff',
                        backgroundGradientTo: '#ffffff',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                        labelColor: () => '#333',
                    }}
                    style={styles.chart}
                />
            ) : (
                <Text>📉 유효한 거리 데이터가 없습니다</Text>
            )}
            <Text style={styles.title}>📋 상세 데이터</Text>
            <StrengthLegend />
        </>
    );

    return (
        <FlatList
            data={entries}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.container}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginVertical: 10,
        color: '#000',
    },
    chart: {
        borderRadius: 16,
    },
    item: {
        padding: 10,
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
        borderRadius: 10,
    },
    itemText: {
        color: '#000',
        fontSize: 16,
    },
    legendBlock: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    legendTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 6,
        color: '#000',
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    legendText: {
        fontSize: 14,
        color: '#000',
    },
    colorBox: {
        width: 16,
        height: 16,
        marginRight: 8,
        borderRadius: 4,
    },
});

export default AdminStatsScreen;
