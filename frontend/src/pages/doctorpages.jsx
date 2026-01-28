import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Input, TimePicker, Button, Table, Row, Col, Modal, Tag } from 'antd';
import axios from 'axios';
import toast from 'react-hot-toast';
import moment from 'moment';
import { Layout } from '../components';
import { alertActions } from '../redux/alertSlice';

// --- DOCTOR PROFILE ---
export const DoctorProfile = () => {
  const { user } = useSelector(state => state.user);
  const [doctor, setDoctor] = useState(null);
  const dispatch = useDispatch();

  const getDoctorInfo = async () => {
    try {
      const res = await axios.post('/api/doctor/get-doctor-info-by-user-id', { userId: user._id }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if(res.data.success) {
        setDoctor(res.data.data);
      }
    } catch(e){
      console.log(e);
    }
  }

  useEffect(() => { getDoctorInfo() }, []);

  const onFinish = async (values) => {
    try {
      dispatch(alertActions.showLoading());
      const payload = {
        ...values,
        userId: user._id,
        timings: [ 
          moment(values.timings[0]).format("h:mm a"), 
          moment(values.timings[1]).format("h:mm a") 
        ]
      };
      const res = await axios.post('/api/doctor/update-doctor-profile', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      dispatch(alertActions.hideLoading());
      if(res.data.success) {
        toast.success(res.data.message);
        getDoctorInfo();
      } else {
        toast.error(res.data.message);
      }
    } catch(e) {
      dispatch(alertActions.hideLoading());
      toast.error("Update failed");
    }
  };

  return (
    <Layout>
      <h3 className="page-title">Manage Profile</h3>
      <div className="card p-4">
          {doctor && (
            <Form 
                layout="vertical" 
                onFinish={onFinish} 
                initialValues={{
                    ...doctor, 
                    timings: [
                        moment(doctor.timings[0], 'h:mm a'), 
                        moment(doctor.timings[1], 'h:mm a')
                    ]
                }}
            >
              <h5 className="text-muted border-bottom pb-2 mb-3">Professional Info</h5>
              <Row gutter={[20, 20]}>
                 <Col xs={24} md={8}><Form.Item label="First Name" name="firstName" rules={[{required:true}]}><Input/></Form.Item></Col>
                 <Col xs={24} md={8}><Form.Item label="Last Name" name="lastName" rules={[{required:true}]}><Input/></Form.Item></Col>
                 <Col xs={24} md={8}><Form.Item label="Phone" name="phoneNumber" rules={[{required:true}]}><Input/></Form.Item></Col>
                 <Col xs={24} md={8}><Form.Item label="Fees (₹)" name="feesPerCunsultation" rules={[{required:true}]}><Input type="number"/></Form.Item></Col>
                 <Col xs={24} md={8}><Form.Item label="Experience" name="experience" rules={[{required:true}]}><Input placeholder="e.g. 5 Years"/></Form.Item></Col>
                 <Col xs={24} md={8}><Form.Item label="Timings" name="timings" rules={[{required:true}]}><TimePicker.RangePicker format="h:mm a" use12Hours className="w-100"/></Form.Item></Col>
              </Row>
              <div className="d-flex justify-content-end">
                  <Button className="primary-button" htmlType="submit">Update Profile</Button>
              </div>
            </Form>
          )}
      </div>
    </Layout>
  );
};

// --- DOCTOR APPOINTMENTS ---
export const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const dispatch = useDispatch();

  const getAppointments = async () => {
    try {
      dispatch(alertActions.showLoading());
      const res = await axios.get('/api/doctor/get-appointments-by-doctor-id', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if(res.data.success) setAppointments(res.data.data);
      dispatch(alertActions.hideLoading());
    } catch(e) { dispatch(alertActions.hideLoading()); }
  };

  useEffect(() => { getAppointments(); }, []);

  const changeStatus = async (record, status) => {
      try {
        dispatch(alertActions.showLoading());
        const res = await axios.post('/api/doctor/change-appointment-status', { appointmentId: record._id, status }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        dispatch(alertActions.hideLoading());
        if(res.data.success) {
          toast.success(res.data.message);
          getAppointments();
        }
      } catch(e) { dispatch(alertActions.hideLoading()); }
  }

  const handleComplete = (record) => {
    setSelectedAppt(record);
    setIsModalOpen(true);
  }

  const submitCompletion = async (values) => {
    try {
        dispatch(alertActions.showLoading());
        const res = await axios.post('/api/doctor/complete-appointment', 
            { appointmentId: selectedAppt._id, ...values },
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        dispatch(alertActions.hideLoading());
        if(res.data.success) {
            toast.success("Appointment completed & prescription sent");
            setIsModalOpen(false);
            getAppointments();
        }
    } catch (error) {
        dispatch(alertActions.hideLoading());
        toast.error("Error");
    }
  }

  const columns = [
    { 
        title: 'Patient', 
        dataIndex: 'userInfo', 
        render: (text, record) => (
            <div>
                {/* UPDATED: Name + Phone Number */}
                <span className="fw-bold">{record.userInfo.name}</span>
                <br/>
                <span className="text-muted small">
                    <i className="fa-solid fa-phone me-1"></i>
                    ({record.userInfo.phone || 'No Phone'})
                </span>
            </div>
        ) 
    },
    { title: 'Date/Time', dataIndex: 'date', render: (text, record) => <span>{moment(record.date, "DD-MM-YYYY").format('DD-MM-YYYY')} <br/> <small>{record.time}</small></span> },
    { title: 'Status', dataIndex: 'status', render: (text, record) => {
        let color = 'gold';
        if(record.status === 'approved') color = 'green';
        if(record.status === 'rejected' || record.status === 'cancelled') color = 'red';
        if(record.status === 'completed') color = 'blue';
        return <Tag color={color}>{record.status.toUpperCase()}</Tag>
    }},
    { 
        title: 'Documents', 
        dataIndex: 'documents', 
        render: (text, record) => (
            record.documents ? (
                <a 
                    href={`http://localhost:8080/${record.documents}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-secondary"
                >
                    <i className="fa-solid fa-file-pdf me-1"></i> View
                </a>
            ) : <span className="text-muted small">None</span>
        )
    },
    { title: 'Actions', render: (text, record) => (
        <div className="d-flex gap-2">
           {record.status === 'pending' && (
             <>
               <Button className="btn-success btn-sm" onClick={() => changeStatus(record, 'approved')}>Approve</Button>
               <Button className="btn-danger btn-sm" onClick={() => changeStatus(record, 'rejected')}>Reject</Button>
             </>
           )}
           {record.status === 'approved' && (
               <Button type="primary" className="btn-sm" onClick={() => handleComplete(record)}>Complete Visit</Button>
           )}
           {record.status === 'completed' && <span className="text-success"><i className="fa-solid fa-check"></i> Done</span>}
        </div>
    )}
  ];

  return (
    <Layout>
        <h3 className="page-title">Appointment Management</h3>
        <div className="card">
            <Table columns={columns} dataSource={appointments} rowKey="_id" scroll={{ x: 1000 }}/>
        </div>
        
        {/* Prescription Modal */}
        <Modal title="Complete Appointment Details" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
            <Form layout="vertical" onFinish={submitCompletion}>
                <Form.Item label="Diagnosis / Visit Summary" name="visitSummary" rules={[{required:true}]}>
                    <Input.TextArea rows={3} placeholder="Patient condition, symptoms..." />
                </Form.Item>
                <Form.Item label="Prescription" name="prescription" rules={[{required:true}]}>
                    <Input.TextArea rows={4} placeholder="Medicine Name - Dosage - Frequency" />
                </Form.Item>
                <div className="d-flex justify-content-end">
                    <Button type="primary" htmlType="submit">Submit & Send to Patient</Button>
                </div>
            </Form>
        </Modal>
    </Layout>
  );
};