import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next'; // ✅ i18n 추가

const UserHelpScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation(); // ✅ 번역 함수

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('userHelp.title')}</Text>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: pressed ? '#8BC34A' : '#A5D6A7' }
        ]}
        onPress={() => navigation.navigate('NavigationHelpScreen')}>
        <Text style={styles.buttonText}>🚶 {t('userHelp.navigation')}</Text>
      </Pressable>

      {/* 지폐 인식 도움말 비활성화됨 */}

      <Pressable
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: pressed ? '#90CAF9' : '#64B5F6' }
        ]}
        onPress={() => navigation.navigate('GuardianRegisterHelpScreen')}>
        <Text style={styles.buttonText}>👨‍👩‍👧‍👦 {t('userHelp.guardian')}</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: pressed ? '#CE93D8' : '#BA68C8' }
        ]}
        onPress={() => navigation.navigate('SettingsHelpScreen')}>
        <Text style={styles.buttonText}>⚙️ {t('userHelp.settings')}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9C4',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#37474F',
    marginBottom: 50,
    fontFamily: 'sans-serif-medium',
  },
  button: {
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#37474F',
    fontFamily: 'sans-serif',
  },
});

export default UserHelpScreen;