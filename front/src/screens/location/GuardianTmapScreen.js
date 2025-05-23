import { useEffect } from 'react';
import { NativeModules } from 'react-native';

const { TMapLauncher } = NativeModules;

const GuardianTMapScreen = () => {
    useEffect(() => {
        // 컴포넌트가 처음 마운트될 때 TMap 실행
        TMapLauncher.openTMapActivity();
    }, []);

    return null; // 아무 UI도 보여주지 않음 (또는 필요한 경우 로딩 표시 가능)
};

export default GuardianTMapScreen;