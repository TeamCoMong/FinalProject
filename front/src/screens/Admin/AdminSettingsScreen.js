import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AdminSettingsScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>⚙️ 관리자 설정 화면</Text>
        </View>
    );
};

export default AdminSettingsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E6E6FA',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});
