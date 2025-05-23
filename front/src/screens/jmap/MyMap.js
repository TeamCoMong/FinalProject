// MyMap.js
import React, { useState } from "react";
import { View, Text, Button, ScrollView, StyleSheet } from "react-native";

export default function MyMap() {
    const [routeData, setRouteData] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchRoute = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://10.0.2.2:8080/api/tmap/pedestrian-route", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    startX: 126.970664,
                    startY: 37.554722,   // 서울역
                    endX: 126.985302,
                    endY: 37.561027,
                    startName: "서울역",
                    endName: "명동역",
                }),
            });

            if (!response.ok) throw new Error("서버 오류");
            const json = await response.json();
            setRouteData(json);
        } catch (e) {
            setRouteData({ error: e.message });
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Button title="Tmap 경로 조회" onPress={fetchRoute} />
            {loading && <Text>로딩 중...</Text>}
            <ScrollView style={styles.resultContainer}>
                <Text>{routeData ? JSON.stringify(routeData, null, 2) : "결과가 없습니다."}</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, marginTop: 50 },
    resultContainer: { marginTop: 20, backgroundColor: "#eee", padding: 10, borderRadius: 5 },
});
