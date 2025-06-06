import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AdminStatsScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>📊 통계 데이터 화면</Text>
        </View>
    );
};

export default AdminStatsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0F8FF',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});
