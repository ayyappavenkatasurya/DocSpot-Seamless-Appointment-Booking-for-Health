import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Badge, Tag, Avatar } from 'antd';
import axios from 'axios';
import { userActions } from './redux/userSlice';

// --- SPINNER ---
export const Spinner = () => (
  <div className="spinner-parent">
    <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}>
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

// --- PROTECTED ROUTE ---
export const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getUser = async () => {
    try {
      const res = await axios.post('/api/user/get-user-info-by-id', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.data.success) {
        dispatch(userActions.setUser(res.data.data));
      } else {
        localStorage.clear();
        navigate('/login');
      }
    } catch (error) {
      localStorage.clear();
      navigate('/login');
    }
  };

  useEffect(() => {
    if (!user && localStorage.getItem('token')) {
      getUser();
    }
  }, [user]);

  if (localStorage.getItem('token')) {
    return children;
  } else {
    return <Navigate to="/login" />;
  }
};

// --- PUBLIC ROUTE ---
export const PublicRoute = ({ children }) => {
  if (localStorage.getItem('token')) {
    return <Navigate to="/dashboard" />;
  } else {
    return children;
  }
};

// --- FOOTER COMPONENT ---
const Footer = () => (
  <div className="text-center p-3 mt-auto border-top" style={{ backgroundColor: '#fff', fontSize: '14px' }}>
    <p className="m-0 text-muted">
      Developed by <span className="fw-bold text-dark">Surya Nallamothu</span>
    </p>
    <a 
      href="https://www.youtube.com/@SuryanallamothuYT" 
      target="_blank" 
      rel="noreferrer"
      className="text-decoration-none text-danger fw-bold"
    >
      <i className="fa-brands fa-youtube me-1"></i> Subscribe on YouTube
    </a>
  </div>
);

// --- LAYOUT (RESPONSIVE) ---
export const Layout = ({ children }) => {
  const { user } = useSelector((state) => state.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const handleLogout = () => {
    localStorage.clear();
    dispatch(userActions.logout());
    navigate('/login');
  };

  const profilePath = user?.isDoctor 
    ? `/doctor/profile/${user?._id}` 
    : `/user/profile/${user?._id}`;

  const showApplyDoctor = !user?.isDoctor && user?.doctorStatus !== 'pending';
  const isPending = user?.doctorStatus === 'pending';
  const isRejected = user?.doctorStatus === 'rejected';

  // Menu Configuration
  const userMenu = [
    { name: 'Dashboard', path: '/dashboard', icon: 'fa-solid fa-house' },
    { name: 'Appointments', path: '/user/appointments', icon: 'fa-solid fa-calendar-check' },
    { name: 'My Profile', path: profilePath, icon: 'fa-solid fa-user' },
    ...(showApplyDoctor ? [{ name: 'Apply as Doctor', path: '/apply-doctor', icon: 'fa-solid fa-user-doctor' }] : []),
  ];
    
  const doctorMenu = [
    { name: 'Dashboard', path: '/dashboard', icon: 'fa-solid fa-house' },
    { name: 'Appointments', path: '/doctor/appointments', icon: 'fa-solid fa-stethoscope' },
    { name: 'Profile', path: profilePath, icon: 'fa-solid fa-user-pen' },
  ];
    
  const adminMenu = [
    { name: 'Dashboard', path: '/dashboard', icon: 'fa-solid fa-house' },
    { name: 'Manage Users', path: '/admin/users', icon: 'fa-solid fa-users' },
    { name: 'Manage Doctors', path: '/admin/doctors', icon: 'fa-solid fa-user-nurse' },
  ];

  const menuToBeRendered = user?.isAdmin ? adminMenu : user?.isDoctor ? doctorMenu : userMenu;

  return (
    <div className="main">
      {/* Mobile Backdrop */}
      <div 
        className={`mobile-backdrop ${sidebarOpen ? 'active' : ''}`} 
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <h1 className="logo"><i className="fa-solid fa-heart-pulse text-primary me-2"></i>DocSpot</h1>
        </div>
        <div className="menu">
          {menuToBeRendered.map((menu) => {
            const isActive = location.pathname === menu.path;
            return (
              <div 
                key={menu.name} 
                className={`menu-item ${isActive && 'active-menu-item'}`}
                onClick={() => {
                   navigate(menu.path);
                   setSidebarOpen(false); // Close on mobile click
                }}
              >
                <i className={menu.icon}></i>
                <span>{menu.name}</span>
              </div>
            );
          })}
          
          <div className="menu-item mt-3 text-danger" onClick={handleLogout}>
             <i className="fa-solid fa-right-from-bracket"></i>
             <span>Logout</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="content">
        <div className="header">
          {/* Hamburger / Toggle */}
          <div className="d-flex align-items-center">
            <i 
                className={`fa-solid ${sidebarOpen ? 'fa-xmark' : 'fa-bars'} header-action-icon d-lg-none me-3`} 
                onClick={() => setSidebarOpen(!sidebarOpen)}
            ></i>
            <h5 className="m-0 d-none d-md-block text-muted">Welcome, {user?.name}</h5>
          </div>

          <div className="d-flex align-items-center gap-3">
             {/* Role & Status Badges */}
             <div className="d-none d-md-flex gap-2">
                {user?.isAdmin && <Tag color="red">ADMIN</Tag>}
                {user?.isDoctor && <Tag color="green">DOCTOR</Tag>}
                {isPending && <Tag color="gold">PENDING</Tag>}
                {isRejected && <Tag color="volcano">REJECTED</Tag>}
             </div>

             {/* Notifications */}
            <Badge count={user?.unseenNotifications?.length} size="small">
              <i 
                className="fa-solid fa-bell header-action-icon" 
                onClick={() => navigate('/notification')}
              ></i>
            </Badge>

            {/* Profile Link */}
            <Link to={profilePath} className="d-flex align-items-center text-decoration-none">
                <Avatar style={{ backgroundColor: '#0056b3', verticalAlign: 'middle' }} size="large">
                    {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
            </Link>
          </div>
        </div>

        <div className="body">
            {children}
        </div>
        
        {/* Added Footer here */}
        <Footer />
      </div>
    </div>
  );
};

// --- DOCTOR CARD (RESPONSIVE) ---
export const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="card doctor-card p-3 h-100 cursor-pointer" 
      onClick={() => navigate(`/book-appointment/${doctor._id}`)}
      style={{ cursor: 'pointer' }}
    >
      <div className="d-flex justify-content-between align-items-start">
         <h5 className="card-title mb-1">Dr. {doctor.firstName} {doctor.lastName}</h5>
         <Tag color="blue">{doctor.specialization}</Tag>
      </div>
      <hr className="my-2" style={{opacity: 0.1}}/>
      <div className="text-muted small">
          <p className="mb-1"><i className="fa-solid fa-briefcase me-2"></i> {doctor.experience}</p>
          <p className="mb-1"><i className="fa-solid fa-indian-rupee-sign me-2"></i> {doctor.feesPerCunsultation}</p>
          <p className="mb-1"><i className="fa-solid fa-clock me-2"></i> {doctor.timings[0]} - {doctor.timings[1]}</p>
          <p className="mb-0"><i className="fa-solid fa-location-dot me-2"></i> {doctor.address}</p>
      </div>
    </div>
  );
};