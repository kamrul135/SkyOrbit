import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SearchFlights from './pages/SearchFlights';
import CheckInSeatSelection from './pages/Checkinseatselection';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Chatbot from './components/Chatbot';
import Payment from './pages/Payment';
import BookingConfirmation from './pages/BookingConfirmation';
import FlightResults from './pages/FlightResults';
import './App.css';
import MyTrips from './components/MyTrips';
import CheckIn from './pages/CheckIn';
import BookingInformation from './pages/BookingInformation';
import './pages/BookingInformation.css';

function App() {
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    document.body.className = 'dark';
  }, []);

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h2>SkyOrbit</h2>
          </Link>
          <div className="links">
            <Link to="/">Home</Link>
            {user ? (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/profile">Profile</Link>
                <button onClick={() => {
                  localStorage.removeItem('user');
                  window.location.href = '/login';
                }}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </nav>

        <main className="content">
          <Routes>
            {/* ─── মূল ফ্লো এবং ইউজার ম্যানেজমেন্ট ─── */}
            <Route path="/" element={<SearchFlights />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<VerifyEmail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />

            {/* ─── বুকিং এবং পেমেন্ট ফ্লো (ধারাবাহিক বিন্যাস) ─── */}
            <Route path="/results" element={<FlightResults />} />
            <Route path="/booking-info/:flightId" element={<BookingInformation />} />

            {/* ২. ইনফরমেশন সাবমিট করার পর আসবে পেমেন্ট */}
            <Route path="/payment/:flightId" element={<Payment />} />
            {/* ৩. পেমেন্ট সফল হলে আসবে কনফার্মেশন */}
            <Route path="/booking-confirmation/:flightId" element={<BookingConfirmation />} />
            <Route path="/my-trips" element={<MyTrips />} />

            {/* ─── চেক-ইন এবং তার ভেতরের সিট সিলেকশন ফ্লো ─── */}
            <Route path="/checkin" element={<CheckIn />} />
            <Route path="/checkin/seats/:flightId" element={<CheckInSeatSelection />} />
          </Routes>

        </main>
        <Chatbot />
      </div>
    </Router>
  );
}

export default App;