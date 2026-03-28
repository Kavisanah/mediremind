git# MediRemind - Medicine & Appointment Reminder System

MediRemind is a backend REST API built with Spring Boot. It helps users track their medicines, manage appointments, and receive email reminders. Users can also invite a caretaker or family member to monitor their health activity.

---

## Features

- User registration and login with JWT authentication
- Add, update, and delete medicines with dosage schedules
- Track and manage doctor appointments
- Log medicine intake history
- Invite an observer/caretaker via email
- Automated email reminders for medicines and appointments
- Dashboard with a summary of the user's health activity

---

## Tech Stack

- Java 21
- Spring Boot 3
- Spring Security with JWT
- Spring Data JPA
- MySQL
- Spring Mail (Gmail SMTP)
- Lombok
- Maven

---

## Project Structure

```
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

---

## Getting Started

### Requirements

- Java 21
- MySQL
- Maven

### Steps

1. Clone the repository

```bash
git clone https://github.com/Kavisanah/mediremind.git
cd mediremind
```

2. Create the database

```sql
CREATE DATABASE mediremind;
```

3. Set up your configuration

Copy `application.properties.example` to `application.properties` and fill in your values:

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

4. Run the application

```bash
./mvnw spring-boot:run
```

The server runs on `http://localhost:8080`

---

## API Overview

### Authentication
- POST `/api/auth/register`
- POST `/api/auth/login`

### Medicines
- GET `/api/medicines`
- POST `/api/medicines`
- PUT `/api/medicines/{id}`
- DELETE `/api/medicines/{id}`

### Appointments
- GET `/api/appointments`
- POST `/api/appointments`

### Observer
- POST `/api/observer/invite`
- GET `/api/observer/accept`

### Dashboard
- GET `/api/dashboard`

---

## Security

All endpoints except `/api/auth/**` require a JWT token in the request header:

```
Authorization: Bearer your_token_here
```

Passwords are stored using BCrypt encoding.

---

## Notes

- The `application.properties` file is excluded from version control to protect credentials
- Use the provided `.example` file as a reference when setting up locally
- Email reminders are sent automatically based on scheduled tasks
