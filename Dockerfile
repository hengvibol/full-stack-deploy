FROM maven:3.9.9-eclipse-temurin-17-alpine AS build
WORKDIR /app

COPY backend/pom.xml backend/pom.xml
COPY backend/.mvn backend/.mvn
COPY backend/mvnw backend/mvnw
COPY backend/mvnw.cmd backend/mvnw.cmd
RUN chmod +x backend/mvnw
RUN cd backend && ./mvnw -q -DskipTests dependency:go-offline

COPY backend/src backend/src
RUN cd backend && ./mvnw -q -DskipTests clean package

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/backend/target/*.jar app.jar

ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
