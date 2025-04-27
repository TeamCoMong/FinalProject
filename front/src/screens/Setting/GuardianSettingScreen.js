import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const GuardianSettingScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>보호자 -  설정 페이지 </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
});

export default GuardianSettingScreen;
