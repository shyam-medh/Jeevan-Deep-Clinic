# 🦷 Jeevan Deep Clinic | Modern Dental & Eye Portal

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-2.7.18-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue.svg)](https://www.docker.com/)
[![Jenkins](https://img.shields.io/badge/Jenkins-CI%2FCD-orange.svg)](https://www.jenkins.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)

**Jeevan Deep Clinic** is a full-stack, enterprise-ready web application designed for dental and eye clinics. It provides a seamless experience for patients to book appointments and interact with doctors, while offering a robust management dashboard for clinic administrators.

> [!CAUTION]
> **DIRECT PRODUCTION REPOSITORY**: This project is private and intended for direct development and production use only. This is **NOT** a template or an open-source project for forking. External contributions, forks, or pull requests will not be processed.

---

## 🌟 Key Features

### 👤 Patient Experience
- **Smart Appointment Booking**: Real-time slot selection with automatic timing management.
- **Patient Q&A System**: A dedicated portal for patients to ask technical questions and receive public answers from the doctor.
- **Dynamic FAQ**: Frequently Asked Questions driven by approved doctor responses.
- **Patient Reviews**: Integrated review system to build trust and showcase clinic success.
- **Bilingual Support (EN/हिंदी)**: Google Translate-powered language switching with a first-visit language selection popup and a persistent floating language button.

### 📝 Biological Blog
- **Oral Health Journal**: A public-facing blog page for the doctor to publish educational dental and eye-care articles.
- **Rich Content Management**: Create, manage, and delete blog posts with categories, excerpts, and full content.
- **Gallery Image Upload**: Upload images directly from device gallery (Base64) or paste external URLs.

### 🔐 Admin Dashboard (Responsive)
- **Zero-Downtime Management**: View and manage appointments, reviews, Q&A, and blog posts from any device (Mobile/Desktop).
- **Security**: Custom medical-grade authentication with a resettable admin password stored securely.
- **Toast Notifications**: Instant feedback for all administrative actions (Success/Error/Warning).
- **Visibility Control**: Doctors have full control over which reviews and Q&As are displayed on the public site.

---

## 🛠️ Technical Stack

- **Backend**: Java 11, Spring Boot, Spring Security, Spring Data JPA.
- **Frontend**: Modern Vanilla JS, CSS3 (Custom Glassmorphism), Semantic HTML5.
- **Database**: 
  - **MySQL 8.0** (Production - Persistent via Docker Volumes).
  - **H2** (Development - Lightweight file-based).
- **Localization**: Google Translate Widget with MutationObserver-based programmatic control.
- **Monitoring**: Spring Boot Actuator for real-time health checks.
- **Infrastructure**: Docker, Docker Compose, Nginx (Reverse Proxy + SSL).
- **CI/CD**: Jenkins Blue-Green deployment pipeline with automated SSL via Certbot.

---

## 🏗️ Architecture & Infrastructure

The project follows a "Service-Oriented" containerized architecture designed for maximum uptime.

### 🔄 Zero-Downtime Blue-Green Deployment
The pipeline uses a **Blue-Green deployment pattern**:
1. **Build**: Jenkins builds a lightweight **Alpine Linux** based Docker image.
2. **Push**: Image is pushed to Docker Hub for versioning.
3. **Health Check**: The pipeline pings the `/actuator/health` endpoint of the new container. 
4. **Switch**: Only after a `200 OK` is received does **Nginx** switch traffic to the new version.
5. **Resiliency**: If the app fails to start (e.g., DB connection error), the old version keeps running, ensuring **100% uptime**.

### 🐳 Container Orchestration
The environment is managed via **Docker Compose**, linking the application to a persistent MySQL database on a private bridge network.

---

## 🚀 Execution & Deployment

### Prerequisites
- Docker & Docker Compose installed.
- (Optional) Maven if running locally without containers.

### Local Development
```bash
# Run with H2 (no database setup needed)
mvn spring-boot:run
```
Access at: `http://localhost:8081`

### Production (Docker Compose)
```bash
docker compose up -d --build
```
Access at: `http://localhost:8080`

### CI/CD (Jenkins + GitHub Webhook)
Push to `main` branch → GitHub webhook triggers Jenkins → Automated Blue-Green deployment.

---


## 📁 Project Structure

```text
├── src/main/java           # Spring Boot Source Code
│   ├── config/             # Security, DataSeeder, Admin
│   ├── controller/         # REST APIs (Appointments, Reviews, Q&A, Blogs)
│   ├── model/              # JPA Entities
│   └── repository/         # Spring Data Repositories
├── src/main/resources
│   ├── static/             # Frontend (HTML, CSS, JS)
│   │   ├── index.html      # Main clinic website
│   │   ├── blog.html       # Oral Health Journal
│   │   ├── admin.html      # Doctor dashboard
│   │   ├── style.css       # Full design system
│   │   └── script.js       # Client-side logic
│   └── application.properties  # Multi-profile configuration
├── Dockerfile              # Optimized Multi-stage Alpine Build
├── docker-compose.yml      # Database & Network Orchestration
├── Jenkinsfile             # CI/CD Blue-Green Pipeline
└── pom.xml                 # Dependency Management
```

---

## 👨‍💻 Admin Access

The Admin dashboard is located at   `/admin.html` . 
The first-time setup uses the default password   `shyam123` . We recommend updating this immediately via the **Settings** tab in the dashboard.

---

## 📜 Copyright
© 2026 **Jeevan Deep Clinic**. All rights reserved. Direct development only.
