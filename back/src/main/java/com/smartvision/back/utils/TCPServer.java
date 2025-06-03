package com.smartvision.back.utils;

import java.io.InputStream;
import java.net.ServerSocket;
import java.net.Socket;

public class TCPServer implements Runnable {
    private final int port = 5000;

    @Override
    public void run() {
        try (ServerSocket serverSocket = new ServerSocket(port)) {
            System.out.println("🚀 TCP 서버 시작. 포트: " + port);

            while (true) {
                Socket clientSocket = serverSocket.accept();
                System.out.println("📡 클라이언트 연결됨: " + clientSocket.getInetAddress());

                InputStream input = clientSocket.getInputStream();
                byte[] buffer = new byte[1024];
                int len;

                while ((len = input.read(buffer)) != -1) {
                    String msg = new String(buffer, 0, len);
                    System.out.println("📥 수신됨: " + msg);
                }

                System.out.println("❌ 클라이언트 연결 종료");
            }

        } catch (Exception e) {
            System.err.println("❗ TCP 서버 에러: " + e.getMessage());
        }
    }
}