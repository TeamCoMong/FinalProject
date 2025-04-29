import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import EncryptedStorage from 'react-native-encrypted-storage';
import api from '../../api/api';

const MyProfileInfoScreen = () => {
    const navigation = useNavigation();
    const [userCode, setUserCode] = useState('');
    const [guardians, setGuardians] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const storedUserId = await EncryptedStorage.getItem('userId');
                if (!storedUserId) {
                    Alert.alert('오류', '로그인 정보가 없습니다.');
                    return;
                }

                setUserCode(storedUserId); // 유저 코드 설정

                const response = await api.get(`/users/${storedUserId}/guardians`);
                setGuardians(response.data);
            } catch (error) {
                console.error('보호자 정보 불러오기 오류:', error);
                Alert.alert('오류', '보호자 정보를 불러오는 데 실패했습니다.');
            }
        };

        fetchData();
    }, []);

    const renderGuardianItem = ({ item }) => (
        <View style={styles.listItem}>
            <Text style={styles.listText}>{item.guardianName}</Text>
            <Text style={styles.contactText}>{item.phone}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Image source={require('../../assets/back-button.png')} style={styles.backIcon} />
            </TouchableOpacity>

            <Text style={styles.title}>나의 고유 코드</Text>
            <View style={styles.codeContainer}>
                <Text style={styles.code}>{userCode}</Text>
            </View>

            <Text style={styles.subtitle}>등록된 보호자</Text>
            <FlatList
                data={guardians}
                renderItem={renderGuardianItem}
                keyExtractor={(item) => item.guardianId}
                contentContainerStyle={styles.guardianList}
            />
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E0F7FA',
        paddingHorizontal: 20,
        paddingTop: 50,
    },
    backButton: {
        position: 'absolute',
        top: 25,
        left: 20,
        zIndex: 1,
    },
    backIcon: {
        width: 30,
        height: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#37474F',
        marginBottom: 10,
        textAlign: 'center',
    },
    codeContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 30,
    },
    code: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1E88E5',
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#01579B',
    },
    guardianList: {
        paddingBottom: 20,
    },
    listItem: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 15,
        borderRadius: 12,
        elevation: 3,
    },
    listText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#01579B',
    },
    contactText: {
        fontSize: 16,
        color: '#0288D1',
        marginTop: 5,
    },
});


export default MyProfileInfoScreen;