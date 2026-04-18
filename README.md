# MediRemind - Medicine & Appointment Reminder System

MediRemind is a full-stack web application that helps users manage medicines, doctor appointments, and health reminders.  
It also supports inviting a caretaker/observer to monitor health activity.

---

## Features

- User registration and login with JWT authentication
- Add, update, delete, search, and filter medicines
- AI-powered medicine search (Groq API)
- Manage doctor appointments
- Track medicine intake history
- Invite observer/caretaker via email
- Automated email reminders for medicines and appointments
- Dashboard summary of health activity

---

## Tech Stack

### Backend
- Java 21
- Spring Boot 3
- Spring Security + JWT
- Spring Data JPA
- MySQL
- Spring Mail (Gmail SMTP)
- Lombok
- Maven

### Frontend
- React 18
- Vite
- Tailwind CSS
- Axios
- Groq API

---

## Project Structure

```text
mediremind/
├── src/                # Spring Boot backend
├── frontend/           # React frontend (Vite + Tailwind)
├── pom.xml
└── README.md
```

Backend package layout:

```text
src/main/java/com/mediremind/
├── config/
├── controller/
├── dto/
│   ├── request/
│   └── response/
├── enums/
├── model/
├── repository/
├── scheduler/
├── security/
└── service/
```

Frontend layout:

```text
frontend/src/
├── api/
├── components/
├── context/
├── hooks/
├── pages/
└── utils/
```

---

## Prerequisites

- Java 21
- Maven
- MySQL
- Node.js (LTS recommended)
- npm

---

## Getting Started

### 1) Clone the Repository

```bash
git clone https://github.com/Kavisanah/mediremind.git
cd mediremind
```

---

### 2) Backend Setup

#### Create database

```sql
CREATE DATABASE mediremind;
```

#### Configure backend environment

Copy `application.properties.example` to `application.properties` and update values:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/mediremind
spring.datasource.username=your_db_username
spring.datasource.password=your_db_password

spring.jpa.hibernate.ddl-auto=update

jwt.secret=your_secret_key_minimum_64_characters
jwt.expiration=86400000

spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

app.backend-url=http://localhost:8080
```

#### Run backend

**Windows**
```bash
mvnw.cmd spring-boot:run
```

**macOS/Linux**
```bash
./mvnw spring-boot:run
```

Backend URL: `http://localhost:8080`

---

### 3) Frontend Setup

```bash
cd frontend
npm install
```

Copy `.env.example` to `.env` and update values:

```env
VITE_API_URL=http://localhost:8080
VITE_GROQ_API_KEY=your_groq_api_key
```

Run frontend:

```bash
npm run dev
```

Frontend URL: `http://localhost:5173`

---

## API Overview

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Medicines
- `GET /api/medicines`
- `POST /api/medicines`
- `PUT /api/medicines/{id}`
- `DELETE /api/medicines/{id}`

### Appointments
- `GET /api/appointments`
- `POST /api/appointments`

### Observer
- `POST /api/observer/invite`
- `GET /api/observer/accept`

### Dashboard
- `GET /api/dashboard`

---

## Security

All endpoints except `/api/auth/**` require JWT in the header:

```http
Authorization: Bearer your_token_here
```

- Passwords are stored with BCrypt.
- Sensitive files (`application.properties`, `.env`) are excluded from version control.

---

## Notes

- Use `.example` files as local setup templates.
- Email reminders are sent automatically by scheduled backend tasks.
- Ensure Gmail SMTP app password is configured if using Gmail.

---

## License

Add your preferred license here (e.g., MIT).
