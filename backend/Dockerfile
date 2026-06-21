# =====================================================================
# Multi-stage build for the PT28 Cabinet Medical backend
# =====================================================================

# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Cache dependencies first
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

# Build the application
COPY src ./src
RUN mvn -B -q clean package -DskipTests

# ---- Runtime stage ----
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Create a non-root user
RUN groupadd --system spring && useradd --system --gid spring spring

COPY --from=build /app/target/cabinet-medical.jar app.jar

# Folder used to store uploaded documents
RUN mkdir -p /app/uploads && chown -R spring:spring /app
USER spring

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
