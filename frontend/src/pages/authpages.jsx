import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { alertActions } from '../redux/alertSlice';

export const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const onFinish = async (values) => {
        try {
            dispatch(alertActions.showLoading());
            const res = await axios.post('/api/user/login', values);
            dispatch(alertActions.hideLoading());
            if (res.data.success) {
                toast.success(res.data.message);
                localStorage.setItem('token', res.data.token);
                navigate('/dashboard');
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            dispatch(alertActions.hideLoading());
            toast.error('Something went wrong');
        }
    };

    return (
        <div className="authentication">
            <div className="authentication-form animate__animated animate__fadeIn">
                <div className="text-center mb-4">
                    <h1 className="text-primary fw-bold mb-0">DocSpot</h1>
                    <p className="text-muted">Login to book your appointments</p>
                </div>
                
                <Form layout="vertical" onFinish={onFinish} size="large">
                    <Form.Item label="Email" name="email" rules={[{required: true, type: 'email'}]}>
                        <Input prefix={<i className="fa-solid fa-envelope text-muted"></i>} placeholder="name@example.com" />
                    </Form.Item>
                    <Form.Item label="Password" name="password" rules={[{required: true}]}>
                        <Input.Password prefix={<i className="fa-solid fa-lock text-muted"></i>} placeholder="Enter your password" />
                    </Form.Item>
                    
                    <Button className="primary-button my-2 full-width-button w-100" htmlType="submit">
                        LOGIN
                    </Button>
                    
                    <div className="text-center mt-3">
                        <Link to="/register" className="anchor">New user? Register here</Link>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export const RegisterPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [email, setEmail] = useState('');

    const onFinish = async (values) => {
        try {
            dispatch(alertActions.showLoading());
            const res = await axios.post('/api/user/register', values);
            dispatch(alertActions.hideLoading());
            if (res.data.success) {
                toast.success(res.data.message);
                setIsOtpSent(true);
                setEmail(values.email);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            dispatch(alertActions.hideLoading());
            toast.error('Something went wrong');
        }
    };

    const onVerifyOtp = async (values) => {
        try {
            dispatch(alertActions.showLoading());
            const res = await axios.post('/api/user/verify-otp', { email, otp: values.otp });
            dispatch(alertActions.hideLoading());
            if (res.data.success) {
                toast.success(res.data.message);
                localStorage.setItem('token', res.data.token); // Auto Login
                navigate('/dashboard');
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            dispatch(alertActions.hideLoading());
            toast.error('Something went wrong');
        }
    };

    return (
        <div className="authentication">
            <div className="authentication-form animate__animated animate__fadeIn">
                 <div className="text-center mb-4">
                    <h1 className="text-primary fw-bold mb-0">DocSpot</h1>
                    <p className="text-muted">{isOtpSent ? "Verify your email" : "Create your account"}</p>
                </div>

                {!isOtpSent ? (
                    // Registration Form
                    <Form layout="vertical" onFinish={onFinish} size="large">
                        <Form.Item label="Full Name" name="name" rules={[{required: true}]}>
                            <Input prefix={<i className="fa-solid fa-user text-muted"></i>} placeholder="John Doe" />
                        </Form.Item>
                        <Form.Item label="Phone Number" name="phone">
                            <Input prefix={<i className="fa-solid fa-phone text-muted"></i>} placeholder="9876543210" />
                        </Form.Item>
                        <Form.Item label="Email" name="email" rules={[{required: true, type: 'email'}]}>
                            <Input prefix={<i className="fa-solid fa-envelope text-muted"></i>} placeholder="name@example.com" />
                        </Form.Item>
                        <Form.Item label="Password" name="password" rules={[{required: true}]}>
                            <Input.Password prefix={<i className="fa-solid fa-lock text-muted"></i>} placeholder="Create a password" />
                        </Form.Item>

                        <Button className="primary-button my-2 full-width-button w-100" htmlType="submit">
                            REGISTER
                        </Button>
                         <div className="text-center mt-3">
                            <Link to="/login" className="anchor">Already have an account? Login</Link>
                        </div>
                    </Form>
                ) : (
                    // OTP Form
                    <Form layout="vertical" onFinish={onVerifyOtp} size="large">
                        <div className="alert alert-info p-2 mb-3 text-center small">
                            OTP sent to <b>{email}</b>
                        </div>
                        <Form.Item label="Enter OTP" name="otp" rules={[{required: true, message: 'Please enter the OTP'}]}>
                            <Input className="text-center fw-bold" maxLength={6} placeholder="XXXXXX" />
                        </Form.Item>
                        
                        <Button className="primary-button my-2 full-width-button w-100" htmlType="submit">
                            VERIFY & LOGIN
                        </Button>
                        <div className="text-center mt-3">
                             <span className="text-muted small cursor-pointer" onClick={() => setIsOtpSent(false)}>Incorrect Email? Change it</span>
                        </div>
                    </Form>
                )}
            </div>
        </div>
    );
};