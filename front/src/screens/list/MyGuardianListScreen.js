import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const MyGuardianListScreen = () => {
    const navigation = useNavigation();

    // 예시 데이터 (보호자 리스트)
    const guardians = [
        { id: '1', name: '김지훈', contact: '010-1234-5678' },
        { id: '2', name: '박서연', contact: '010-2345-6789' },
        { id: '3', name: '이민재', contact: '010-3456-7890' },
        { id: '4', name: '정유진', contact: '010-4567-8901' },
        { id: '5', name: '한지우', contact: '010-5678-9012' },
        { id: '6', name: '차민호', contact: '010-6789-0123' },
        { id: '7', name: '강태오', contact: '010-7890-1234' },
        { id: '8', name: '홍미선', contact: '010-8901-2345' },
        { id: '9', name: '이하늘', contact: '010-9012-3456' },
    ];

    // 보호자 리스트 항목 렌더링 함수
    const renderGuardianItem = ({ item }) => (
        <View style={styles.listItem}>
            <Text style={styles.listText}>{item.name}</Text>
            <Text style={styles.contactText}>{item.contact}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* 뒤로가기 버튼 */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Image
                    source={require('../../assets/back-button.png')} // 경로 수정 필요
                    style={styles.backIcon}
                />
            </TouchableOpacity>

            <Text style={styles.title}>나를 등록한 보호자 리스트</Text>

            {/* ScrollView 제거하고 FlatList만 사용 */}
            <FlatList
                data={guardians}
                renderItem={renderGuardianItem}
                keyExtractor={item => item.id}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E1F5FE',  // 하늘색 배경
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#01579B',  // 파란색
        marginBottom: 20,
        textAlign: 'center',  // 제목을 가운데 정렬
        fontFamily: 'Poppins',  // 몽글몽글한 느낌의 폰트
    },
    listItem: {
        backgroundColor: '#ffffff',
        padding: 20,
        marginBottom: 15,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,  // 안드로이드에서 그림자 효과 추가
    },
    listText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#01579B',  // 진한 하늘색
    },
    contactText: {
        fontSize: 16,
        color: '#0288D1',  // 밝은 하늘색
        marginTop: 5,
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
});

export default MyGuardianListScreen;
