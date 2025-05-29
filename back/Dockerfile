# 1단계: 빌드 단계
FROM gradle:8.0-jdk17 AS builder

WORKDIR /app

# gradle 관련 파일 복사
COPY build.gradle settings.gradle ./
COPY gradle ./gradle
COPY gradlew ./gradlew
RUN chmod +x ./gradlew          # 실행 권한 부여

# 의존성 다운로드 (캐시 활용)
RUN ./gradlew --no-daemon dependencies

# 소스 전체 복사
COPY src ./src

# 빌드 실행 (JAR 생성)
RUN ./gradlew --no-daemon clean build

# 2단계: 실행 단계
FROM openjdk:17-jdk-slim

WORKDIR /app

# 빌더에서 생성된 JAR 복사
COPY --from=builder /app/build/libs/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
