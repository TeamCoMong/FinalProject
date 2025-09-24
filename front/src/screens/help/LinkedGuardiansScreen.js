import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import api from '../../api/api'; // ✅ Axios 인스턴스 import
import Tts from 'react-native-tts';

const LinkedGuardiansScreen = () => {
    const [guardians, setGuardians] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGuardians = async () => {
            try {
                const userId = await EncryptedStorage.getItem('userId');
                if (!userId) {
                    Alert.alert('오류', '사용자 정보가 없습니다.');
                    return;
                }

                const res = await api.get(`/users/${userId}/guardians`);
                if (res.status === 200) {
                    console.log('📦 API 응답 데이터:', res.data);  // ✅ 여기서 로그 찍기
                    setGuardians(res.data); // [{guardianId, guardianName, phone}, ...]
                    // 👇 이름들을 TTS로 읽어주기
                    const names = res.data.map(g => g.guardianName).filter(name => name).join(', ');
                    Tts.stop();
                    Tts.speak(`연동된 보호자는 ${names} 입니다.`);
                } else {
                    Alert.alert('조회 실패', '보호자 정보를 불러오지 못했습니다.');
                }
            } catch (err) {
                console.error(err);
                Alert.alert('네트워크 오류', '보호자 정보 불러오기 실패');
            } finally {
                setLoading(false);
            }
        };

        fetchGuardians();
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.name}>🧑‍🦳 이름: {item.guardianName}</Text>
            <Text style={styles.phone}>📱 연락처: {item.phone}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>연동된 보호자 목록</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#3f51b5" />
            ) : guardians.length === 0 ? (
                <Text style={styles.noData}>연동된 보호자가 없습니다.</Text>
            ) : (
                <FlatList
                    data={guardians}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderItem}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E8F5E9',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2e7d32',
        marginBottom: 20,
    },
    card: {
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 12,
        elevation: 3,
    },
    name: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000', // ✅ 글자 색 검정으로 변경
    },
    id: {
        fontSize: 16,
        color: '#555',
        marginTop: 4,
    },
    phone: {
        fontSize: 16,
        color: '#000', // ✅ 글자 색 검정으로 변경
        marginTop: 4,
    },
    noData: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 50,
        color: '#999',
    },
});

export default LinkedGuardiansScreen;
