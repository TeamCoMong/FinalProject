import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import EncryptedStorage from 'react-native-encrypted-storage';
import api from '../../api/api';
import ReactNativeBiometrics from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics();

const MyProfileInfoScreen = () => {
    const navigation = useNavigation();
    const [userCode, setUserCode] = useState('');
    const [guardians, setGuardians] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const authenticateAndFetch = async () => {
            try {
                const { available } = await rnBiometrics.isSensorAvailable();
                if (!available) {
                    Alert.alert('오류', '이 기기에서는 생체 인증을 사용할 수 없습니다.');
                    navigation.goBack();
                    return;
                }

                const { success } = await rnBiometrics.simplePrompt({ promptMessage: '지문으로 본인 인증해주세요' });
                if (!success) {
                    Alert.alert('인증 실패', '지문 인증에 실패했습니다.');
                    navigation.goBack();
                    return;
                }

                // 인증 성공 시 사용자 정보 로드
                const storedUserId = await EncryptedStorage.getItem('userId');
                if (!storedUserId) {
                    Alert.alert('오류', '로그인 정보가 없습니다.');
                    navigation.goBack();
                    return;
                }

                setUserCode(storedUserId);

                const response = await api.get(`/users/${storedUserId}/guardians`);
                setGuardians(response.data);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('지문 인증 또는 보호자 정보 불러오기 실패:', error);
                Alert.alert('오류', '인증 또는 데이터 로딩 중 문제가 발생했습니다.');
                navigation.goBack();
            }
        };

        authenticateAndFetch();
    }, []);

    const renderGuardianItem = ({ item }) => (
        <View style={styles.listItem}>
            <Text style={styles.listText}>{item.guardianName}</Text>
            <Text style={styles.contactText}>{item.phone}</Text>
        </View>
    );

    if (!isAuthenticated) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#007BFF" />
                <Text style={{ marginTop: 20 }}>지문 인증 중...</Text>
            </View>
        );
    }

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