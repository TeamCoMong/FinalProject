import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, StyleSheet, Platform, PermissionsAndroid } from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';

const BillScanScreen = () => {
    const [photoUri, setPhotoUri] = useState(null);
    const [recognizedText, setRecognizedText] = useState('');
    const [amount, setAmount] = useState('');

    const requestCameraPermission = async () => {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: '카메라 권한 요청',
                    message: '앱에서 카메라를 사용하려면 권한이 필요합니다.',
                    buttonPositive: '허용',
                    buttonNegative: '거부',
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
    };

    const takePictureAndRecognize = async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            Alert.alert('권한 필요', '카메라 권한을 허용해주세요');
            return;
        }

        const options = { mediaType: 'photo', quality: 0.9, saveToPhotos: false, includeBase64: true };

        launchCamera(options, async (response) => {
            if (response.didCancel) return;
            if (response.errorCode) {
                Alert.alert('카메라 오류', response.errorMessage || '알 수 없는 오류');
                return;
            }

            const asset = response.assets && response.assets[0];
            if (!asset) {
                Alert.alert('오류', '사진 정보를 가져올 수 없습니다.');
                return;
            }

            const { uri, base64 } = asset;
            console.log('사진 URI:', uri); // 1번: uri 콘솔 출력

            setPhotoUri(uri);

            try {
                // 2번: base64 데이터가 있으면 base64로 인식시키는 것이 안전
                // 없으면 uri를 사용 (일반적으로 base64가 더 안정적)
                const recognitionInput = base64 ? `data:image/jpeg;base64,${base64}` : uri;

                const result = await TextRecognition.recognize(recognitionInput);

                // 3번: 전체 인식 결과 JSON 형태로 출력
                console.log('전체 인식 결과:', JSON.stringify(result, null, 2));

                const fullText = result.map(block => block.text).join(' ');
                setRecognizedText(fullText);
                console.log('Recognized text:', fullText);

                // 금액 추출 함수 호출
                const extractedAmount = extractKoreanWon(fullText);
                setAmount(extractedAmount);
            } catch (e) {
                Alert.alert('OCR 오류', '텍스트 인식에 실패했습니다.');
            }
        });
    };

    // 간단한 한국 원화 텍스트 내 금액 키워드 인식 예시
    const extractKoreanWon = (text) => {
        if (!text) return '';

        if (text.includes('오만원')) return '50000';
        if (text.includes('만원')) return '10000';
        if (text.includes('오천원')) return '5000';
        if (text.includes('천원')) return '1000';

        const match = text.match(/(\d{1,6})\s*원/);
        if (match) return match[1];

        return '';
    };

    return (
        <View style={styles.container}>
            {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.preview} />
            ) : (
                <View style={[styles.preview, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ color: '#888' }}>사진이 없습니다</Text>
                </View>
            )}

            <TouchableOpacity style={styles.captureButton} onPress={takePictureAndRecognize}>
                <Text style={{ color: '#fff' }}>사진 찍고 인식하기</Text>
            </TouchableOpacity>

            <View style={styles.amountContainer}>
                <Text style={styles.amountText}>
                    인식된 금액: {amount ? `${amount} 원` : '______________'}
                </Text>
                <Text style={{ color: '#ccc', marginTop: 10 }}>전체 인식 텍스트: {recognizedText}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    preview: { flex: 1, width: '100%' },
    captureButton: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 40,
    },
    amountContainer: {
        position: 'absolute',
        bottom: 100,
        alignSelf: 'center',
        width: '90%',
    },
    amountText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
});

export default BillScanScreen;
