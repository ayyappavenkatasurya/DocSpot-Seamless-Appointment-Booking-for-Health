import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import nodemailer from 'nodemailer';
import { User, Doctor, Appointment } from './models.js';

// --- EMAIL UTILITY ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, text) => {
    try {
        await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.log("Email error:", error);
    }
};

// --- USER CONTROLLERS ---
export const userController = {
    login: async (req, res) => {
        try {
            const user = await User.findOne({ email: req.body.email });
            if (!user) return res.status(200).send({ message: "User not found", success: false });

            if (user.isBlocked) {
                return res.status(200).send({ message: "Your account is blocked. Contact Admin.", success: false });
            }
            
            if (!user.isVerified) {
                return res.status(200).send({ message: "Account not verified. Please register again to verify.", success: false });
            }
            
            const isMatch = await bcrypt.compare(req.body.password, user.password);
            if (!isMatch) return res.status(200).send({ message: "Invalid password", success: false });

            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
            res.status(200).send({ message: "Login Successful", success: true, token });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Error login", success: false, error });
        }
    },

    register: async (req, res) => {
        try {
            const existingUser = await User.findOne({ email: req.body.email });
            
            if (existingUser && existingUser.isVerified) {
                return res.status(200).send({ message: "User already exists", success: false });
            }

            const password = req.body.password;
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            if (existingUser && !existingUser.isVerified) {
                existingUser.password = hashedPassword;
                existingUser.name = req.body.name;
                existingUser.phone = req.body.phone;
                existingUser.otp = otp;
                await existingUser.save();
            } else {
                const newUser = new User({
                    ...req.body,
                    password: hashedPassword,
                    otp: otp,
                    isVerified: false
                });
                await newUser.save();
            }

            sendEmail(req.body.email, "DocSpot Verification Code", `Your verification code is: ${otp}`);

            res.status(200).send({ message: "OTP sent to your email", success: true, showOtpField: true });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Error registering user", success: false, error });
        }
    },

    verifyOtp: async (req, res) => {
        try {
            const { email, otp } = req.body;
            const user = await User.findOne({ email });

            if (!user) return res.status(200).send({ message: "User not found", success: false });

            if (user.otp === otp) {
                user.isVerified = true;
                user.otp = null; 
                await user.save();

                const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
                
                sendEmail(user.email, "Welcome to DocSpot", "Thank you for verifying your account!");

                res.status(200).send({ message: "Verification Successful", success: true, token });
            } else {
                res.status(200).send({ message: "Invalid OTP", success: false });
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Error verifying OTP", success: false, error });
        }
    },

    getUserInfoById: async (req, res) => {
        try {
            const user = await User.findOne({ _id: req.userId }); 
            if (!user) return res.status(200).send({ message: "User does not exist", success: false });
            user.password = undefined; 
            user.otp = undefined;

            const doctorProfile = await Doctor.findOne({ userId: req.userId });
            const userData = user.toObject();
            
            if (doctorProfile) {
                userData.doctorStatus = doctorProfile.status;
            }

            res.status(200).send({ success: true, data: userData });
        } catch (error) {
            res.status(500).send({ message: "Error getting user info", success: false, error });
        }
    },
    
    updateUserProfile: async (req, res) => {
        try {
            const { name, phone } = req.body; 
            const user = await User.findByIdAndUpdate(req.userId, { name, phone }, { new: true });
            user.password = undefined;
            res.status(200).send({ message: "Profile Updated Successfully", success: true, data: user });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Error updating profile", success: false, error });
        }
    },

    applyDoctorAccount: async (req, res) => {
        try {
            const existingDoctor = await Doctor.findOne({ userId: req.userId });
            const notification = {
                type: "new-doctor-request",
                message: `${req.body.firstName} ${req.body.lastName} has applied for a doctor account`,
                data: { name: req.body.firstName },
                onClickPath: "/admin/doctors"
            };

            if (existingDoctor) {
                if (existingDoctor.status === 'pending') {
                    return res.status(200).send({ message: "You have already applied (Status: Pending)", success: false });
                }
                if (existingDoctor.status === 'approved') {
                    return res.status(200).send({ message: "You are already a doctor", success: false });
                }
                if (existingDoctor.status === 'rejected') {
                    await Doctor.findOneAndUpdate(
                        { userId: req.userId }, 
                        { ...req.body, status: 'pending' } 
                    );
                    // Atomic Update for Admin Notifications
                    await User.updateMany({ isAdmin: true }, { $push: { unseenNotifications: notification } });
                    return res.status(200).send({ success: true, message: "Doctor account RE-APPLIED successfully" });
                }
            }

            const newDoctor = new Doctor({ ...req.body, userId: req.userId, status: "pending" });
            await newDoctor.save();
            
            // Atomic Update for Admin Notifications
            await User.updateMany({ isAdmin: true }, { $push: { unseenNotifications: notification } });
            
            res.status(200).send({ success: true, message: "Doctor account applied successfully" });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Error applying doctor account", success: false, error });
        }
    },

    markAllNotificationsAsSeen: async (req, res) => {
        try {
            const user = await User.findOne({ _id: req.userId });
            const unseenNotifications = user.unseenNotifications;
            const seenNotifications = user.seenNotifications;
            seenNotifications.push(...unseenNotifications);
            user.unseenNotifications = [];
            user.seenNotifications = seenNotifications;
            const updatedUser = await user.save();
            updatedUser.password = undefined;
            res.status(200).send({ success: true, message: "All notifications marked as seen", data: updatedUser });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Error marking notifications", success: false, error });
        }
    },

    deleteAllNotifications: async (req, res) => {
        try {
            const user = await User.findOne({ _id: req.userId });
            user.seenNotifications = [];
            user.unseenNotifications = [];
            const updatedUser = await user.save();
            updatedUser.password = undefined;
            res.status(200).send({ success: true, message: "Notifications deleted", data: updatedUser });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Error deleting notifications", success: false, error });
        }
    },

    getAllApprovedDoctors: async (req, res) => {
        try {
            const { search, specialization } = req.query;
            let query = { status: "approved" };

            if (specialization && specialization !== 'all') {
                query.specialization = { $regex: specialization, $options: "i" };
            }

            if (search) {
                query.$or = [
                    { firstName: { $regex: search, $options: "i" } },
                    { lastName: { $regex: search, $options: "i" } },
                    { address: { $regex: search, $options: "i" } }
                ];
            }

            const doctors = await Doctor.find(query);
            res.status(200).send({ message: "Doctors fetched successfully", success: true, data: doctors });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Error fetching doctors", success: false, error });
        }
    },

    bookAppointment: async (req, res) => {
        try {
            const { doctorId, date, time } = req.body;
            // FIX: Normalize path for Windows (replace backslashes with forward slashes)
            const documentPath = req.file ? req.file.path.replace(/\\/g, "/") : "";

            const doctor = await Doctor.findById(doctorId);
            if (!doctor) return res.status(200).send({ message: "Doctor not found", success: false });

            if (doctor.userId === req.userId) {
                 return res.status(200).send({ message: "You cannot book an appointment with yourself", success: false });
            }

            // --- TIME LOGIC: Compare Minutes ---
            const startMoment = moment(doctor.timings[0], "h:mm a");
            const endMoment = moment(doctor.timings[1], "h:mm a");
            const requestMoment = moment(time, "h:mm a");

            const startMinutes = startMoment.hours() * 60 + startMoment.minutes();
            const endMinutes = endMoment.hours() * 60 + endMoment.minutes();
            const requestMinutes = requestMoment.hours() * 60 + requestMoment.minutes();

            // FIX: Strict check (>=) for end time. Cannot start appointment AT closing time.
            if (requestMinutes < startMinutes || requestMinutes >= endMinutes) {
                 return res.status(200).send({ message: "Time is outside doctor's working hours", success: false });
            }
            // -----------------------------------

            // PAST DATE CHECK (With 10 min buffer)
            const combinedDateTime = moment(`${date} ${time}`, "DD-MM-YYYY h:mm a");
            const nowWithBuffer = moment().subtract(10, 'minutes');

            if (combinedDateTime.isBefore(nowWithBuffer)) {
                 return res.status(200).send({ message: "Cannot book appointment in the past", success: false });
            }

            const existing = await Appointment.findOne({ 
                doctorId: doctorId, 
                date: date,
                time: time, 
                status: { $in: ['pending', 'approved'] } 
            });

            if(existing) {
                return res.status(200).send({ message: "Slot already taken", success: false });
            }

            const user = await User.findById(req.userId);
            const newAppointment = new Appointment({
                userId: req.userId,
                doctorId: doctorId,
                doctorInfo: doctor,
                userInfo: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone || ""
                },
                date: date,
                time: time,
                status: "pending",
                documents: documentPath 
            });

            await newAppointment.save();
            
            // FIX: Atomic push to avoid race conditions/null errors
            await User.findByIdAndUpdate(doctor.userId, {
                $push: {
                    unseenNotifications: {
                        type: "new-appointment-request",
                        message: `New appointment request from ${user.name}`,
                        onClickPath: "/doctor/appointments"
                    }
                }
            });

            sendEmail(user.email, "Appointment Request Received", `Your request for Dr. ${doctor.firstName} on ${date} at ${time} is pending approval.`);
            
            res.status(200).send({ message: "Appointment booked successfully", success: true });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Error booking appointment", success: false, error });
        }
    },

    checkBookingAvailability: async (req, res) => {
        try {
            const { date, time, doctorId } = req.body;
            const doctor = await Doctor.findById(doctorId);
            if(!doctor) return res.status(200).send({ message: "Doctor not found", success: false });

            // --- TIME LOGIC ---
            const startMoment = moment(doctor.timings[0], "h:mm a");
            const endMoment = moment(doctor.timings[1], "h:mm a");
            const requestMoment = moment(time, "h:mm a");

            const startMinutes = startMoment.hours() * 60 + startMoment.minutes();
            const endMinutes = endMoment.hours() * 60 + endMoment.minutes();
            const requestMinutes = requestMoment.hours() * 60 + requestMoment.minutes();

            // FIX: Strict check (>=) for end time
            if (requestMinutes < startMinutes || requestMinutes >= endMinutes) {
                 return res.status(200).send({ message: "Time is outside working hours", success: false });
            }
            // ------------------

            // PAST DATE CHECK 
            const combinedDateTime = moment(`${date} ${time}`, "DD-MM-YYYY h:mm a");
            const nowWithBuffer = moment().subtract(10, 'minutes');
            
            if (combinedDateTime.isBefore(nowWithBuffer)) {
                 return res.status(200).send({ message: "Cannot book in the past", success: false });
            }

            const appointments = await Appointment.find({
                doctorId, 
                date, 
                time, 
                status: { $in: ['pending', 'approved'] }
            });
            
            if (appointments.length > 0) {
                return res.status(200).send({ message: "Slot not available", success: false });
            } else {
                return res.status(200).send({ message: "Slot available", success: true });
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Error checking availability", success: false, error });
        }
    },

    userAppointments: async (req, res) => {
        try {
            const appointments = await Appointment.find({ userId: req.userId }).sort({ createdAt: -1 });
            res.status(200).send({ message: "Appointments fetched", success: true, data: appointments });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Error fetching appointments", success: false, error });
        }
    },

    cancelAppointment: async (req, res) => {
        try {
            const { appointmentId } = req.body;
            const appointment = await Appointment.findOne({ _id: appointmentId, userId: req.userId });
            
            if (!appointment) return res.status(200).send({ message: "Appointment not found", success: false });
            
            if (appointment.status === 'completed' || appointment.status === 'cancelled') {
                return res.status(200).send({ message: "Cannot cancel this appointment", success: false });
            }

            appointment.status = "cancelled";
            await appointment.save();

            // FIX: Atomic push
            await User.findByIdAndUpdate(appointment.doctorInfo.userId, {
                $push: {
                    unseenNotifications: {
                        type: "appointment-cancelled",
                        message: `Appointment with ${appointment.userInfo.name} has been cancelled by the patient.`,
                        onClickPath: "/doctor/appointments"
                    }
                }
            });

            res.status(200).send({ message: "Appointment cancelled successfully", success: true });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Error cancelling appointment", success: false, error });
        }
    }
};

// --- DOCTOR CONTROLLERS ---
export const doctorController = {
    getDoctorInfoByUserId: async (req, res) => {
        try {
            const doctor = await Doctor.findOne({ userId: req.body.userId || req.userId });
            res.status(200).send({ success: true, message: "Doctor info fetched", data: doctor });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Error fetching info", success: false, error });
        }
    },
    
    getDoctorInfoById: async (req, res) => {
        try {
            const doctor = await Doctor.findOne({ _id: req.body.doctorId });
            res.status(200).send({ success: true, message: "Doctor info fetched", data: doctor });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Error fetching info", success: false, error });
        }
    },

    updateDoctorProfile: async (req, res) => {
        try {
            const doctor = await Doctor.findOneAndUpdate(
                { userId: req.userId }, 
                req.body, 
                { new: true }
            );
            res.status(200).send({ success: true, message: "Profile updated", data: doctor });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Error updating", success: false, error });
        }
    },

    getAppointmentsByDoctorId: async (req, res) => {
        try {
            const doctor = await Doctor.findOne({ userId: req.userId });
            const appointments = await Appointment.find({ doctorId: doctor._id }).sort({ createdAt: -1 });
            res.status(200).send({ success: true, message: "Appointments fetched", data: appointments });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Error fetching", success: false, error });
        }
    },

    changeAppointmentStatus: async (req, res) => {
        try {
            const { appointmentId, status } = req.body;
            const appointment = await Appointment.findByIdAndUpdate(appointmentId, { status }, { new: true });
            
            // FIX: Atomic Push
            await User.findByIdAndUpdate(appointment.userId, {
                $push: {
                    unseenNotifications: {
                        type: "appointment-status-changed",
                        message: `Your appointment with Dr. ${appointment.doctorInfo.firstName} has been ${status}`,
                        onClickPath: "/user/appointments"
                    }
                }
            });

            if(status === 'approved') {
                const user = await User.findById(appointment.userId);
                sendEmail(user.email, "Appointment Confirmed", `Your appointment with Dr. ${appointment.doctorInfo.firstName} on ${appointment.date} at ${appointment.time} has been confirmed.`);
            }
            
            res.status(200).send({ message: "Status updated successfully", success: true });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Error updating status", success: false, error });
        }
    },

    completeAppointment: async (req, res) => {
        try {
            const { appointmentId, prescription, visitSummary } = req.body;
            const appointment = await Appointment.findByIdAndUpdate(
                appointmentId, 
                { 
                    status: 'completed',
                    prescription,
                    visitSummary
                }, 
                { new: true }
            );

            // FIX: Atomic Push
            await User.findByIdAndUpdate(appointment.userId, {
                $push: {
                    unseenNotifications: {
                        type: "appointment-completed",
                        message: `Your appointment with Dr. ${appointment.doctorInfo.firstName} is complete. View summary/prescription.`,
                        onClickPath: "/user/appointments"
                    }
                }
            });
            
            const user = await User.findById(appointment.userId);
            sendEmail(user.email, "Visit Summary", `Dr. ${appointment.doctorInfo.firstName} has added a visit summary and prescription. Check your dashboard.`);

            res.status(200).send({ message: "Appointment completed details saved", success: true, data: appointment });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Error completing appointment", success: false, error });
        }
    }
};

// --- ADMIN CONTROLLERS ---
export const adminController = {
    getAllDoctors: async (req, res) => {
        try {
            const doctors = await Doctor.find({});
            const doctorsWithEmail = await Promise.all(doctors.map(async (doc) => {
                const user = await User.findById(doc.userId);
                return {
                    ...doc.toObject(),
                    email: user ? user.email : "N/A"
                };
            }));

            res.status(200).send({ message: "Doctors fetched", success: true, data: doctorsWithEmail });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Error", success: false, error });
        }
    },

    getAllUsers: async (req, res) => {
        try {
            const users = await User.find({});
            res.status(200).send({ message: "Users fetched", success: true, data: users });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Error", success: false, error });
        }
    },

    changeDoctorStatus: async (req, res) => {
        try {
            const { doctorId, status } = req.body;
            const doctor = await Doctor.findByIdAndUpdate(doctorId, { status }, { new: true });
            
            const user = await User.findOne({ _id: doctor.userId });
            if (user) {
                user.unseenNotifications.push({
                    type: "doctor-status-changed",
                    message: `Your doctor account has been ${status}`,
                    onClickPath: "/notification"
                });
                
                user.isDoctor = status === "approved" ? true : false;
                await user.save();
            }
            
            res.status(200).send({ message: "Doctor status updated", success: true, data: doctor });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Error", success: false, error });
        }
    },

    changeUserBlockStatus: async (req, res) => {
        try {
            const { userId, isBlocked } = req.body;
            const user = await User.findByIdAndUpdate(userId, { isBlocked }, { new: true });
            res.status(200).send({ message: `User ${isBlocked ? 'Blocked' : 'Unblocked'}`, success: true, data: user });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Error", success: false, error });
        }
    }
};