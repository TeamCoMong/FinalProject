# 1단계: 빌드 단계
FROM gradle:8.0-jdk17 AS builder

WORKDIR /app

# 백엔드 폴더 안에 gradle 관련 파일 복사
COPY back/build.gradle back/settings.gradle ./
COPY back/gradle ./gradle

# 의존성 다운로드 (캐시 활용)
RUN gradle --no-daemon dependencies

# 백엔드 소스 전체 복사
COPY back/src ./src

# 빌드 실행 (JAR 생성)
RUN gradle --no-daemon clean build

# 2단계: 실행 단계
FROM openjdk:17-jdk-slim

WORKDIR /app

# 빌더에서 생성된 JAR 복사
COPY --from=builder /app/build/libs/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
