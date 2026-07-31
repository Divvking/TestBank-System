TestBank System
Spring Boot 3.2 · PostgreSQL 15 · React 18 · Vite · Tailwind CSS · JWT
---
Overview
TestBank is a full-stack assessment platform designed for managing question banks, conducting tests, and analyzing student performance. It supports role-based access for administrators, faculty, and students.
---
Tech Stack
Layer	Technology
Backend	Spring Boot (Java 17)
Database	PostgreSQL 15
Frontend	React 18 + Vite
Styling	Tailwind CSS
Auth	JWT
---
Prerequisites
Tool	Version
Java	17+
Maven	3.9+
PostgreSQL	15+
Node.js	18+
---
1. Database Setup
```bash
psql -U postgres

CREATE DATABASE testbank_db;
\q

psql -U postgres -d testbank_db -f backend/src/main/resources/schema.sql
psql -U postgres -d testbank_db -f backend/src/main/resources/procedures.sql
psql -U postgres -d testbank_db -f backend/src/main/resources/data.sql
```
---
2. Backend Setup
Development
```bash
cd backend
mvn clean package -DskipTests
mvn spring-boot:run
```
API runs at:  
http://localhost:8080/api
---
Production
```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://your-host:5432/testbank_db
export SPRING_DATASOURCE_USERNAME=youruser
export SPRING_DATASOURCE_PASSWORD=yourpassword
export JWT_SECRET=<64-hex-secret>
export CORS_ALLOWED_ORIGINS=https://yourdomain.com

java -jar target/testbank-api-1.0.0.jar
```
Generate JWT secret:
```bash
openssl rand -hex 32
```
---
3. Frontend Setup
```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run build      # production build
```
Nginx Config (Production)
```nginx
location /api {
    proxy_pass http://localhost:8080;
}
```
---
Sample Users (Updated)
Password for all users: 123456
Name	Email	Role	Description
System Admin	admin@testbank.com	ADMIN	Full system control
Dr. Faculty	faculty@testbank.com	FACULTY	Creates and manages tests
Jane	jane@testbank.com	STUDENT	Test taking, performance tracking
---
Role-Based Access Control
Feature	ADMIN	FACULTY	STUDENT
Register/Login	✓	✓	✓
Manage Users	✓		
Manage Questions	✓	Own	
Manage Tests	✓	Own	
Take Tests			✓
View Results	✓	✓	Own
Analytics Dashboard	✓	✓	
Leaderboard	✓	✓	✓
---
API Overview
Authentication
POST /api/auth/register  
POST /api/auth/login
Categories
GET /api/categories  
POST /api/categories  
PUT /api/categories/{id}  
DELETE /api/categories/{id}
Questions
GET /api/questions  
GET /api/questions/{id}  
POST /api/questions  
PUT /api/questions/{id}  
DELETE /api/questions/{id}
Tests
GET /api/tests  
GET /api/tests/{id}  
POST /api/tests  
PUT /api/tests/{id}  
DELETE /api/tests/{id}
Attempts
POST /api/attempts/start/{testId}  
POST /api/attempts/{id}/submit  
GET /api/attempts/my
Results & Analytics
GET /api/results/attempt/{attemptId}  
GET /api/results/leaderboard/{testId}  
GET /api/analytics/dashboard
---
Database Highlights
Key Tables
user, role
question, category
test, test_question
attempt, response, result
Functions
calculate_result(attempt_id)
compute_rank(test_id)
Views
leaderboard_view
question_performance_view
---
Features
Dynamic Test Creation
Automated Evaluation (Triggers + Functions)
Leaderboard Ranking System
Category-wise Analysis
Question Performance Tracking
Role-Based Access Control
Secure JWT Authentication
---
Production Checklist
[ ] Set secure JWT_SECRET
[ ] Configure DB credentials via env variables
[ ] Enable HTTPS (Nginx/Cloud)
[ ] Build frontend (npm run build)
[ ] Configure backups (pg_dump)
[ ] Set logging to WARN level
---
Notes
Backend uses validated schema (no auto DDL changes)
Frontend communicates via /api proxy
Designed to be scalable and modular