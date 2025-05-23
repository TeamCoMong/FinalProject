import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../api/api';  // ✅ API 연결 파일 import
import { useCallback } from 'react';

const LinkedUserListScreen = ({ route }) => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const navigation = useNavigation();

    const guardianId = route.params?.guardianId; // ✅ 임시: 보호자 ID (나중에 로그인값으로 변경)

    const fetchLinkedUsers = useCallback(async () => {
        if (!guardianId) return;

        try {
            const response = await api.get(`/guardians/${guardianId}/users`);
            setUsers(response.data);
        } catch (error) {
            console.error('연결된 사용자 조회 중 오류', error);
            Alert.alert('오류', '연결된 사용자를 불러오는 데 실패했습니다.');
        }
    }, [guardianId]);

    useFocusEffect(
        useCallback(() => {
            if (guardianId) {
                fetchLinkedUsers();
            }
        }, [guardianId])
    );

    const handleAddNewUser = () => {
        navigation.navigate('AddNewUserScreen');
    };

    const handleDeleteUser = (userId) => {
        setUsers(users.filter(user => user.userId !== userId));
    };

    const handleSelectUser = (user) => {
        const updatedUsers = users.filter(u => u.userId !== user.userId);
        setUsers([user, ...updatedUsers]);
        setSelectedUser(user);
    };

    return (
        <ScrollView style={styles.container}>
            {selectedUser && (
                <View style={styles.selectedUserContainer}>
                    <Text style={styles.selectedUserText}>현재 선택된 사용자:</Text>
                    <Text style={styles.selectedUserName}>{selectedUser.name}</Text>
                    <Image source={require('../../assets/check.png')} style={styles.icon} />
                </View>
            )}

            <TouchableOpacity style={styles.addButton} onPress={handleAddNewUser}>
                <Text style={styles.addButtonText}>새로운 사용자 등록하기</Text>
            </TouchableOpacity>

            {users.map((user) => (
                <View key={user.userId} style={styles.userContainer}>
                    <View style={styles.userBox}>
                        <Text style={styles.userName}>{user.name}</Text>

                        {selectedUser?.userId !== user.userId && (
                            <TouchableOpacity onPress={() => handleSelectUser(user)}>
                                <Text style={styles.selectButton}>선택</Text>
                            </TouchableOpacity>
                        )}

                        {selectedUser?.userId !== user.userId && (
                            <TouchableOpacity onPress={() => handleDeleteUser(user.userId)}>
                                <Text style={styles.deleteButton}>삭제</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f8ff',
        padding: 20,
    },
    addButton: {
        backgroundColor: '#007BFF',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    selectedUserContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    selectedUserText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginRight: 10,
    },
    selectedUserName: {
        fontSize: 16,
        color: '#555',
    },
    userContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
    },
    userBox: {
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#f0f8ff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    selectButton: {
        fontSize: 16,
        color: '#007BFF',
        fontWeight: 'bold',
    },
    deleteButton: {
        fontSize: 16,
        color: '#FF0000',
        fontWeight: 'bold',
        marginLeft: 10,
    },
    icon: {
        width: 24,
        height: 24,
    },
});

export default LinkedUserListScreen;
