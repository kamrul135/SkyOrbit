import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CheckInSeatSelection = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { bookingIds, passengersData } = location.state || {};

    const [bookedSeats, setBookedSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [hoveredSeat, setHoveredSeat] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const firstLeg = bookingIds?.[0] || {};
    const flightId = firstLeg.flight_id;

    // ✅ FIX: seat_class সঠিকভাবে পড়া হচ্ছে, fallback শুধু তখনই যখন সত্যিই নেই
    const seatClass = firstLeg.seat_class || 'Economy';
    const maxPassengers = passengersData?.length || 0;

    // ✅ DEBUG: console এ দেখুন কী আসছে
    useEffect(() => {
        console.log("=== SeatSelection Debug ===");
        console.log("bookingIds:", bookingIds);
        console.log("firstLeg:", firstLeg);
        console.log("seat_class raw:", firstLeg.seat_class);
        console.log("seatClass resolved:", seatClass);
    }, []);

    useEffect(() => {
        if (!flightId) return;
        axios.get(`http://localhost:5000/flights/${flightId}/seats`)
            .then(res => setBookedSeats(res.data))
            .catch(err => console.error("Error fetching booked seats", err));
    }, [flightId]);

    if (!bookingIds || !passengersData) {
        return (
            <div style={{ minHeight: '100vh', background: '#0b111e', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                <div style={{ fontSize: '48px' }}>⚠️</div>
                <h2 style={{ color: '#fff', margin: 0 }}>No check-in data found</h2>
                <button onClick={() => navigate('/dashboard')} style={{ padding: '12px 28px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>
                    Go to Dashboard
                </button>
            </div>
        );
    }

    // ✅ class অনুযায়ী সঠিক row
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
        setSubmitting(true);
        setError('');
        try {
            await Promise.all(
                bookingIds.map((booking, idx) =>
                    axios.put(`http://localhost:5000/bookings/${booking.booking_id}/seat`, {
                        seat_number: selectedSeats[idx]
                    })
                )
            );
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to confirm seats. Please try again.';
            setError(msg);
            setSubmitting(false);
        }
    };

    const seatStyle = (seat) => {
        const isBooked = bookedSeats.includes(seat);
        const isSelected = selectedSeats.includes(seat);
        const isHovered = hoveredSeat === seat;

        let bg, border, color, shadow;
        if (isBooked) {
            bg = 'linear-gradient(135deg, #ef4444, #dc2626)'; border = '#f87171'; color = '#fff';
            shadow = '0 2px 6px rgba(239, 68, 68, 0.3)';
        } else if (isSelected) {
            bg = 'linear-gradient(135deg, #3b82f6, #2563eb)'; border = '#60a5fa'; color = '#fff';
            shadow = '0 4px 12px rgba(59, 130, 246, 0.5)';
        } else if (isHovered) {
            bg = 'linear-gradient(135deg, #22c55e, #16a34a)'; border = '#4ade80'; color = '#fff';
            shadow = '0 4px 12px rgba(34, 197, 94, 0.4)';
        } else {
            bg = 'linear-gradient(135deg, #1e293b, #334155)'; border = '#475569'; color = '#94a3b8';
            shadow = '0 2px 4px rgba(0,0,0,0.2)';
        }
        return {
            width: '44px', height: '40px', borderRadius: '8px 8px 4px 4px',
            background: bg, border: `1px solid ${border}`, color,
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            cursor: isBooked ? 'not-allowed' : 'pointer', fontSize: '11px', fontWeight: 'bold',
            boxShadow: shadow, transition: 'all 0.2s ease',
            transform: isSelected ? 'scale(1.08)' : isHovered ? 'scale(1.05)' : 'scale(1)',
            opacity: isBooked ? 0.7 : 1, position: 'relative'
        };
    };

    const renderSeat = (row, col) => {
        const seat = `${row}${col}`;
        const isSelected = selectedSeats.includes(seat);
        const isBooked = bookedSeats.includes(seat);
        return (
            <div
                key={seat}
                onClick={() => handleSeatClick(seat)}
                onMouseEnter={() => !isBooked && setHoveredSeat(seat)}
                onMouseLeave={() => setHoveredSeat(null)}
                style={seatStyle(seat)}
            >
                <span style={{ fontSize: '10px', lineHeight: 1 }}>{col}</span>
                <span style={{ fontSize: '9px', opacity: 0.8, lineHeight: 1 }}>{row}</span>
                {isSelected && (
                    <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '16px', height: '16px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff', border: '2px solid #0f172a' }}>✓</div>
                )}
            </div>
        );
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0b1120 0%, #111827 50%, #0b1120 100%)',
            padding: '40px 20px',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            color: '#e2e8f0'
        }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>

                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <h1 style={{ color: '#fff', fontSize: '26px', margin: '0 0 8px', fontWeight: '700' }}>
                        Select Your Seat
                    </h1>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
                        Please select <strong style={{ color: '#3b82f6' }}>{maxPassengers}</strong> seat(s) for check-in
                        {' '}— <strong style={{ color: '#eab308' }}>{seatClass}</strong> class
                    </p>
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                    borderRadius: '16px', padding: '30px', border: '1px solid #334155',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                }}>
                    {/* Legend */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}></div>
                            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Available</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}></div>
                            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Taken</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}></div>
                            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Selected</span>
                        </div>
                    </div>

                    {/* Airplane body */}
                    <div style={{
                        maxWidth: '380px', margin: '0 auto',
                        background: 'linear-gradient(180deg, #1a2332 0%, #0f172a 100%)',
                        borderRadius: '60px 60px 16px 16px', padding: '20px 16px 16px',
                        border: '2px solid #334155'
                    }}>
                        <div style={{
                            width: '55%', height: '26px', margin: '0 auto 16px',
                            background: 'linear-gradient(180deg, #1e3a5f, #0f172a)',
                            borderRadius: '50px 50px 0 0', border: '1px solid #334155', borderBottom: 'none'
                        }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {rows.map(row => (
                                <div key={row} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                    {['A', 'B', 'C'].map(col => renderSeat(row, col))}
                                    <div style={{ width: '20px' }} />
                                    {['D', 'E', 'F'].map(col => renderSeat(row, col))}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Passenger-seat mapping */}
                    {selectedSeats.length > 0 && (
                        <div style={{ marginTop: '24px' }}>
                            {passengersData.map((p, idx) => (
                                <div key={idx} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '10px 14px', background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '8px', border: '1px solid #334155', marginBottom: '8px'
                                }}>
                                    <span style={{ fontSize: '14px', color: '#e2e8f0' }}>{p.first_name} {p.last_name}</span>
                                    <span style={{ fontSize: '15px', fontWeight: 'bold', color: selectedSeats[idx] ? '#3b82f6' : '#64748b' }}>
                                        {selectedSeats[idx] || 'Not selected'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {error && (
                        <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#f87171', fontSize: '13px', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleConfirm}
                        disabled={selectedSeats.length !== maxPassengers || submitting}
                        style={{
                            width: '100%', marginTop: '20px', padding: '16px',
                            background: selectedSeats.length === maxPassengers
                                ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                                : '#334155',
                            color: '#fff', border: 'none', borderRadius: '10px',
                            cursor: selectedSeats.length === maxPassengers && !submitting ? 'pointer' : 'not-allowed',
                            fontWeight: '800', fontSize: '16px'
                        }}
                    >
                        {submitting ? 'Confirming...' : `Confirm Seat${maxPassengers > 1 ? 's' : ''} →`}
                    </button>
                </div>

                <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                        width: '100%', marginTop: '14px', padding: '13px',
                        background: 'transparent', color: '#64748b',
                        border: '1px solid #1e293b', borderRadius: '8px',
                        cursor: 'pointer', fontSize: '14px'
                    }}>
                    ← Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default CheckInSeatSelection;