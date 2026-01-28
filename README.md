# DocSpot — Seamless Appointment Booking for Health

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js CI](https://img.shields.io/badge/node-%3E%3D14-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-green)](https://www.mongodb.com/)

DocSpot is a full-stack web application that simplifies booking medical appointments. It connects patients, doctors, and administrators using a real-time, user-friendly interface for scheduling, managing consultations, and tracking medical records.

---

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-technical-architecture)
- [Database Schema](#-database-schema)
- [Screenshots & Demo](#-screenshots--demo)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Project Structure](#-project-structure)
- [Contribution](#-contribution)
- [License](#-license)

---

## 🚀 Features

### Patient (User)
- Easy registration with email verification
- Search & filter doctors by specialty, location, and availability
- Real-time appointment slot selection
- Secure medical document upload
- Dashboard: booking history, notifications, appointment status
- Cancel or reschedule appointments

### Doctor
- Manage profile, availability timings, consultation fees, and experience
- Approve, reject, or complete appointment requests
- Update patient records and provide post-care (digital prescriptions, summaries)

### Admin
- Approve new doctor registrations
- Manage users and doctors (block/unblock)
- Oversee platform compliance and governance

---

## 🛠 Tech Stack

Frontend
- React (Vite)
- Ant Design & Bootstrap
- Redux Toolkit
- Axios

Backend
- Node.js + Express
- Multer (file uploads)
- Nodemailer (email notifications)

Database & Security
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

---

## 🏗 Technical Architecture

DocSpot follows a classic client-server architecture:

1. Client (React): UI for Users, Doctors, Admins; communicates via REST APIs.
2. Server (Express): Business logic, authentication, file processing.
3. Database (MongoDB): Stores users, doctors, appointments, documents.

---

## 🗄 Database Schema

Collections overview:

### Users
- _id — Unique identifier
- name — Full name
- email — Email address
- password — Hashed password
- isDoctor — Boolean
- isAdmin — Boolean
- notification — Array of notifications

### Doctors
- _id — Unique identifier
- userId — Reference to Users
- specialization — Specialty
- experience — Years
- fees — Consultation fee
- timings — Available time slots (start - end)
- status — Approval status (Pending / Approved)

### Appointments
- _id — Unique identifier
- userId — Patient ID
- doctorId — Doctor ID
- date — Appointment date
- time — Appointment time
- status — Pending / Scheduled / Completed / Cancelled
- documents — Path(s) to uploaded files

---

## 📸 Screenshots & Demo

Make sure you have an `assets` folder at the project root containing the referenced images and demo video.

Images
- Landing Page: `assets/landing_page.png`
- Login Page: `assets/login_page.png`
- Register Page: `assets/register_page.png`
- User Dashboard: `assets/user_dashboard.png`
- Book Appointment: `assets/book_doctor.png`
- Doctor Dashboard: `assets/doctor_dashboard.png`
- Admin Dashboard: `assets/admin_dashboard.png`

- Admin Dashboard: `assets/admin_dashboard.png`

Demo Video
- A demo video is included in the assets folder: `assets/demo.mp4`

Embed (works on GitHub README via HTML):
```html
<video controls width="720" src="assets/lopala%20demo.mp4">
  Your browser does not support the video tag. Download the demo:
  <a href="assets/lopala%20demo.mp4">Download demo video</a>
</video>
```

Fallback link:
- Demo video file: [assets/lopala demo.mp4](assets/lopala%20demo.mp4)

---

## ⚙️ Prerequisites

- Node.js v14 or higher
- npm
- MongoDB (local or Atlas)

---

## 📥 Installation & Setup

1. Clone the repository
```bash
git clone https://github.com/ayyappavenkatasurya/DocSpot-Seamless-Appointment-Booking-for-Health.git
cd DocSpot-Seamless-Appointment-Booking-for-Health
```

2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with these variables (example):
```env
PORT=8080
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
ADMIN_EMAIL=admin@docspot.com
ADMIN_PASSWORD=admin123
```

Start the backend:
```bash
npm start
# or, if you prefer nodemon for development
npm run dev
```
By default the server runs on port 8080 (unless you changed PORT in `.env`).

3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Vite's dev server usually runs at `http://localhost:5173`.

---

## 📂 Project Structure

Root layout:
```
DocSpot/
├── backend/
│   ├── config/         # DB configuration
│   ├── controllers/    # Route logic & business logic
│   ├── middlewares/    # Auth and upload middlewares
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API endpoints
│   ├── uploads/        # Stored medical documents
│   ├── server.js       # Entry point
│   └── .env            # Environment variables (not committed)
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/ # Reusable UI components (Layout, DoctorCard)
│   │   ├── pages/      # Pages (Login, Dashboard, Booking, etc.)
│   │   ├── redux/      # Redux store & slices
│   │   ├── App.jsx     # Main component
│   │   └── main.jsx    # DOM renderer
│   └── package.json
├── assets/             # Images and demo video (add `lopala demo.mp4` here)
└── README.md
```

Notes:
- Place the demo video file exactly at `assets/lopala demo.mp4` (or rename and update the README accordingly).
- Keep `uploads/` in backend for user-uploaded documents; ensure `.gitignore` excludes uploads if necessary.

---

## 🤝 Contribution

Contributions are welcome! Please follow these steps:

1. Fork the project
2. Create your feature branch
```bash
git checkout -b feature/AmazingFeature
```
3. Commit your changes
```bash
git commit -m "Add some AmazingFeature"
```
4. Push to branch
```bash
git push origin feature/AmazingFeature
```
5. Open a Pull Request

Please open issues for bugs or feature requests before large changes.

---

## 🧪 Tests

(If you add tests later, document how to run them here — e.g., `npm test`)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## ✉️ Contact

Project maintained by: ayyappavenkatasurya  
For questions, open an issue or reach out via GitHub.

Thank you for using DocSpot — making healthcare appointments simpler and more reliable.