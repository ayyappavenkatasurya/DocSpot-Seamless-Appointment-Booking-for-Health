import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Button } from 'antd';

const HomePage = () => {
  return (
    <div className="homepage-wrapper" style={{ overflowX: 'hidden' }}>
      
      {/* --- NAVBAR / HEADER --- */}
      <nav className="navbar navbar-expand-lg bg-white shadow-sm py-3 sticky-top">
        <div className="container">
          {/* Logo Section */}
          <div className="d-flex align-items-center">
            <i className="fa-solid fa-heart-pulse text-primary me-2" style={{ fontSize: '1.8rem' }}></i>
            <h3 className="m-0 fw-bold" style={{ color: '#2c3e50', letterSpacing: '1px' }}>DocSpot</h3>
          </div>
          
          {/* Right Side Buttons (Visible on larger screens) */}
          <div className="d-none d-md-flex gap-2">
            <Link to="/login">
              <Button type="text" style={{ fontWeight: '600' }}>Login</Button>
            </Link>
            <Link to="/register">
              <Button type="primary" shape="round" style={{ fontWeight: '600' }}>Register</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div 
        className="hero-section d-flex align-items-center" 
        style={{ 
          minHeight: '85vh', 
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
          padding: '40px 20px'
        }}
      >
        <div className="container">
          <Row gutter={[30, 30]} align="middle">
            {/* Left Side: Text & Buttons */}
            <Col xs={24} md={12} className="text-center text-md-start animate__animated animate__fadeInLeft">
              <h1 
                style={{ 
                  fontSize: '3.5rem', 
                  fontWeight: '800', 
                  color: '#0056b3', 
                  lineHeight: '1.2',
                  marginBottom: '20px'
                }}
              >
                Your Health, <br/>
                <span style={{ color: '#2c3e50' }}>Our Priority.</span>
              </h1>
              <p className="lead text-muted mb-4" style={{ fontSize: '1.25rem', fontWeight: '400' }}>
                Seamless appointment booking with top specialists. 
                Track your medical history and manage prescriptions digitally, all in one place.
              </p>
              <div className="d-flex gap-3 justify-content-center justify-content-md-start">
                <Link to="/login">
                  <Button type="primary" size="large" shape="round" style={{ height: '50px', padding: '0 40px', fontSize: '16px', fontWeight: '600' }}>
                    Get Started
                  </Button>
                </Link>
              </div>
            </Col>
            
            {/* Right Side: Illustration */}
            <Col xs={24} md={12} className="text-center animate__animated animate__fadeInRight">
              <img 
                src="https://img.freepik.com/free-vector/doctors-concept-illustration_114360-1515.jpg" 
                alt="DocSpot Healthcare" 
                style={{ 
                  maxWidth: '100%', 
                  height: 'auto', 
                  borderRadius: '20px', 
                  boxShadow: '0 15px 40px rgba(0,0,0,0.1)',
                  border: '5px solid white'
                }} 
              />
            </Col>
          </Row>
        </div>
      </div>

      {/* --- FEATURES SECTION --- */}
      <div className="container py-5 my-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold" style={{ fontSize: '2.5rem', color: '#2c3e50' }}>Why Choose <span style={{ color: '#0056b3' }}>DocSpot?</span></h2>
          <p className="text-muted fs-5">Experience healthcare made simple and accessible.</p>
        </div>
        
        <Row gutter={[30, 30]}>
          <Col xs={24} md={8}>
            <Card hoverable className="text-center h-100 p-3 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
              <div className="mb-3">
                <i className="fa-solid fa-user-doctor" style={{ fontSize: '3.5rem', color: '#0056b3' }}></i>
              </div>
              <h4 className="fw-bold mb-3">Top Specialists</h4>
              <p className="text-muted">Access a wide network of verified doctors and specialists for your specific health needs.</p>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card hoverable className="text-center h-100 p-3 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
              <div className="mb-3">
                 <i className="fa-regular fa-calendar-check" style={{ fontSize: '3.5rem', color: '#198754' }}></i>
              </div>
              <h4 className="fw-bold mb-3">Instant Booking</h4>
              <p className="text-muted">Book appointments in seconds. Say goodbye to long waiting queues and phone calls.</p>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card hoverable className="text-center h-100 p-3 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
              <div className="mb-3">
                <i className="fa-solid fa-file-shield" style={{ fontSize: '3.5rem', color: '#dc3545' }}></i>
              </div>
              <h4 className="fw-bold mb-3">Secure Records</h4>
              <p className="text-muted">Your medical history and prescriptions are stored securely and accessible anytime.</p>
            </Card>
          </Col>
        </Row>
      </div>

    </div>
  );
};

export default HomePage;