import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AdminAIDetectionScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>🤖 AI 객체감지 데이터 화면</Text>
        </View>
    );
};

export default AdminAIDetectionScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF5EE',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});
