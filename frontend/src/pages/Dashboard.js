import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminPanel from './AdminPanel';
import './Dashboard.css';
import { FaPlane, FaTicketAlt, FaUserCircle, FaCheckCircle } from 'react-icons/fa';

const Dashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [profile, setProfile] = useState(null);
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.role !== 'admin') {
            axios.get(`http://localhost:5000/bookings?user_id=${user.id}`)
                .then(res => setBookings(res.data))
                .catch(err => console.error(err));

            axios.get(`http://localhost:5000/profile/${user.id}`)
                .then(res => setProfile(res.data))
                .catch(err => console.error('Error fetching profile', err));
        }
    }, []);

    const handleCancel = async (bookingId) => {
        if (window.confirm("Are you sure you want to cancel this booking?")) {
            try {
                await axios.patch(`http://localhost:5000/bookings/${bookingId}/cancel`);
                setBookings(bookings.map(b =>
                    b.booking_id === bookingId ? { ...b, status: 'cancelled' } : b
                ));
                alert("Booking cancelled successfully.");
            } catch (error) {
                console.error("Error cancelling booking", error);
                alert(error.response?.data?.error || "Failed to cancel booking.");
            }
        }
    };

    const handleCheckInClick = (booking) => {
    // ব্যাকএন্ড থেকে পাঠানো সম্পূর্ণ legs অ্যারে পাস করা হচ্ছে
    const bookingIds = booking.legs || [{
        booking_id:  booking.booking_id,
        flight_id:   booking.flight_id,
        flight_no:   booking.flight_number,
        airline:     booking.airline,
        origin:      booking.origin_city,
        destination: booking.dest_city,
        seat_class:  booking.seat_class || 'Economy',
        seat:        booking.seat_number
    }];

    const passengersData = [{
        first_name:      profile?.first_name || user.username || '',
        last_name:       profile?.last_name || '',
    }];

    navigate('/checkin', { state: { bookingIds, passengersData } });
};
    
    if (!user) return (
        <div style={{ color: '#94a3b8', textAlign: 'center', padding: '60px' }}>
            Please login to view dashboard
        </div>
    );

    if (user.role === 'admin') return <AdminPanel />;

    return (
        <div className="dashboard-container">
            <div className="dashboard-hero">
                <div className="dashboard-hero-icon"><FaUserCircle /></div>
                <div className="dashboard-hero-text">
                    <h1>Welcome back, {user.username}! ✈️</h1>
                    <p>Your next take-off awaits. Manage your trips and explore new horizons.</p>
                </div>
            </div>

            <div className="dashboard-section-header">
                <div>
                    <h2>Your Bookings</h2>
                    <p>You have <span className="highlight">{bookings.length}</span> trip{bookings.length !== 1 ? 's' : ''} secured.</p>
                </div>
            </div>

            {bookings.length === 0 ? (
                <div className="dashboard-empty">
                    <div className="empty-icon">🎫</div>
                    <h3>No bookings yet</h3>
                    <p>You haven't booked any flights yet. Head over to the flight search to start your journey.</p>
                </div>
            ) : (
                <div className="booking-cards-list">
                    {bookings.map(b => {
                        const isConfirmed = b.status?.toLowerCase().trim() === 'confirmed';
                        const isCancelled = b.status?.toLowerCase().trim() === 'cancelled';
                        const isCheckedIn = b.checked_in === 1 || b.checked_in === true || (b.seat_number && b.seat_number !== '');
                        
                        return (
                            <div key={b.booking_id} className="booking-card">
                                <div className="booking-card-top">
                                    <div className="booking-airline">
                                        <div className="booking-airline-logo">
                                            {b.airline ? b.airline.charAt(0) : '✈'}
                                        </div>
                                        <div>
                                            <h4>{b.airline || 'Airline'}</h4>
                                            <p className="booking-flight-num">{b.flight_number || b.flight_id}</p>
                                        </div>
                                    </div>

                                    <div className="booking-timeline">
                                        <div className="booking-city">
                                            <h3>{b.origin_city || b.origin || 'N/A'}</h3>
                                            <p>Origin</p>
                                        </div>
                                        <div className="booking-line-wrap">
                                            <div className="booking-line"></div>
                                            <FaPlane className="booking-plane-icon" />
                                        </div>
                                        <div className="booking-city">
                                            <h3>{b.dest_city || b.destination || 'N/A'}</h3>
                                            <p>Destination</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="booking-card-bottom">
                                    <div className="booking-info-group">
                                        <span className={`status-pill ${isConfirmed ? 'status-confirmed' : isCancelled ? 'status-cancelled' : 'status-pending'}`}>
                                            <span className="status-dot" />
                                            {b.status ? b.status.trim().toUpperCase() : 'PENDING'}
                                        </span>

                                        {!isCancelled && (
                                            <span className={`status-pill ${isCheckedIn ? 'status-checkedin' : 'status-notcheckedin'}`}>
                                                {isCheckedIn ? <FaCheckCircle size={11} /> : <span className="status-dot" />}
                                                {isCheckedIn ? 'Checked in' : 'Not checked in'}
                                            </span>
                                        )}

                                        <span className="booking-seat">
                                            <FaTicketAlt />
                                            Seat: <strong>{b.seat_number || 'Pending'}</strong>
                                        </span>
                                    </div>

                                    <div className="booking-button-group">
                                        {isConfirmed && (
                                            isCheckedIn ? (
                                                <button
                                                    className="action-btn action-btn-primary"
                                                    onClick={() => handleCheckInClick(b)}
                                                >
                                                    View boarding pass
                                                </button>
                                            ) : (
                                                <button
                                                    className="action-btn action-btn-success"
                                                    onClick={() => handleCheckInClick(b)}
                                                >
                                                    Check-in
                                                </button>
                                            )
                                        )}

                                        {!isCancelled ? (
                                            <button
                                                className="action-btn action-btn-danger"
                                                onClick={() => handleCancel(b.booking_id)}
                                            >
                                                Cancel trip
                                            </button>
                                        ) : (
                                            <button className="action-btn action-btn-danger" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                                                Cancelled
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Dashboard;