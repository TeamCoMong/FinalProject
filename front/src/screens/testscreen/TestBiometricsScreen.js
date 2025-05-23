// TestBiometricsScreen.js

import React, { useState, useEffect } from 'react'
import { View, Alert } from 'react-native'
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics'

// 인스턴스 생성
const rnBiometrics = new ReactNativeBiometrics()

const TestBiometricsScreen = () => {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // 화면이 뜰 때 한 번만 실행
    if (!initialized) {
      setInitialized(true)

      // 1) 센서 가능 여부 확인
      rnBiometrics.isSensorAvailable()
        .then(({ available, biometryType, error }) => {
          if (available) {
            // 2) 바로 인증 요청
            rnBiometrics.simplePrompt({ promptMessage: 'Face ID로 로그인' })
              .then(({ success }) => {
                if (success) {
                  Alert.alert('인증 성공', '환영합니다!')
                } else {
                  Alert.alert('인증 실패', '인증에 실패했습니다.')
                }
              })
              .catch(err => {
                console.log('simplePrompt error', err)
                Alert.alert('오류', err.message || '알 수 없는 오류')
              })
          } else {
            Alert.alert('지원 불가', error || '생체 인증을 사용할 수 없습니다.')
          }
        })
        .catch(err => {
          console.log('isSensorAvailable error', err)
          Alert.alert('오류', '생체 인증 확인 중 오류가 발생했습니다.')
        })
    }
  }, [initialized])

  // 화면에는 아무 UI도 필요 없습니다.
  return <View style={{ flex: 1, backgroundColor: '#fff' }} />
}

export default TestBiometricsScreen
