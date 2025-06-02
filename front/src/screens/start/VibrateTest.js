import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import database from '@react-native-firebase/database';

const VibrateTest = () => {
    const [entries, setEntries] = useState([]);

    useEffect(() => {
        const ref = database().ref('/distance');

        // 실시간으로 변화 감지
        ref.on('value', snapshot => {
            const data = snapshot.val();
            if (data) {
                const formatted = Object.entries(data).map(([id, item]) => ({
                    id,
                    ...item,
                })).reverse();
                setEntries(formatted);
            }
        });

        // 언마운트 시 해제
        return () => ref.off();
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.item}>
            <Text>📏 거리: {item.distance}cm</Text>
            <Text>💡 강도: {item.strength}</Text>
            <Text>🌡 온도: {item.temp}°C</Text>
        </View>
    );

    return (
        <FlatList
            data={entries}
            keyExtractor={item => item.id}
            renderItem={renderItem}
        />
    );
};

const styles = StyleSheet.create({
    item: {
        padding: 10,
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
    },
});

export default VibrateTest;
