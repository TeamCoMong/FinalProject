const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();

// HTTP 서버와 WebSocket 서버를 설정
const server = http.createServer(app);
const io = socketIo(server);

// 위치 데이터를 저장할 객체
let userLocations = {};

// 클라이언트가 연결되었을 때 처리
io.on('connection', (socket) => {
    console.log('새로운 사용자 연결:', socket.id);

    // 클라이언트가 위치 데이터를 보낼 때
    socket.on('sendLocation', (location) => {
        userLocations[socket.id] = location; // 위치 데이터 저장
        console.log(`사용자 ${socket.id}의 위치:`, location);

        // 모든 클라이언트에게 위치 데이터 전송 (동기화)
        io.emit('updateLocation', { id: socket.id, location });
    });

    // 클라이언트 연결이 종료되었을 때 처리
    socket.on('disconnect', () => {
        console.log('사용자 연결 해제:', socket.id);
        delete userLocations[socket.id]; // 사용자 위치 데이터 삭제
    });
});

// 간단한 라우터 예시 (옵션)
app.get('/', (req, res) => {
    res.send('Hello from the server!');
});

// 서버 시작
server.listen(3000, () => {
    console.log('서버가 포트 3000에서 실행 중입니다.');
});