import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import components
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import FlightResults from './components/FlightResults/FlightResults'; 
import Booking from './components/Booking/Booking';
import MyBookings from './components/MyBookings/MyBookings';
import Hotels from './components/Hotels/Hotels';
import Packages from './components/Packages/Packages';
import Activities from './components/Activities/Activities';
import Footer from './components/Footer/Footer';
import AIChat from './components/AI/AIChat';
import HotelBooking from './components/HotelBooking/HotelBooking';
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Router>
      <Navbar />

      {/* 
        OPTIMIZATION 1: The <main> wrapper 
        The 'paddingTop' prevents your content from being hidden behind 
        the Fixed Navbar. Adjust 80px to match your Navbar's actual height.
      */}
      <main style={{ paddingTop: '80px', minHeight: '80vh' }}>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />

          {/* PROTECTED ROUTES */}
          {isAuthenticated ? (
            <>
              <Route path="/" element={<Hero />} />
              <Route path="/flights" element={<FlightResults />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/hotels" element={<Hotels />} />
              <Route path="/packages" element={<Packages />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="*" element={<Navigate to="/" />} />
              <Route path="/hotel-booking" element={<HotelBooking />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/login" />} />
          )}
        </Routes>
      </main>

      {/* 
        
      */}
      {isAuthenticated && <AIChat />}
      
      <Footer />
    </Router>
  );
};

export default App;