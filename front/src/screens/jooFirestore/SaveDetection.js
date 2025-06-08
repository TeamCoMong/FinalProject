// 감지 결과 저장
import React from 'react';
import { Button, View } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const SaveDetection = () => {
    const handleSave = async () => {
        await firestore()
            .collection('detections')
            .add({
                device: 'user-cam-01',
                objects: [
                    { label: 'person', confidence: 0.93 },
                    { label: 'car', confidence: 0.87 }
                ],
                timestamp: new Date().toISOString()
            });
        console.log('✅ 감지 결과 저장됨!');
    };

    return (
        <View style={{ padding: 20 }}>
            <Button title="Firestore에 감지 결과 저장" onPress={handleSave} />
        </View>
    );
};

export default SaveDetection;
