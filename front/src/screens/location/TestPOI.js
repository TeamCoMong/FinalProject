import React from 'react';
import { View, StyleSheet } from 'react-native';
import TmapView from '../../components/TmapView';

const TestPOI = () => (
    <View style={styles.container}>
        <TmapView
            style={styles.map}
            onMapReady={() => {
                console.log("🗺️ 지도 준비 완료");
            }}
        />
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { width: '100%', height: 400 }
});

export default TestPOI;