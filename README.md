# Project Title - BLOGAPP

## Table of Contents
- Introduction
- Features
- Technologies Used
- System Architecture
- Installation
- Usage
- Project Structure
- API Endpoints

# Introduction
BlogApp is a modern full-stack application (React + Java Spring Boot + MySQL) ,which allows users and authors to read and write articles respectively.

# Features
- User Authentication
- Dashboard Management
- CRUD Operations
- Responsive UI
- Database Integration
- API Support

# Technologies Used
## Frontend
- HTML
- CSS
- JavaScript
- React

## Backend
- Java 17
- Spring Boot 3 (Spring Web, Spring Data JPA / Hibernate)
- JWT (jjwt) & BCrypt
- Maven

## Database
- MySQL

## Tools
- Git & GitHub
- VS Code

# System Architecture
BlogApp is a full-stack application (React frontend, Spring Boot REST backend, MySQL database).
It consists of a register page,when a user/author registers and creates an account,they are navigated to the login page.
Once logged in,a user is able to read articles ,respective of their category and can add comments.
An author can write multiple articles ,can update and modify articles.An admin can block users,admins and articles.

1. User sends request from frontend.
2. Backend processes the request.
3. Database stores/retrieves data.
4. Response is displayed on the UI.

# Installation
## Prerequisites
- JDK 17+ and Maven 3.9+
- Node.js 18+ and npm
- MySQL 8 (local or cloud)
- Git installed

## Steps
```bash
# Clone repository
git clone https://github.com/Cheripallyakshaya28/blog-app-frontend.git
cd BlogApp

# Backend API (http://localhost:4000)
cd blog-app-backend
# Keep the default local settings for a quick run; or set DB_URL to MySQL if you want to use a real database.
./mvnw spring-boot:run       # Windows: mvnw.cmd spring-boot:run

# Frontend app (http://localhost:5173) - in a second terminal
cd blog-app-frontend
npm install
npm run dev -- --host 0.0.0.0
```
