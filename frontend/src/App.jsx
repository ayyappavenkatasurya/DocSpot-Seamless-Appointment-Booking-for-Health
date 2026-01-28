import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';

import HomePage from './pages/publicpages';
import { LoginPage, RegisterPage } from './pages/authpages';
import { 
  DashboardPage, ApplyDoctorPage, NotificationPage, 
  AppointmentsPage, BookingPage, UserProfile 
} from './pages/userpages'; // Imported UserProfile
import { AdminUsers, AdminDoctors } from './pages/adminpages';
import { DoctorProfile, DoctorAppointments } from './pages/doctorpages';
import { Spinner, PublicRoute, ProtectedRoute } from './components';

function App() {
  const { loading } = useSelector((state) => state.alerts);
  return (
    <>
      {loading && <Spinner />}
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* User Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/apply-doctor" element={<ProtectedRoute><ApplyDoctorPage /></ProtectedRoute>} />
        <Route path="/notification" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />
        <Route path="/user/appointments" element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />
        <Route path="/user/profile/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} /> {/* ADDED */}
        <Route path="/book-appointment/:doctorId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/doctors" element={<ProtectedRoute><AdminDoctors /></ProtectedRoute>} />

        {/* Doctor Routes */}
        <Route path="/doctor/profile/:id" element={<ProtectedRoute><DoctorProfile /></ProtectedRoute>} />
        <Route path="/doctor/appointments" element={<ProtectedRoute><DoctorAppointments /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default App;