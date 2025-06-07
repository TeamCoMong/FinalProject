import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import api from '../../api/api'; // ✅ API 연결 파일

const AdminSettingsScreen = () => {
    const [showUsers, setShowUsers] = useState(false);
    const [showGuardians, setShowGuardians] = useState(false);
    const [users, setUsers] = useState([]);
    const [guardians, setGuardians] = useState([]);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users/all');
            setUsers(response.data);
        } catch (error) {
            console.error('사용자 목록 가져오기 실패:', error);
        }
    };

    const fetchGuardians = async () => {
        try {
            const response = await api.get('/guardians/all');
            setGuardians(response.data);
        } catch (error) {
            console.error('보호자 목록 가져오기 실패:', error);
        }
    };

    useEffect(() => {
        if (showUsers) fetchUsers();
        if (showGuardians) fetchGuardians();
    }, [showUsers, showGuardians]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>⚙️ 관리자 설정 화면</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => setShowUsers(prev => !prev)}>
                <Text style={styles.buttonText}>
                    {showUsers ? '🔽 사용자 리스트 닫기' : '▶ 사용자 리스트 보기'}
                </Text>
            </TouchableOpacity>

            {showUsers && (
                <FlatList
                    data={users}
                    keyExtractor={item => item.userId}
                    renderItem={({ item }) => (
                        <Text style={styles.item}>👤 {item.userId} - {item.name}</Text>
                    )}
                />
            )}

            <TouchableOpacity
                style={styles.button}
                onPress={() => setShowGuardians(prev => !prev)}>
                <Text style={styles.buttonText}>
                    {showGuardians ? '🔽 보호자 리스트 닫기' : '▶ 보호자 리스트 보기'}
                </Text>
            </TouchableOpacity>

            {showGuardians && (
                <FlatList
                    data={guardians}
                    keyExtractor={item => item.guardianId}
                    renderItem={({ item }) => (
                        <Text style={styles.item}>🧑‍⚕️ {item.guardianId} - {item.name} ({item.phone})</Text>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#E6E6FA',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    button: {
        padding: 10,
        backgroundColor: '#007AFF',
        borderRadius: 5,
        marginVertical: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    },
    item: {
        padding: 8,
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
    },
});

export default AdminSettingsScreen;
