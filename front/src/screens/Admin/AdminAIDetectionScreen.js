import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { database } from '../../config/firebaseConfig';
import { ref, onValue } from 'firebase/database';

// 위험도에 따른 배경색 설정
const getColorByClass = (cls) => {
    if (["car", "bus", "motorcycle", "bicycle"].includes(cls)) return '#FFB6B6'; // 고위험 (연빨강)
    if (["person"].includes(cls)) return '#FFE7AA'; // 중위험 (연주황)
    return '#DCEEFF'; // 저위험 (연파랑)
};

const AdminAIDetectionScreen = () => {
    const [yoloData, setYoloData] = useState([]);

    useEffect(() => {
        const yoloRef = ref(database, 'yolo_results');
        const unsubscribe = onValue(yoloRef, snapshot => {
            const rawData = snapshot.val();
            if (rawData) {
                const parsed = Object.entries(rawData).map(([key, value]) => ({
                    id: key,
                    ...value
                }));
                setYoloData(parsed.reverse());
            } else {
                setYoloData([]);
            }
        });

        return () => unsubscribe();
    }, []);

    // 📊 감지 통계 요약 계산
    const detectionStats = useMemo(() => {
        const countMap = {};
        yoloData.forEach(item => {
            Object.keys(item).forEach(cls => {
                if (cls === 'id') return;
                countMap[cls] = (countMap[cls] || 0) + 1;
            });
        });
        return countMap;
    }, [yoloData]);

    // 📌 상단: 범례 + 통계 요약 카드
    const renderHeader = () => (
        <View style={styles.headerBlock}>
            <Text style={styles.statTitle}>🧭 감지 위험도 색상 안내</Text>
            <View style={styles.legendRow}>
                <View style={[styles.legendColor, { backgroundColor: '#DCEEFF' }]} />
                <Text style={styles.legendText}>저위험 (기타 객체)</Text>
            </View>
            <View style={styles.legendRow}>
                <View style={[styles.legendColor, { backgroundColor: '#FFE7AA' }]} />
                <Text style={styles.legendText}>중위험 (사람)</Text>
            </View>
            <View style={styles.legendRow}>
                <View style={[styles.legendColor, { backgroundColor: '#FFB6B6' }]} />
                <Text style={styles.legendText}>고위험 (차량, 오토바이 등)</Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.statTitle}>📊 최근 감지 통계</Text>
            {Object.entries(detectionStats).map(([cls, count]) => (
                <Text key={cls} style={styles.statText}>
                    {cls.toUpperCase()}: {count}회
                </Text>
            ))}
        </View>
    );

    // 감지 카드 렌더링
    const renderItem = ({ item }) => {
        const mainClass = Object.keys(item).find(k => k !== 'id');
        return (
            <View style={[styles.card, { backgroundColor: getColorByClass(mainClass) }]}>
                {Object.entries(item).map(([cls, conf]) => {
                    if (cls === 'id') return null;
                    return (
                        <Text key={cls} style={styles.itemText}>
                            {cls.toUpperCase()} 감지 ({(conf * 100).toFixed(1)}%)
                        </Text>
                    );
                })}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🤖 AI 객체감지 데이터</Text>
            <FlatList
                data={yoloData}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListHeaderComponent={renderHeader}
            />
        </View>
    );
};

export default AdminAIDetectionScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF5EE',
        paddingTop: 30,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    list: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerBlock: {
        backgroundColor: '#F0F8FF',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    statTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    statText: {
        fontSize: 16,
        color: '#444',
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    legendColor: {
        width: 16,
        height: 16,
        borderRadius: 4,
        marginRight: 8,
    },
    legendText: {
        fontSize: 14,
        color: '#444',
    },
    divider: {
        marginVertical: 10,
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
    },
    card: {
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
    },
    itemText: {
        fontSize: 16,
        color: '#333',
    },
});
