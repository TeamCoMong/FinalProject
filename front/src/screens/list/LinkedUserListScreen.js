import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // 네비게이션 훅

const LinkedUserListScreen = () => {
    // 예시 사용자 데이터
    const usersData = [
        { id: 1, name: '홍길동', isNavigating: true, locationShared: true },
        { id: 2, name: '김철수', isNavigating: false, locationShared: false },
        { id: 3, name: '이영희', isNavigating: false, locationShared: true },
        { id: 4, name: '박지수', isNavigating: false, locationShared: false },
        { id: 5, name: '최승우', isNavigating: false, locationShared: false },
    ];

    const [users, setUsers] = useState(usersData);
    const [selectedUser, setSelectedUser] = useState(null); // 선택된 사용자 상태
    const navigation = useNavigation();  // 네비게이션 훅

    // '새로운 사용자 등록하기' 버튼을 눌렀을 때
    const handleAddNewUser = () => {
        navigation.navigate('AddNewUserScreen');  // AddNewUserScreen으로 네비게이트
    };

    // 사용자 삭제 함수
    const handleDeleteUser = (userId) => {
        setUsers(users.filter(user => user.id !== userId));  // 클릭된 사용자 삭제
    };

    // 사용자 선택 함수
    const handleSelectUser = (user) => {
        // 선택된 사용자를 맨 위로 올리기
        const updatedUsers = users.filter(u => u.id !== user.id);
        setUsers([user, ...updatedUsers]); // 선택된 사용자 먼저 배열에 추가
        setSelectedUser(user); // 사용자가 선택되면 선택된 사용자 상태 업데이트
    };

    return (
        <ScrollView style={styles.container}>
            {/* 선택된 사용자 표시 - 가장 위에 위치 */}
            {selectedUser && (
                <View style={styles.selectedUserContainer}>
                    <Text style={styles.selectedUserText}>현재 선택된 사용자:</Text>
                    <Text style={styles.selectedUserName}>{selectedUser.name}</Text>
                    <Image source={require('../../assets/check.png')} style={styles.icon} />
                </View>
            )}

            {/* '새로운 사용자 등록하기' 버튼 */}
            <TouchableOpacity style={styles.addButton} onPress={handleAddNewUser}>
                <Text style={styles.addButtonText}>새로운 사용자 등록하기</Text>
            </TouchableOpacity>

            {/* 사용자 목록을 반복하여 보여주기 */}
            {users.map((user) => (
                <View key={user.id} style={styles.userContainer}>
                    <View style={styles.userBox}>
                        <Text style={styles.userName}>{user.name}</Text>

                        {/* "선택" 버튼 */}
                        {selectedUser?.id !== user.id && (
                            <TouchableOpacity onPress={() => handleSelectUser(user)}>
                                <Text style={styles.selectButton}>선택</Text>
                            </TouchableOpacity>
                        )}

                        {/* "삭제" 버튼 */}
                        {selectedUser?.id !== user.id && (
                            <TouchableOpacity onPress={() => handleDeleteUser(user.id)}>
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
        color: '#FF0000', // 빨간색 텍스트
        fontWeight: 'bold',
        marginLeft: 10,
    },

    icon: {
        width: 24,
        height: 24,
    },
});

export default LinkedUserListScreen;
