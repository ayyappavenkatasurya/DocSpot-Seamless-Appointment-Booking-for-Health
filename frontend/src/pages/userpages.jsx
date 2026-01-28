import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Form, Input, Button, Table, DatePicker, TimePicker, Tabs, Tag, Select, Card, Empty } from 'antd'; 
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import moment from 'moment';
import { Layout, DoctorCard } from '../components';
import { alertActions } from '../redux/alertSlice';
import { userActions } from '../redux/userSlice';

// --- DASHBOARD ---
export const DashboardPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [specFilter, setSpecFilter] = useState('all');
  const dispatch = useDispatch();
    
  const getData = async () => {
    try {
      dispatch(alertActions.showLoading());
      const response = await axios.get(`/api/user/get-all-approved-doctors?search=${searchTerm}&specialization=${specFilter}`, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
      });
      dispatch(alertActions.hideLoading());
      if (response.data.success) setDoctors(response.data.data);
    } catch (error) {
      dispatch(alertActions.hideLoading());
    }
  };

  useEffect(() => { getData(); }, [specFilter]);

  return (
    <Layout>
      <div className="mb-4">
          <h3 className="page-title">Find a Doctor</h3>
          <div className="card p-3 mb-4">
              <Row gutter={[16, 16]} align="middle">
                  <Col xs={24} md={10}>
                      <Input 
                        prefix={<i className="fa-solid fa-magnifying-glass text-muted"></i>}
                        placeholder="Search by name, address..." 
                        value={searchTerm} 
                        onChange={(e)=>setSearchTerm(e.target.value)}
                        size="large"
                    />
                  </Col>
                  <Col xs={24} md={6}>
                    <Select defaultValue="all" style={{ width: '100%' }} size="large" onChange={setSpecFilter}>
                        <Select.Option value="all">All Specializations</Select.Option>
                        <Select.Option value="Cardiologist">Cardiologist</Select.Option>
                        <Select.Option value="Dentist">Dentist</Select.Option>
                        <Select.Option value="General">General Physician</Select.Option>
                        <Select.Option value="Neurologist">Neurologist</Select.Option>
                        <Select.Option value="Dermatologist">Dermatologist</Select.Option>
                    </Select>
                  </Col>
                  <Col xs={24} md={4}>
                      <Button type="primary" size="large" onClick={getData} block icon={<i className="fa-solid fa-filter me-2"></i>}>Filter</Button>
                  </Col>
              </Row>
          </div>
      </div>
      
      <Row gutter={[20, 20]}>
        {doctors.length > 0 ? (
            doctors.map((doctor) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={doctor._id}>
                <DoctorCard doctor={doctor} />
              </Col>
            ))
        ) : (
            <Col span={24}>
                 <Empty description="No doctors found matching your criteria" />
            </Col>
        )}
      </Row>
    </Layout>
  );
};

