import { NativeModules, Button } from 'react-native';

const { TMapLauncher } = NativeModules;

const GuardianMapScreen = () => {
    const handleOpenTMap = () => {
        TMapLauncher.openTMapActivity();
    };

    return (
        <Button title="TMap 실행" onPress={handleOpenTMap} />
    );
};

export default GuardianMapScreen;