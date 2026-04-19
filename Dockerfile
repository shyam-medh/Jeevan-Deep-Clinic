# --- Build Stage ---
FROM maven:3.8.4-openjdk-11-slim AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn clean package -DskipTests

# --- Run Stage ---
FROM eclipse-temurin:11-jre-alpine
WORKDIR /app

# Create a non-root user for security
RUN addgroup -S clinicgroup && adduser -S clinicuser -G clinicgroup
USER clinicuser

# Copy the JAR from build stage
COPY --from=build --chown=clinicuser:clinicgroup /app/target/clinic-0.0.1-SNAPSHOT.jar app.jar

# Optimize JVM settings for container environments
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