// --- USER PROFILE ---
export const UserProfile = () => {
    const { user } = useSelector(state => state.user);
    const dispatch = useDispatch();

    const onFinish = async (values) => {
        try {
            dispatch(alertActions.showLoading());
            const res = await axios.post('/api/user/update-user-profile', 
                { ...values, userId: user._id },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
            );
            dispatch(alertActions.hideLoading());
            if (res.data.success) {
                toast.success(res.data.message);
                dispatch(userActions.setUser(res.data.data));
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            dispatch(alertActions.hideLoading());
            toast.error("Something went wrong");
        }
    };

    let roleLabel = "User";
    let roleColor = "blue";
    if (user?.isAdmin) { roleLabel = "Admin"; roleColor = "red"; } 
    else if (user?.isDoctor) { roleLabel = "Doctor"; roleColor = "green"; }

    return (
        <Layout>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
                <h3 className='page-title m-0'>My Profile</h3>
                <Tag color={roleColor} className="mt-2 mt-md-0 px-3 py-1 text-uppercase fs-6">{roleLabel}</Tag>
            </div>
            
            <div className="card p-4">
                <Form layout="vertical" onFinish={onFinish} initialValues={user}>
                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={8}>
                            <Form.Item label="Full Name" name="name" rules={[{required: true, message: 'Name is required'}]}>
                                <Input placeholder="Your Name" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item label="Phone Number" name="phone">
                                <Input placeholder="Your Phone Number" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item label="Email" name="email">
                                <Input placeholder="Your Email" disabled className="bg-light"/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <div className='d-flex justify-content-end mt-3'>
                        <Button className='primary-button' htmlType='submit'>Save Changes</Button>
                    </div>
                </Form>
            </div>
        </Layout>
    );
};

// --- APPLY DOCTOR ---
export const ApplyDoctorPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.user);

  const onFinish = async (values) => {
    try {
      dispatch(alertActions.showLoading());
      const payload = {
        ...values,
        userId: user._id,
        timings: [
          moment(values.timings[0]).format("h:mm a"),
          moment(values.timings[1]).format("h:mm a"),
        ],
      };
      const response = await axios.post('/api/user/apply-doctor-account', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      dispatch(alertActions.hideLoading());
      if (response.data.success) {
        toast.success(response.data.message);
        navigate('/dashboard');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      dispatch(alertActions.hideLoading());
      toast.error('Something went wrong');
    }
  };

  return (
    <Layout>
      <h3 className="page-title">Apply for Doctor Account</h3>
      <div className="card p-4">
          <Form layout="vertical" onFinish={onFinish}>
            <h5 className="mb-3 text-muted border-bottom pb-2">Personal Information</h5>
            <Row gutter={[20, 20]}>
              <Col xs={24} md={8}><Form.Item label="First Name" name="firstName" rules={[{ required: true }]}><Input /></Form.Item></Col>
              <Col xs={24} md={8}><Form.Item label="Last Name" name="lastName" rules={[{ required: true }]}><Input /></Form.Item></Col>
              <Col xs={24} md={8}><Form.Item label="Phone" name="phoneNumber" rules={[{ required: true }]}><Input /></Form.Item></Col>
              <Col xs={24} md={8}><Form.Item label="Website" name="website"><Input placeholder="https://" /></Form.Item></Col>
              <Col xs={24} md={16}><Form.Item label="Clinic/Hospital Address" name="address" rules={[{ required: true }]}><Input /></Form.Item></Col>
            </Row>
            
            <h5 className="mb-3 mt-4 text-muted border-bottom pb-2">Professional Details</h5>
            <Row gutter={[20, 20]}>
              <Col xs={24} md={8}><Form.Item label="Specialization" name="specialization" rules={[{ required: true }]}><Input placeholder="e.g. Cardiologist" /></Form.Item></Col>
              <Col xs={24} md={8}><Form.Item label="Experience" name="experience" rules={[{ required: true }]}><Input placeholder="e.g. 5 Years" /></Form.Item></Col>
              <Col xs={24} md={8}><Form.Item label="Consultation Fee (₹)" name="feesPerCunsultation" rules={[{ required: true }]}><Input type="number" /></Form.Item></Col>
              <Col xs={24} md={8}><Form.Item label="Available Timings" name="timings" rules={[{ required: true }]}><TimePicker.RangePicker format="h:mm a" use12Hours className="w-100" /></Form.Item></Col>
            </Row>
            
            <div className="d-flex justify-content-end mt-3">
              <Button type="primary" htmlType="submit" size="large">Submit Application</Button>
            </div>
          </Form>
      </div>
    </Layout>
  );
};

// --- BOOKING PAGE ---
export const BookingPage = () => {
  const { doctorId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [file, setFile] = useState(null);

  const getDoctorData = async () => {
    try {
      dispatch(alertActions.showLoading());
      const res = await axios.post('/api/doctor/get-doctor-info-by-id', { doctorId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data.success) setDoctor(res.data.data);
      dispatch(alertActions.hideLoading());
    } catch (error) { dispatch(alertActions.hideLoading()); }
  };

  useEffect(() => { getDoctorData(); }, []); 

  const getDisabledHours = () => {
    if (!doctor) return [];
    const start = moment(doctor.timings[0], "h:mm a").hour();
    const end = moment(doctor.timings[1], "h:mm a").hour();
    let hours = [];
    for(let i=0; i<24; i++) {
        // Fix: Ensure we cover full range properly
        if(i < start || i > end) hours.push(i);
    }
    return hours;
  };

  const checkAvailability = async () => {
    try {
      if(!date || !time) return toast.error("Date & Time required");
      dispatch(alertActions.showLoading());
      const res = await axios.post('/api/user/check-booking-availability', 
        { doctorId, date, time }, 
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      dispatch(alertActions.hideLoading());
      if (res.data.success) {
        setIsAvailable(true);
        toast.success(res.data.message);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      dispatch(alertActions.hideLoading());
      toast.error('Error checking availability');
    }
  };

  const bookNow = async () => {
    try {
      if(!date || !time) return toast.error("Date & Time missing");

      dispatch(alertActions.showLoading());
      const formData = new FormData();
      formData.append('doctorId', doctorId);
      formData.append('date', date);
      formData.append('time', time);
      if (file) {
        formData.append('medicalDocument', file);
      }

      const res = await axios.post('/api/user/book-appointment', 
        formData, 
        { 
            headers: { 
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'multipart/form-data' 
            } 
        }
      );

      dispatch(alertActions.hideLoading());
      if (res.data.success) {
        toast.success(res.data.message);
        navigate('/user/appointments');
      } else {
        setIsAvailable(false); // Reset if booking failed
        toast.error(res.data.message);
      }
    } catch (error) {
      dispatch(alertActions.hideLoading());
      setIsAvailable(false);
      toast.error('Booking Failed');
    }
  };

  return (
    <Layout>
      {doctor && (
        <>
            <h3 className="page-title">Book Appointment</h3>
            <div className="card p-4">
                <Row gutter={[30, 30]}>
                    <Col xs={24} md={10}>
                          <div className="text-center p-3 bg-light rounded">
                            <h4 className="text-primary mb-3">Dr. {doctor.firstName} {doctor.lastName}</h4>
                            <p className="fs-5"><b>Specialization:</b> {doctor.specialization}</p>
                            <p className="fs-5"><b>Fee:</b> ₹{doctor.feesPerCunsultation}</p>
                            <p className="fs-5"><b>Timings:</b> {doctor.timings[0]} - {doctor.timings[1]}</p>
                            <p className="fs-6 text-muted"><i className="fa-solid fa-map-pin"></i> {doctor.address}</p>
                         </div>
                    </Col>
                    <Col xs={24} md={14}>
                        <div className="d-flex flex-column gap-3">
                            <div>
                                <label className="form-label">Select Date</label>
                                <DatePicker 
                                    format="DD-MM-YYYY" 
                                    disabledDate={(current) => current && current < moment().endOf('day')}
                                    onChange={(val) => { 
                                        // FIX: Ensure strict formatting on change
                                        setDate(val ? val.format("DD-MM-YYYY") : null); 
                                        setIsAvailable(false); 
                                    }} 
                                    className="w-100"
                                    size="large"
                                />
                            </div>
                            <div>
                                <label className="form-label">Select Time</label>
                                <TimePicker 
                                    format="h:mm a" 
                                    use12Hours
                                    minuteStep={30} 
                                    disabledHours={getDisabledHours} 
                                    hideDisabledOptions={true}
                                    onChange={(val) => { 
                                        // FIX: Ensure strict formatting on change
                                        setTime(val ? val.format("h:mm a") : null); 
                                        setIsAvailable(false); 
                                    }}
                                    className="w-100"
                                    size="large"
                                />
                            </div>
                            
                            <div className="bg-light p-3 rounded border">
                                <label className="form-label fw-bold"><i className="fa-solid fa-paperclip me-1"></i> Medical Records (Optional)</label>
                                <input 
                                    type="file" 
                                    className="form-control"
                                    onChange={(e) => setFile(e.target.files[0])} 
                                    accept=".pdf,.png,.jpg,.jpeg"
                                />
                                <small className="text-muted">Upload previous prescriptions or reports (PDF/JPG)</small>
                            </div>

                            {!isAvailable && (
                                <Button type="primary" size="large" onClick={checkAvailability} block>Check Availability</Button>
                            )}

                            {isAvailable && (
                                <div className="animate__animated animate__fadeIn">
                                    <div className="alert alert-success p-2 mb-2 text-center">Slot Available!</div>
                                    <Button type="primary" className="btn-success" size="large" onClick={bookNow} block>Confirm Booking</Button>
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
            </div>
        </>
      )}
    </Layout>
  );
};

// --- APPOINTMENTS LIST ---
export const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const dispatch = useDispatch();

  const getAppointments = async () => {
    try {
      dispatch(alertActions.showLoading());
      const res = await axios.get('/api/user/get-appointments-by-user-id', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data.success) setAppointments(res.data.data);
      dispatch(alertActions.hideLoading());
    } catch (error) { dispatch(alertActions.hideLoading()); }
  };

  useEffect(() => { getAppointments(); }, []);

  const handleCancel = async (record) => {
    try {
        dispatch(alertActions.showLoading());
        const res = await axios.post('/api/user/cancel-appointment', 
            { appointmentId: record._id },
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        dispatch(alertActions.hideLoading());
        if(res.data.success) {
            toast.success(res.data.message);
            getAppointments();
        } else {
            toast.error(res.data.message);
        }
    } catch (error) {
        dispatch(alertActions.hideLoading());
        toast.error("Error cancelling");
    }
  };

  const columns = [
    { title: 'Doctor Name', dataIndex: 'doctorInfo', render: (text, record) => <span className="fw-bold">Dr. {record.doctorInfo.firstName} {record.doctorInfo.lastName}</span> },
    { title: 'Date & Time', render: (text, record) => (
        <span>{moment(record.date, "DD-MM-YYYY").format('DD MMM YYYY')} <br/> <small className="text-muted">{record.time}</small></span>
    )},
    { title: 'Status', dataIndex: 'status', render: (text, record) => {
        let color = 'gold';
        if(record.status === 'approved') color = 'green';
        if(record.status === 'rejected' || record.status === 'cancelled') color = 'red';
        if(record.status === 'completed') color = 'blue';
        return <Tag color={color}>{record.status.toUpperCase()}</Tag>
    }},
    { title: 'Diagnosis/Rx', width: 300, render: (text, record) => (
        record.status === 'completed' ? (
            <div className="small bg-light p-2 rounded">
                <div className="mb-1"><strong>Note:</strong> {record.visitSummary}</div>
                <div><strong>Rx:</strong> {record.prescription}</div>
            </div>
        ) : <span className="text-muted">-</span>
    )},
    { title: 'Action', render: (text, record) => (
        (record.status === 'pending' || record.status === 'approved') && (
            <Button danger size="small" onClick={() => handleCancel(record)}>Cancel</Button>
        )
    )}
  ];

  return (
    <Layout>
        <h3 className="page-title">My Appointments</h3>
        <div className="card">
            <Table columns={columns} dataSource={appointments} rowKey="_id" scroll={{ x: 800 }} />
        </div>
    </Layout>
  );
};

// --- NOTIFICATIONS ---
export const NotificationPage = () => {
  const { user } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const markAllRead = async () => {
    try {
      dispatch(alertActions.showLoading());
      const res = await axios.post('/api/user/mark-all-notifications-as-seen', { userId: user._id }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data.success) {
          toast.success(res.data.message);
          dispatch(userActions.setUser(res.data.data));
      }
      dispatch(alertActions.hideLoading());
    } catch (error) { dispatch(alertActions.hideLoading()); }
  };

  const deleteAll = async () => {
    try {
      dispatch(alertActions.showLoading());
      const res = await axios.post('/api/user/delete-all-notifications', { userId: user._id }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if(res.data.success) {
          toast.success(res.data.message);
          dispatch(userActions.setUser(res.data.data));
      }
      dispatch(alertActions.hideLoading());
    } catch(e) { dispatch(alertActions.hideLoading()); }
  }

  return (
    <Layout>
      <h3 className="page-title">Notifications</h3>
      <div className="card p-4">
        <Tabs items={[
            { label: <span><i className="fa-solid fa-envelope me-2"></i>Unread</span>, key: '1', children: (
                <>
                    {user?.unseenNotifications?.length > 0 && (
                        <div className="d-flex justify-content-end mb-3">
                            <Button type="link" onClick={markAllRead}>Mark all as read</Button>
                        </div>
                    )}
                    {user?.unseenNotifications?.length === 0 && <Empty description="No new notifications" />}
                    {user?.unseenNotifications.map((notif, i) => (
                    <div className="alert alert-light border shadow-sm cursor-pointer mb-2" key={i} onClick={() => navigate(notif.onClickPath)}>
                        <div className="d-flex align-items-center">
                            <i className="fa-solid fa-circle text-primary me-2" style={{fontSize: '8px'}}></i>
                            {notif.message}
                        </div>
                    </div>
                    ))}
                </>
            )},
            { label: <span><i className="fa-solid fa-envelope-open me-2"></i>Read</span>, key: '2', children: (
                <>
                    {user?.seenNotifications?.length > 0 && (
                        <div className="d-flex justify-content-end mb-3">
                            <Button type="text" danger onClick={deleteAll}>Delete all history</Button>
                        </div>
                    )}
                    {user?.seenNotifications?.length === 0 && <Empty description="No history" />}
                    {user?.seenNotifications.map((notif, i) => (
                        <div className="alert alert-light mb-2 text-muted" key={i} onClick={() => navigate(notif.onClickPath)}>
                            {notif.message}
                        </div>
                    ))}
                </>
            )}
        ]} />
      </div>
    </Layout>
  );
};