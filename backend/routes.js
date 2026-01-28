import express from 'express';
import { userController, adminController, doctorController } from './controllers.js';
import { authMiddleware, uploadMiddleware } from './middlewares.js';

const router = express.Router();

// --- User Routes ---
router.post('/user/register', userController.register);
router.post('/user/verify-otp', userController.verifyOtp); // ADDED: OTP Verification Route
router.post('/user/login', userController.login);
router.post('/user/get-user-info-by-id', authMiddleware, userController.getUserInfoById);
router.post('/user/update-user-profile', authMiddleware, userController.updateUserProfile);
router.post('/user/apply-doctor-account', authMiddleware, userController.applyDoctorAccount);
router.post('/user/mark-all-notifications-as-seen', authMiddleware, userController.markAllNotificationsAsSeen);
router.post('/user/delete-all-notifications', authMiddleware, userController.deleteAllNotifications);

router.get('/user/get-all-approved-doctors', authMiddleware, userController.getAllApprovedDoctors);

router.post('/user/book-appointment', authMiddleware, uploadMiddleware.single('medicalDocument'), userController.bookAppointment);
router.post('/user/check-booking-availability', authMiddleware, userController.checkBookingAvailability);
router.get('/user/get-appointments-by-user-id', authMiddleware, userController.userAppointments);

router.post('/user/cancel-appointment', authMiddleware, userController.cancelAppointment);

// --- Doctor Routes ---
router.post('/doctor/get-doctor-info-by-user-id', authMiddleware, doctorController.getDoctorInfoByUserId);
router.post('/doctor/get-doctor-info-by-id', authMiddleware, doctorController.getDoctorInfoById);
router.post('/doctor/update-doctor-profile', authMiddleware, doctorController.updateDoctorProfile);
router.get('/doctor/get-appointments-by-doctor-id', authMiddleware, doctorController.getAppointmentsByDoctorId);
router.post('/doctor/change-appointment-status', authMiddleware, doctorController.changeAppointmentStatus);
router.post('/doctor/complete-appointment', authMiddleware, doctorController.completeAppointment);

// --- Admin Routes ---
router.get('/admin/get-all-doctors', authMiddleware, adminController.getAllDoctors);
router.get('/admin/get-all-users', authMiddleware, adminController.getAllUsers);
router.post('/admin/change-doctor-account-status', authMiddleware, adminController.changeDoctorStatus);
router.post('/admin/change-user-block-status', authMiddleware, adminController.changeUserBlockStatus);

export default router;