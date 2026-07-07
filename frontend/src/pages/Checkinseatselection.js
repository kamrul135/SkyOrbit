import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Checkinseatselection.css';

const CheckInSeatSelection = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { bookingIds, passengersData } = location.state || {};

    const [activeLegIndex, setActiveLegIndex] = useState(0);
    const [bookedSeats, setBookedSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [hoveredSeat, setHoveredSeat] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [allLegsSeats, setAllLegsSeats] = useState({});

    const currentLeg = bookingIds?.[activeLegIndex] || {};
    const flightId = currentLeg.flight_id;
    const seatClass = currentLeg.seat_class || 'Economy';
    const maxPassengers = passengersData?.length || 0;

    useEffect(() => {
        if (!flightId) return;
        axios.get(`http://localhost:5000/flights/${flightId}/seats`)
            .then(res => setBookedSeats(res.data))
            .catch(err => console.error("Error fetching booked seats", err));
    }, [flightId, activeLegIndex]);

    if (!bookingIds || !passengersData) {
        return (
            <div className="css-fallback">
                <div className="css-fallback-emoji">⚠️</div>
                <h2 className="css-fallback-title">No check-in data found</h2>
                <button onClick={() => navigate('/dashboard')} className="css-fallback-btn">
                    Go to Dashboard
                </button>
            </div>
        );
    }

    const getRowsByClass = () => {
        if (seatClass === 'First Class') return [1, 2];
        if (seatClass === 'Business') return [3, 4, 5];
        return [6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    };
    const rows = getRowsByClass();

    const handleSeatClick = (seat) => {
        if (bookedSeats.includes(seat)) return;
        if (selectedSeats.includes(seat)) {
            setSelectedSeats(selectedSeats.filter(s => s !== seat));
        } else {
            if (selectedSeats.length < maxPassengers) {
                setSelectedSeats([...selectedSeats, seat]);
            } else {
                alert(`You can only select up to ${maxPassengers} seat(s).`);
            }
        }
    };

    const handleConfirm = async () => {
        if (selectedSeats.length !== maxPassengers) return;

        const updatedLegsSeats = {
            ...allLegsSeats,
            [currentLeg.booking_id]: selectedSeats
        };
        setAllLegsSeats(updatedLegsSeats);

        if (activeLegIndex < bookingIds.length - 1) {
            setActiveLegIndex(activeLegIndex + 1);
            setSelectedSeats([]);
            return;
        }

        setSubmitting(true);
        setError('');
        try {
            await Promise.all(
                bookingIds.map((booking) => {
                    const seatsForThisBooking = updatedLegsSeats[booking.booking_id] || selectedSeats;
                    return axios.put(`http://localhost:5000/bookings/${booking.booking_id}/seat`, {
                        seat_number: seatsForThisBooking[0],
                        flight_id: booking.flight_id || null
                    });
                })
            );
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to confirm seats. Please try again.';
            setError(msg);
            setSubmitting(false);
        }
    };

    const getSeatClass = (seat) => {
        const isBooked = bookedSeats.includes(seat);
        const isSelected = selectedSeats.includes(seat);
        const isHovered = hoveredSeat === seat;
        if (isBooked) return 'css-seat css-booked';
        if (isSelected) return 'css-seat css-selected';
        if (isHovered) return 'css-seat css-hover';
        return 'css-seat css-default';
    };

    const renderSeat = (row, col) => {
        const seat = `${row}${col}`;
        const isSelected = selectedSeats.includes(seat);
        const isBooked = bookedSeats.includes(seat);
        return (
            <div
                key={seat}
                className={getSeatClass(seat)}
                onClick={() => handleSeatClick(seat)}
                onMouseEnter={() => !isBooked && setHoveredSeat(seat)}
                onMouseLeave={() => setHoveredSeat(null)}
            >
                <span className="css-col">{col}</span>
                <span className="css-row">{row}</span>
                {isSelected && (
                    <div className="css-seat-check">✓</div>
                )}
            </div>
        );
    };

    const allSelected = selectedSeats.length === maxPassengers;

    return (
        <div className="css-page">
            <div className="css-inner">

                <div className="css-header">
                    <h1>Select Your Seat</h1>
                    <p>
                        {bookingIds.length > 1 && (
                            <span className="css-flight-tag">
                                Flight {activeLegIndex + 1} of {bookingIds.length} ({currentLeg.origin} ➔ {currentLeg.destination})
                            </span>
                        )}
                        Please select <strong className="css-count">{maxPassengers}</strong> seat(s) for check-in
                        {' '}— <strong className="css-class">{seatClass}</strong> class
                    </p>
                </div>

                <div className="css-card">
                    {/* Legend */}
                    <div className="css-legend">
                        <div className="css-legend-item">
                            <div className="css-legend-swatch css-available"></div>
                            <span className="css-legend-text">Available</span>
                        </div>
                        <div className="css-legend-item">
                            <div className="css-legend-swatch css-taken"></div>
                            <span className="css-legend-text">Taken</span>
                        </div>
                        <div className="css-legend-item">
                            <div className="css-legend-swatch css-selected"></div>
                            <span className="css-legend-text">Selected</span>
                        </div>
                    </div>

                    {/* Airplane body */}
                    <div className="css-plane">
                        <div className="css-plane-cockpit" />
                        <div className="css-seat-rows">
                            {rows.map(row => (
                                <div key={row} className="css-seat-row">
                                    {['A', 'B', 'C'].map(col => renderSeat(row, col))}
                                    <div className="css-seat-aisle" />
                                    {['D', 'E', 'F'].map(col => renderSeat(row, col))}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Passenger-seat mapping */}
                    {selectedSeats.length > 0 && (
                        <div style={{ marginTop: '24px' }}>
                            {passengersData.map((p, idx) => (
                                <div key={idx} className="css-pax-row">
                                    <span className="css-pax-name">{p.first_name} {p.last_name}</span>
                                    <span className={`css-pax-seat ${selectedSeats[idx] ? 'has-seat' : ''}`}>
                                        {selectedSeats[idx] || 'Not selected'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {error && (
                        <div className="css-error">{error}</div>
                    )}

                    <button
                        onClick={handleConfirm}
                        disabled={!allSelected || submitting}
                        className={`css-confirm-btn ${allSelected ? 'css-ready' : ''}`}
                    >
                        {submitting
                            ? 'Confirming...'
                            : activeLegIndex < bookingIds.length - 1
                                ? 'Next Flight →'
                                : `Confirm Seat${maxPassengers > 1 ? 's' : ''} →`}
                    </button>
                </div>

                <button
                    onClick={() => navigate('/dashboard')}
                    className="css-back-btn"
                >
                    ← Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default CheckInSeatSelection;