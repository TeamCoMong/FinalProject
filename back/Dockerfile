# Java 17 이미지 사용
FROM openjdk:17

# 임시 디렉토리 설정
VOLUME /tmp

# 빌드된 JAR 파일을 컨테이너로 복사
ARG JAR_FILE=build/libs/*.jar
COPY ${JAR_FILE} app.jar

# 서버 실행 명령어
ENTRYPOINT ["java", "-jar", "/app.jar"]