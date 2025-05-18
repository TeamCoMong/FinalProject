import React from 'react';
import {View, Button, Alert, PermissionsAndroid, Platform} from 'react-native';
import {launchCamera} from 'react-native-image-picker';

const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: '카메라 권한 요청',
                    message: 'YOLO 감지를 위해 카메라 접근 권한이 필요합니다.',
                    buttonNeutral: '나중에',
                    buttonNegative: '취소',
                    buttonPositive: '확인',
                },
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn(err);
            return false;
        }
    } else {
        return true;
    }
};

const YOLO_SERVER_URL = 'https://7b23-61-34-253-238.ngrok-free.app/predict';

const YoloCameraTest = () => {
    const captureAndDetect = async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            Alert.alert('권한 거부됨', '카메라 권한이 필요합니다.');
            return;
        }

        launchCamera({mediaType: 'photo'}, async (response) => {
            if (response.didCancel) return;
            if (response.errorCode) {
                Alert.alert('오류', response.errorMessage || '카메라 오류 발생');
                return;
            }

            const photo = response.assets?.[0];
            if (!photo) return;

            const formData = new FormData();
            formData.append('image', {
                uri: photo.uri,
                type: 'image/jpeg',
                name: 'photo.jpg',
            });

            try {
                const res = await fetch(YOLO_SERVER_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formData,
                });

                const result = await res.json();
                Alert.alert('감지 결과', JSON.stringify(result, null, 2));
            } catch (err) {
                Alert.alert('요청 실패', err.message);
            }
        });
    };

    return (
        <View style={{marginTop: 100}}>
            <Button title="YOLO 감지 시작 (카메라)" onPress={captureAndDetect} />
        </View>
    );
};

export default YoloCameraTest;
