import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import database from '@react-native-firebase/database';
import { LineChart } from 'react-native-chart-kit';

const VibrateTest = () => {
    const [entries, setEntries] = useState([]);
    const [distanceData, setDistanceData] = useState([]);

    useEffect(() => {
        const ref = database().ref('/distance').limitToLast(20);

        ref.on('value', snapshot => {
            try {
                const data = snapshot.val();
                console.log('📦 데이터 수신:', data);

                if (data) {
                    const formatted = Object.entries(data)
                        .map(([id, item]) => {
                            const distance = Number(item.distance);
                            const strength = Number(item.strength);
                            const temp = Number(item.temp);

                            // 유효성 검사
                            if (
                                !isFinite(distance) ||
                                !isFinite(strength) ||
                                !isFinite(temp)
                            ) {
                                return null;
                            }

                            return {
                                id,
                                distance,
                                strength,
                                temp,
                            };
                        })
                        .filter(item => item !== null)
                        .reverse();

                    setEntries(formatted);
                    setDistanceData(formatted.map(item => item.distance));
                }
            } catch (err) {
                console.error('❌ 데이터 처리 중 오류:', err);
            }
        });

        return () => ref.off();
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.item}>
            <Text>📏 거리: {item.distance}cm</Text>
            <Text>💡 강도: {item.strength}</Text>
            <Text>🌡 온도: {item.temp}°C</Text>
        </View>
    );

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
    },
    chart: {
        borderRadius: 16,
    },
    item: {
        padding: 10,
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
    },
});

export default VibrateTest;
