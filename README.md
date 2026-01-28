# DocSpot — Seamless Appointment Booking for Health

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js CI](https://img.shields.io/badge/node-%3E%3D14-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-green)](https://www.mongodb.com/)

DocSpot is a full-stack web application that simplifies booking medical appointments. It connects patients, doctors, and administrators using a real-time, user-friendly interface for scheduling, managing consultations, and tracking medical records.

---

## 🛠 Tech Stack

**Frontend**
- React (Vite)
- Ant Design & Bootstrap
- Redux Toolkit
- Axios

**Backend**
- Node.js + Express
- Multer (file uploads)
- Nodemailer (email notifications)

**Database & Security**
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

---

## 🏗 Technical Architecture

DocSpot follows a classic client-server architecture:

1. **Client (React):** UI for Users, Doctors, Admins; communicates via REST APIs.
2. **Server (Express):** Business logic, authentication, file processing.
3. **Database (MongoDB):** Stores users, doctors, appointments, documents.


## 📸 Screenshots & Demo

### Application Interface

| Landing Page | Login Page |
| :---: | :---: |
| ![Landing Page](https://raw.githubusercontent.com/ayyappavenkatasurya/DocSpot-Seamless-Appointment-Booking-for-Health/master/assets/landing_page.png) | ![Login Page](https://raw.githubusercontent.com/ayyappavenkatasurya/DocSpot-Seamless-Appointment-Booking-for-Health/master/assets/login_page.png) |

| Register Page | Book Appointment |
| :---: | :---: |
| ![Register Page](https://raw.githubusercontent.com/ayyappavenkatasurya/DocSpot-Seamless-Appointment-Booking-for-Health/master/assets/register_page.png) | ![Book Doctor](https://raw.githubusercontent.com/ayyappavenkatasurya/DocSpot-Seamless-Appointment-Booking-for-Health/master/assets/book_doctor.png) |

### Dashboards

**User Dashboard**
![User Dashboard](https://raw.githubusercontent.com/ayyappavenkatasurya/DocSpot-Seamless-Appointment-Booking-for-Health/master/assets/user_dashboard.png)

**Doctor Dashboard**
![Doctor Dashboard](https://raw.githubusercontent.com/ayyappavenkatasurya/DocSpot-Seamless-Appointment-Booking-for-Health/master/assets/doctor_dashboard.png)

**Admin Dashboard**
![Admin Dashboard](https://raw.githubusercontent.com/ayyappavenkatasurya/DocSpot-Seamless-Appointment-Booking-for-Health/master/assets/admin_dashboard.png)

### 🎥 Demo Video

You can download or view the demo video using the link below:

[**▶️ Watch Demo Video (demo.mp4)**](https://raw.githubusercontent.com/ayyappavenkatasurya/DocSpot-Seamless-Appointment-Booking-for-Health/master/assets/demo.mp4)

---

## ⚙️ Prerequisites

- Node.js v14 or higher
- npm
- MongoDB (local or Atlas)

---

## 📥 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone [https://github.com/ayyappavenkatasurya/DocSpot-Seamless-Appointment-Booking-for-Health.git](https://github.com/ayyappavenkatasurya/DocSpot-Seamless-Appointment-Booking-for-Health.git)
   cd DocSpot-Seamless-Appointment-Booking-for-Health