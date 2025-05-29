# 1단계: 빌드 단계
FROM gradle:8.0-jdk17 AS builder

# 작업 디렉토리 설정
WORKDIR /app

# 필요한 파일들만 먼저 복사 (캐시 효율 위해)
COPY back/build.gradle back/settings.gradle ./
COPY back/gradle ./gradle

# 의존성 다운로드 (캐시 활용)
RUN gradle --no-daemon dependencies

# 전체 소스 복사
COPY back/src ./src

# 빌드 실행 (JAR 생성)
RUN gradle --no-daemon clean build

# 2단계: 실행 단계
FROM openjdk:17-jdk-slim

# 작업 디렉토리
WORKDIR /app

# builder에서 생성된 jar 파일 복사 (경로는 빌드 결과에 따라 변경 가능)
COPY --from=builder /app/build/libs/*.jar app.jar

# 서버 실행
ENTRYPOINT ["java", "-jar", "app.jar"]
