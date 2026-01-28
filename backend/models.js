import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    isAdmin: { type: Boolean, default: false },
    isDoctor: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false }, 
    isVerified: { type: Boolean, default: false }, // ADDED: Verification status
    otp: { type: String, default: null },          // ADDED: OTP storage
    unseenNotifications: { type: Array, default: [] },
    seenNotifications: { type: Array, default: [] },
}, { timestamps: true });

const doctorSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    website: { type: String, required: false },
    address: { type: String, required: true },
    specialization: { type: String, required: true },
    experience: { type: String, required: true },
    feesPerCunsultation: { type: Number, required: true },
    timings: { type: Array, required: true }, 
    status: { type: String, default: "pending" },
}, { timestamps: true });

const appointmentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    doctorId: { type: String, required: true },
    doctorInfo: { type: Object, required: true },
    userInfo: { type: Object, required: true },
    date: { type: String, required: true }, 
    time: { type: String, required: true }, 
    status: { type: String, required: true, default: "pending" },
    documents: { type: String, default: "" },
    prescription: { type: String, default: "" },
    visitSummary: { type: String, default: "" }
}, { timestamps: true });

export const User = mongoose.model('users', userSchema);
export const Doctor = mongoose.model('doctors', doctorSchema);
export const Appointment = mongoose.model('appointments', appointmentSchema);