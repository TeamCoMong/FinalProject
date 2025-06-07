// config/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase 설정 정보
const firebaseConfig = {
    apiKey: "AIzaSyAbkkAg32B2dWaR0DdQD3jwa3UAdDvLVKY",
    authDomain: "distancetest-6cba8.firebaseapp.com",
    databaseURL: "https://distancetest-6cba8-default-rtdb.firebaseio.com",
    projectId: "distancetest-6cba8",
    storageBucket: "distancetest-6cba8.appspot.com",
    messagingSenderId: "1024127495206",
    appId: "1:1024127495206:android:84da04c36c9bafbcbe8ae7"
};

// ✅ 초기화
const app = initializeApp(firebaseConfig);

// ✅ Realtime Database 인스턴스 생성
const database = getDatabase(app);

export { app, database };
