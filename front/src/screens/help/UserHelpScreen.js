import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const UserHelpScreen = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>SafeWalk 사용자 도움말</Text>

            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    { backgroundColor: pressed ? '#8BC34A' : '#A5D6A7' }
                ]}
                onPress={() => navigation.navigate('NavigationHelpScreen')}>
                <Text style={styles.buttonText}>🚶 길 안내 기능</Text>
            </Pressable>

            {/*<Pressable*/}
            {/*    style={({ pressed }) => [*/}
            {/*        styles.button,*/}
            {/*        { backgroundColor: pressed ? '#FFD54F' : '#FFEB3B' }*/}
            {/*    ]}*/}
            {/*    onPress={() => navigation.navigate('MoneyRecognitionHelpScreen')}>*/}
            {/*    <Text style={styles.buttonText}>💵 지폐 인식 기능</Text>*/}
            {/*</Pressable>*/}

            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    { backgroundColor: pressed ? '#90CAF9' : '#64B5F6' }
                ]}
                onPress={() => navigation.navigate('LinkedGuardiansScreen')}>
                <Text style={styles.buttonText}>👨‍👩‍👧‍👦 보호자 연동 기능 </Text>
            </Pressable>

            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    { backgroundColor: pressed ? '#CE93D8' : '#BA68C8' }
                ]}
                onPress={() => navigation.navigate('SettingsHelpScreen')}>
                <Text style={styles.buttonText}>⚙️ 기타 설정 기능</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF9C4',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
        paddingVertical: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#37474F',
        marginBottom: 50,
        fontFamily: 'sans-serif-medium',
    },
    button: {
        width: '100%',
        paddingVertical: 18,
        paddingHorizontal: 12,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    buttonText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#37474F',
        fontFamily: 'sans-serif',
    },
});

export default UserHelpScreen;
