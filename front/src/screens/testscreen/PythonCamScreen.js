import React from 'react';
import { View, Button, Alert } from 'react-native';

const PythonCamScreen = () => {
    const startDetection = async () => {
        try {
            //박주민 pc    IPv4 주소 . . . . . . . . . : 192.168.34.24
            //스프링부트가 다른 장비(ip)에서 실행중인경우  해당 IPv4 주소로 변경
            const response = await fetch("http://10.0.2.2:8080/detect/start");
            const data = await response.json();
            Alert.alert("감지 상태", data.status);
        } catch (err) {
            Alert.alert("오류", err.message);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Button title="객체 감지 시작" onPress={startDetection} />
        </View>
    );
};

export default PythonCamScreen;
