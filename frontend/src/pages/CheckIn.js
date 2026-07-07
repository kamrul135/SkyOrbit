import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CheckIn.css';

const CheckIn = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { bookingIds, passengersData, selectedSeats, totalPrice } = location.state || {};
    const [checkedIn, setCheckedIn] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [checkingIn, setCheckingIn] = useState(false);

    if (!bookingIds || !passengersData) {
        return (
            <div className="ci-fallback">
                <div className="ci-fallback-emoji">⚠️</div>
                <h2 className="ci-fallback-title">No booking data found</h2>
                <button onClick={() => navigate('/')} className="ci-fallback-home">
                    Go Home
                </button>
            </div>
        );
    }

    const firstLeg = bookingIds[0] || {};
    const flightId = firstLeg.flight_id;

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

    const handleGoToSeatSelection = () => {
        console.log("Navigating to seat selection with:", { bookingIds, passengersData });
        navigate(`/checkin/seats/${flightId}`, {
            state: {
                bookingIds,
                passengersData
            }
        });
    };

    return (
        <div className="ci-page">
            <div className="ci-inner">

                {/* HEADER */}
                <div className="ci-header">
                    <div className="ci-header-icon">🛫</div>
                    <h1>Online Check-in</h1>
                    <p>Please verify your details before proceeding to seat selection</p>
                </div>

                {/* PROGRESS BAR */}
                <div className="ci-progress">
                    {['Verify Details', 'Check-in', 'Seat Selection'].map((step, idx) => (
                        <React.Fragment key={idx}>
                            <div className={`ci-step ${idx <= currentStep ? 'active' : ''}`}>
                                <div className="ci-step-circle">
                                    {idx < currentStep ? '✓' : idx + 1}
                                </div>
                                <span className="ci-step-label">{step}</span>
                            </div>
                            {idx < 2 && (
                                <div className={`ci-step-line ${idx < currentStep ? 'done' : ''}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* FLIGHT INFO CARD */}
                <div className="ci-card">
                    <div className="ci-card-label">FLIGHT INFORMATION</div>
                    <div className="ci-flight-grid">
                        <div className="ci-flight-cell">
                            <div className="ci-cell-label">FLIGHT</div>
                            <div className="ci-flight-value">
                                {firstLeg.flight_no || 'N/A'}
                            </div>
                            <div className="ci-flight-sub">{firstLeg.airline || ''}</div>
                        </div>
                        <div className="ci-flight-cell">
                            <div className="ci-cell-label">ROUTE</div>
                            <div className="ci-flight-value">
                                {firstLeg.origin} → {bookingIds[bookingIds.length - 1]?.destination || firstLeg.destination}
                            </div>
                        </div>
                        <div className="ci-flight-cell">
                            <div className="ci-cell-label">CLASS</div>
                            <div className="ci-flight-class">
                                {firstLeg.seat_class || 'Economy'}
                            </div>
                        </div>
                        <div className="ci-flight-cell">
                            <div className="ci-cell-label">BOOKING REF</div>
                            <div className="ci-flight-ref">
                                #{firstLeg.booking_id}
                            </div>
                        </div>
                    </div>
                </div>

                {/* PASSENGERS */}
                <div className="ci-card">
                    <div className="ci-card-label">PASSENGER DETAILS</div>
                    {passengersData.map((p, idx) => (
                        <div key={idx} className="ci-passenger-row">
                            <div className="ci-passenger-left">
                                <div className="ci-passenger-avatar">👤</div>
                                <div>
                                    <div className="ci-passenger-name">
                                        {p.first_name} {p.last_name}
                                    </div>
                                    <div className="ci-passenger-meta">
                                        Passport: {p.passport_number || 'N/A'} · {p.nationality || 'N/A'}
                                    </div>
                                </div>
                            </div>
                            <div className="ci-passenger-seat">
                                <div className="ci-passenger-seat-label">SEAT</div>
                                <div className="ci-passenger-seat-val">
                                    {selectedSeats?.[idx] || 'TBD'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CHECK-IN CONFIRMATION */}
                {!checkedIn ? (
                    <div className="ci-card ci-confirm-card">
                        <div className="ci-confirm-text">
                            By checking in, you confirm that all passenger details are correct
                            and you agree to the airline's terms and conditions.
                        </div>
                        <button
                            onClick={() => { handleCheckIn(); setCurrentStep(1); }}
                            disabled={checkingIn}
                            className="ci-confirm-btn"
                        >
                            {checkingIn ? 'Checking in...' : '✅ Confirm Check-in'}
                        </button>
                    </div>
                ) : (
                    <div className="ci-success-card">
                        <div className="ci-success-emoji">✅</div>
                        <div className="ci-success-title">Check-in Successful!</div>
                        <div className="ci-success-text">
                            You are now checked in. Proceed to select your seat.
                        </div>
                        <button
                            onClick={() => { handleGoToSeatSelection(); setCurrentStep(2); }}
                            className="ci-success-btn"
                        >
                            🪑 Proceed to Seat Selection →
                        </button>
                    </div>
                )}

                <button
                    onClick={() => navigate('/dashboard')}
                    className="ci-back-btn"
                >
                    ← Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default CheckIn;