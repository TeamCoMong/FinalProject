import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const DetectionList = () => {
    const [detections, setDetections] = useState([]);

    useEffect(() => {
        const unsubscribe = firestore()
            .collection('detections')
            .orderBy('timestamp', 'desc')
            .onSnapshot(snapshot => {
                const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setDetections(docs);
            });

        return () => unsubscribe(); // Clean up
    }, []);

    return (
        <ScrollView style={{ padding: 20 }}>
            {detections.map((item, index) => (
                <View key={index} style={{ marginBottom: 10 }}>
                    <Text>📷 Device: {item.device}</Text>
                    <Text>🕒 Time: {item.timestamp}</Text>
                    {item.objects?.map((obj, i) => (
                        <Text key={i}>🧠 {obj.label} ({obj.confidence})</Text>
                    ))}
                </View>
            ))}
        </ScrollView>
    );
};

export default DetectionList;
