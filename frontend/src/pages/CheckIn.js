import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CheckIn = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { bookingIds, passengersData, selectedSeats, totalPrice } = location.state || {};

    const [checkedIn, setCheckedIn] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [checkingIn, setCheckingIn] = useState(false);

    if (!bookingIds || !passengersData) {
        return (
            <div style={{ minHeight: '100vh', background: '#0b111e', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                <div style={{ fontSize: '48px' }}>⚠️</div>
                <h2 style={{ color: '#fff', margin: 0 }}>No booking data found</h2>
                <button onClick={() => navigate('/')} style={{ padding: '12px 28px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>
                    Go Home
                </button>
            </div>
        );
    }

    const firstLeg = bookingIds[0] || {};
    const flightId = firstLeg.flight_id;

    // ✅ DEBUG: এখানে দেখুন seat_class আসছে কিনা
    console.log("CheckIn received bookingIds:", bookingIds);
    console.log("CheckIn seat_class:", firstLeg.seat_class);

    const handleCheckIn = async () => {
        setCheckingIn(true);
        try {
            const idsToCheckIn = bookingIds.map(b => b.booking_id);
            await axios.post('http://localhost:5000/bookings/checkin', { booking_ids: idsToCheckIn });
            setCheckedIn(true);
        } catch (err) {
            console.error('Check-in failed', err);
            alert('Check-in failed. Please try again.');
        } finally {
            setCheckingIn(false);
        }
    };

    // ✅ FIX: bookingIds এ seat_class সহ পাঠানো হচ্ছে
    const handleGoToSeatSelection = () => {
        console.log("Navigating to seat selection with:", { bookingIds, passengersData });
        navigate(`/checkin/seats/${flightId}`, {
            state: {
                bookingIds,      // seat_class এখানেই আছে Dashboard থেকে
                passengersData
            }
        });
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0b111e',
            backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(30,58,95,0.28), transparent 60%)',
            padding: '40px 20px',
            fontFamily: "'Lato', sans-serif",
            color: '#e2e8f0'
        }}>
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>

                {/* HEADER */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'rgba(222,255,154,0.1)',
                        border: '1.5px solid rgba(222,255,154,0.35)',
                        display: 'inline-flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '30px',
                        marginBottom: '16px'
                    }}>
                        🛫
                    </div>
                    <h1 style={{ color: '#deff9a', fontSize: '28px', margin: '0 0 8px', fontWeight: '700' }}>
                        Online Check-in
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                        Please verify your details before proceeding to seat selection
                    </p>
                </div>

                {/* PROGRESS BAR */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', marginBottom: '32px' }}>
                    {['Verify Details', 'Check-in', 'Seat Selection'].map((step, idx) => (
                        <React.Fragment key={idx}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: idx <= currentStep ? '#deff9a' : '#1e293b',
                                    border: idx <= currentStep ? 'none' : '1px solid #334155',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: idx <= currentStep ? '#0b111e' : '#64748b',
                                    fontWeight: 'bold', fontSize: '13px'
                                }}>
                                    {idx < currentStep ? '✓' : idx + 1}
                                </div>
                                <span style={{ fontSize: '11px', color: idx <= currentStep ? '#deff9a' : '#64748b', whiteSpace: 'nowrap' }}>
                                    {step}
                                </span>
                            </div>
                            {idx < 2 && (
                                <div style={{
                                    width: '80px', height: '2px', marginBottom: '18px',
                                    background: idx < currentStep ? '#deff9a' : '#1e293b'
                                }} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* FLIGHT INFO CARD */}
                <div style={{
                    background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                    borderRadius: '12px', padding: '20px',
                    border: '1px solid #334155', marginBottom: '20px'
                }}>
                    <div style={{ fontSize: '11px', color: '#64748b', letterSpacing: '2px', marginBottom: '12px' }}>FLIGHT INFORMATION</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>FLIGHT</div>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
                                {firstLeg.flight_no || 'N/A'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{firstLeg.airline || ''}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>ROUTE</div>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
                                {firstLeg.origin} → {bookingIds[bookingIds.length - 1]?.destination || firstLeg.destination}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>CLASS</div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#eab308' }}>
                                {firstLeg.seat_class || 'Economy'}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>BOOKING REF</div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#deff9a' }}>
                                #{firstLeg.booking_id}
                            </div>
                        </div>
                    </div>
                </div>

                {/* PASSENGERS */}
                <div style={{
                    background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                    borderRadius: '12px', padding: '20px',
                    border: '1px solid #334155', marginBottom: '20px'
                }}>
                    <div style={{ fontSize: '11px', color: '#64748b', letterSpacing: '2px', marginBottom: '16px' }}>PASSENGER DETAILS</div>
                    {passengersData.map((p, idx) => (
                        <div key={idx} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '14px', background: 'rgba(255,255,255,0.03)',
                            borderRadius: '8px', border: '1px solid #334155',
                            marginBottom: idx < passengersData.length - 1 ? '10px' : 0
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '38px', height: '38px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #1e3a5f, #0f172a)',
                                    border: '1px solid #334155',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '16px'
                                }}>👤</div>
                                <div>
                                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff' }}>
                                        {p.first_name} {p.last_name}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                                        Passport: {p.passport_number || 'N/A'} · {p.nationality || 'N/A'}
                                    </div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>SEAT</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3b82f6' }}>
                                    {selectedSeats?.[idx] || 'TBD'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CHECK-IN CONFIRMATION */}
                {!checkedIn ? (
                    <div style={{
                        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                        borderRadius: '12px', padding: '20px',
                        border: '1px solid #334155', marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px', lineHeight: '1.6' }}>
                            By checking in, you confirm that all passenger details are correct
                            and you agree to the airline's terms and conditions.
                        </div>
                        <button
                            onClick={() => { handleCheckIn(); setCurrentStep(1); }}
                            disabled={checkingIn}
                            style={{
                                width: '100%', padding: '16px',
                                background: 'linear-gradient(135deg, #deff9a, #a3e635)',
                                color: '#0b111e', border: 'none', borderRadius: '10px',
                                cursor: checkingIn ? 'not-allowed' : 'pointer', fontWeight: '800', fontSize: '16px',
                                letterSpacing: '0.5px', opacity: checkingIn ? 0.7 : 1
                            }}>
                            {checkingIn ? 'Checking in...' : '✅ Confirm Check-in'}
                        </button>
                    </div>
                ) : (
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(22,163,74,0.05))',
                        borderRadius: '12px', padding: '24px',
                        border: '1px solid rgba(34,197,94,0.3)',
                        marginBottom: '20px', textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#22c55e', marginBottom: '6px' }}>
                            Check-in Successful!
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
                            You are now checked in. Proceed to select your seat.
                        </div>
                        <button
                            onClick={() => { handleGoToSeatSelection(); setCurrentStep(2); }}
                            style={{
                                width: '100%', padding: '16px',
                                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                color: '#fff', border: 'none', borderRadius: '10px',
                                cursor: 'pointer', fontWeight: '800', fontSize: '16px'
                            }}>
                            🪑 Proceed to Seat Selection →
                        </button>
                    </div>
                )}

                <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                        width: '100%', padding: '13px',
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

export default CheckIn;