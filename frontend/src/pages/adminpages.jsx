import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Tag } from 'antd';
import toast from 'react-hot-toast';
import { Layout } from '../components';

// --- Admin Users Page ---
export const AdminUsers = () => {
    const [users, setUsers] = useState([]);

    const getUsers = async () => {
        try {
            const res = await axios.get('/api/admin/get-all-users', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.data.success) {
                setUsers(res.data.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleBlock = async (record) => {
        try {
            const res = await axios.post('/api/admin/change-user-block-status', 
                { userId: record._id, isBlocked: !record.isBlocked },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            if (res.data.success) {
                toast.success(res.data.message);
                getUsers(); // Refresh
            }
        } catch (error) {
            toast.error("Error updating status");
        }
    };

    useEffect(() => { getUsers(); }, []);

    const columns = [
        { title: 'Name', dataIndex: 'name' },
        { title: 'Email', dataIndex: 'email' },
        { title: 'Role', render: (text, record) => (record.isDoctor ? <Tag color="blue">Doctor</Tag> : <Tag>User</Tag>) },
        { title: 'Blocked', dataIndex: 'isBlocked', render: (text, record) => (record.isBlocked ? <Tag color="red">Yes</Tag> : <Tag color="green">No</Tag>) },
        { title: 'Actions', dataIndex: 'actions', render: (text, record) => (
             <Button 
                danger={!record.isBlocked} 
                type={record.isBlocked ? 'primary' : 'default'}
                size="small"
                onClick={() => handleBlock(record)}
            >
                {record.isBlocked ? "Unblock" : "Block"}
            </Button>
        )}
    ];

    return (
        <Layout>
            <h3 className="page-title">Manage Users</h3>
            <div className="card">
                <Table columns={columns} dataSource={users} rowKey="_id" scroll={{ x: 800 }} />
            </div>
        </Layout>
    );
};

// --- Admin Doctors Page ---
export const AdminDoctors = () => {
    const [doctors, setDoctors] = useState([]);

    const getDoctors = async () => {
        try {
            const res = await axios.get('/api/admin/get-all-doctors', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.data.success) {
                setDoctors(res.data.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleAccountStatus = async (record, status) => {
        try {
            const res = await axios.post('/api/admin/change-doctor-account-status',
                { doctorId: record._id, userId: record.userId, status: status },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            if (res.data.success) {
                toast.success(res.data.message);
                getDoctors();
            }
        } catch (error) {
            toast.error('Something went wrong');
        }
    };

    useEffect(() => { getDoctors(); }, []);

    // Helper to safely render timings without crashing
    const renderTimings = (timings) => {
        if (!timings) return "N/A";
        // Check if it's an array and elements are NOT objects
        if (Array.isArray(timings) && timings.length === 2) {
            const start = typeof timings[0] === 'object' ? JSON.stringify(timings[0]) : timings[0];
            const end = typeof timings[1] === 'object' ? JSON.stringify(timings[1]) : timings[1];
            return `${start} - ${end}`;
        }
        // Fallback for objects or other formats
        return JSON.stringify(timings);
    };

    const columns = [
        { 
            title: 'Name', 
            dataIndex: 'name',
            render: (text, record) => (
                <span className="fw-bold text-primary">
                    {record.firstName} {record.lastName}
                </span>
            )
        },
        { 
            title: 'Status', 
            dataIndex: 'status',
            render: (text, record) => {
                let color = 'gold';
                if(record.status === 'approved') color = 'green';
                if(record.status === 'rejected' || record.status === 'blocked') color = 'red';
                return <Tag color={color}>{record.status.toUpperCase()}</Tag>
            }
        },
        {
            title: 'Full Details',
            render: (text, record) => (
                <div style={{ fontSize: '13px', minWidth: '300px' }}>
                    <p className="m-0"><b>Specialization:</b> {record.specialization}</p>
                    {/* ADDED EMAIL DISPLAY HERE */}
                    <p className="m-0"><b>Email:</b> {record.email}</p> 
                    <p className="m-0"><b>Experience:</b> {record.experience}</p>
                    <p className="m-0"><b>Fees:</b> ₹{record.feesPerCunsultation}</p>
                    <p className="m-0"><b>Phone:</b> {record.phoneNumber}</p>
                    <p className="m-0"><b>Address:</b> {record.address}</p>
                    {record.website && (
                        <p className="m-0"><b>Website:</b> <a href={record.website} target="_blank" rel="noreferrer">{record.website}</a></p>
                    )}
                    <p className="m-0">
                        <b>Timings:</b> {renderTimings(record.timings)}
                    </p>
                </div>
            )
        },
        {
            title: 'Actions', 
            dataIndex: 'actions', 
            render: (text, record) => (
                <div className="d-flex flex-column gap-2">
                    {record.status === 'pending' && (
                        <div className="d-flex gap-2">
                            <Button className="btn-success btn-sm" onClick={() => handleAccountStatus(record, 'approved')}>Approve</Button>
                            <Button className="btn-danger btn-sm" onClick={() => handleAccountStatus(record, 'rejected')}>Reject</Button>
                        </div>
                    )}
                    
                    {record.status === 'approved' && (
                        <Button className="btn-danger btn-sm" onClick={() => handleAccountStatus(record, 'blocked')}>Block Account</Button>
                    )}

                    {record.status === 'blocked' && (
                        <Button className="btn-success btn-sm" onClick={() => handleAccountStatus(record, 'approved')}>Unblock</Button>
                    )}
                </div>
            )
        }
    ];

    return (
        <Layout>
            <h3 className="page-title">Manage Doctors</h3>
            <div className="card">
                 <Table columns={columns} dataSource={doctors} rowKey="_id" scroll={{ x: 1000 }} />
            </div>
        </Layout>
    );
};