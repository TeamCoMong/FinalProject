package com.smartvision.back;

import com.smartvision.back.utils.TCPServer;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class BackApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackApplication.class, args);
        System.out.println("🚀 백엔드 서버가 실행되었습니다 / Back Start 🚀");

        new Thread(new TCPServer()).start();
    }
}
