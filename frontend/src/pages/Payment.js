import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Payment.css';

const Payment = () => {
    const { flightId } = useParams();
    const navigate     = useNavigate();
    const location     = useLocation();
    const searchParams = new URLSearchParams(location.search);

    const seatNumber     = searchParams.get('seat')          || '';
    const passengerCount = parseInt(searchParams.get('passengers')) || 1;
    const flightClass    = searchParams.get('class')         || 'Economy';
    const isConnecting   = searchParams.get('is_connecting') === 'true';
    const totalPrice     = parseFloat(searchParams.get('total_price')) || 0;
    const leg2Id         = searchParams.get('leg2_id');
    const layoverCode    = searchParams.get('layover')       || '';

    const leg2Dep     = decodeURIComponent(searchParams.get('leg2_dep')     || '');
    const leg2Arr     = decodeURIComponent(searchParams.get('leg2_arr')     || '');
    const leg2Airline = decodeURIComponent(searchParams.get('leg2_airline') || '');
    const leg2Flight  = decodeURIComponent(searchParams.get('leg2_flight')  || '');
    const originCode  = searchParams.get('origin') || '';
    const destCode    = searchParams.get('dest')   || '';

    const [passengersData, setPassengersData] = useState([]);
    const [flightDetails, setFlightDetails]   = useState(null);
    const [leg2Details, setLeg2Details]       = useState(null);
    const [loading, setLoading]               = useState(true);
    const [paymentMethod, setPaymentMethod]   = useState('card');
    const [processing, setProcessing]         = useState(false);
    const [cardData, setCardData] = useState({
        cardNumber: '', cardHolder: '', expiryDate: '', cvv: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        axios.get('http://localhost:5000/flights')
            .then(res => {
                const flight = res.data.find(f => f.id === parseInt(flightId));
                setFlightDetails(flight);
                if (isConnecting && leg2Id) {
                    const flight2 = res.data.find(f => f.id === parseInt(leg2Id));
                    setLeg2Details(flight2);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Error loading flight:', err);
                setLoading(false);
            });

        const saved = sessionStorage.getItem('passengersData');
        if (saved) setPassengersData(JSON.parse(saved));
    }, [flightId]);

    const validateCard = () => {
        const newErrors = {};
        if (paymentMethod === 'card') {
            if (!cardData.cardNumber || cardData.cardNumber.replace(/\s/g, '').length !== 16)
                newErrors.cardNumber = 'Please enter a valid 16-digit card number';
            if (!cardData.cardHolder || cardData.cardHolder.length < 3)
                newErrors.cardHolder = 'Please enter card holder name';
            if (!cardData.expiryDate || !/^\d{2}\/\d{2}$/.test(cardData.expiryDate))
                newErrors.expiryDate = 'Please enter valid expiry date (MM/YY)';
            if (!cardData.cvv || cardData.cvv.length < 3)
                newErrors.cvv = 'Please enter valid CVV';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCardChange = (e) => {
        const { name, value } = e.target;
        let formatted = value;
        if (name === 'cardNumber') {
            formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
        } else if (name === 'expiryDate') {
            formatted = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
        } else if (name === 'cvv') {
            formatted = value.replace(/\D/g, '').slice(0, 4);
        }
        setCardData({ ...cardData, [name]: formatted });
        if (errors[name]) setErrors({ ...errors, [name]: '' });
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        if (!validateCard()) return;
        setProcessing(true);

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                alert('Session expired. Please login again.');
                navigate('/login');
                return;
            }
            const currentUserId  = user.id || user.user_id;
            const selectedSeats  = JSON.parse(sessionStorage.getItem('selectedSeats') || '[]');
            const generatedIds   = [];

            const tripGroupId = (window.crypto?.randomUUID && window.crypto.randomUUID().replace(/-/g, ''))
                || Math.random().toString(16).slice(2) + Date.now().toString(16);

            for (let i = 0; i < passengerCount; i++) {
                const flightIds = isConnecting && leg2Id
                    ? [parseInt(flightId), parseInt(leg2Id)]
                    : [parseInt(flightId)];

                const res = await axios.post('http://localhost:5000/book', {
                    flight_ids:     flightIds,
                    flight_id:      flightIds[0],
                    seat_number:    selectedSeats[i],
                    user_id:        currentUserId,
                    seat_class:     flightClass,
                    flight_class:   flightClass,
                    is_connecting:  isConnecting && !!leg2Id,
                    trip_group_id:  tripGroupId,
                    ...passengersData[i]
                });

                if (res.status === 201 || res.status === 200) {
                    const returnedLegs = res.data.legs || [];
                    returnedLegs.forEach((leg, idx) => {
                        const isLeg2 = idx === 1;
                        generatedIds.push({
                            booking_id:     leg.booking_id,
                            leg:            idx + 1,
                            flight_id:      leg.flight_id,
                            airline:        leg.airline       || (isLeg2 ? (leg2Airline || leg2Details?.airline || 'Singapore Airlines')
                                                                             : (flightDetails?.airline || 'Emirates')),
                            flight_no:      leg.flight_number || (isLeg2 ? (leg2Flight || leg2Details?.flight_number || 'SQ402')
                                                                             : (flightDetails?.flight_number || 'EK211')),
                            origin:         leg.origin        || (isLeg2 ? (layoverCode || 'DXB')
                                                                             : (originCode || flightDetails?.origin_city || 'JFK')),
                            destination:    leg.destination   || (isLeg2 ? (destCode   || 'SIN')
                                                                             : (layoverCode || flightDetails?.dest_city || 'DXB')),
                            departure_time: leg.departure_time || (isLeg2 ? (leg2Details?.departure_time || leg2Dep || '')
                                                                              : (flightDetails?.departure_time || '')),
                            arrival_time:   leg.arrival_time   || (isLeg2 ? (leg2Details?.arrival_time   || leg2Arr || '')
                                                                              : (flightDetails?.arrival_time   || '')),
                            seat:           selectedSeats[i],
                            gate:           isLeg2 ? 'D10' : 'B42',
                            seat_class:     flightClass,
                        });
                    });
                }
            }

            sessionStorage.removeItem('passengersData');
            sessionStorage.removeItem('selectedSeats');

            navigate(`/booking-confirmation/${flightId}`, {
                state: {
                    bookingIds:     generatedIds,
                    passengersData: passengersData,
                    selectedSeats:  selectedSeats,
                    totalPrice:     totalPrice,
                    flightDetails:  flightDetails,
                    isConnecting:   isConnecting,
                    originCode,
                    destCode,
                    layoverCode,
                    flightClass,
                }
            });

        } catch (error) {
            console.error('Payment/Booking error:', error);
            alert(error.response?.data?.error || 'Payment failed! Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const stepClass = (i) => {
        if (i === 1) return 'payment-step active';
        if (i < 1)  return 'payment-step completed';
        return 'payment-step';
    };

    if (loading) {
        return (
            <div className="payment-page-loading">
                Loading...
            </div>
        );
    }

    return (
        <div className="payment-page">
            <div className="payment-container">

                {/* Progress bar */}
                <div className="payment-progress">
                    {['Passenger Info', 'Payment', 'Confirmation'].map((step, i) => (
                        <React.Fragment key={step}>
                            <div className={stepClass(i)}>
                                {i < 1 ? '✓ ' : ''}{step}
                            </div>
                            {i < 2 && <span className="payment-step-arrow">→</span>}
                        </React.Fragment>
                    ))}
                </div>

                <h2 className="payment-title">
                    <span className="payment-title-icon">💳</span>Payment Details
                </h2>

                <div className="payment-grid">

                    {/* BOOKING SUMMARY */}
                    <div className="payment-card">
                        <h3 className="payment-card-title">Booking Summary</h3>

                        <div className="payment-section">
                            <div className="payment-section-label">Flight Details</div>
                            <div className="payment-route">
                                {isConnecting
                                    ? `${originCode} → ${layoverCode} → ${destCode}`
                                    : `${flightDetails?.origin_city} → ${flightDetails?.dest_city}`}
                            </div>
                            <div className="payment-meta">
                                {flightDetails?.airline} {flightDetails?.flight_number}
                                {isConnecting && leg2Flight && ` + ${leg2Flight}`}
                            </div>
                            <div className="payment-meta">
                                {flightDetails?.departure_time
                                    ? new Date(flightDetails.departure_time).toLocaleString()
                                    : ''}
                            </div>
                        </div>

                        <div className="payment-section">
                            <div className="payment-section-label">Passenger(s)</div>
                            {passengersData.map((p, idx) => (
                                <div key={idx} className="payment-passenger-row">
                                    {idx + 1}. {p.first_name} {p.last_name}
                                </div>
                            ))}
                            <div className="payment-seat-class">
                                {seatNumber && `Seat: ${seatNumber} | `}Class: {flightClass}
                            </div>
                        </div>

                        <div className="payment-section">
                            <div className="payment-section-label">Price Details</div>
                            <div className="payment-price-row">
                                <span>Ticket Price</span>
                                <span>${(totalPrice / passengerCount / 1.1).toFixed(2)} × {passengerCount}</span>
                            </div>
                            <div className="payment-price-row">
                                <span>Taxes &amp; Fees</span>
                                <span>${(totalPrice * 0.1 / 1.1).toFixed(2)}</span>
                            </div>
                            <div className="payment-price-total">
                                <span>Total</span>
                                <span>${totalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* PAYMENT FORM */}
                    <div className="payment-card">
                        <h3 className="payment-card-title">Payment Method</h3>

                        <div className="payment-methods">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('card')}
                                className={`payment-method-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                            >
                                💳 Credit/Debit Card
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('paypal')}
                                className={`payment-method-btn ${paymentMethod === 'paypal' ? 'active' : ''}`}
                            >
                                🅿️ PayPal
                            </button>
                        </div>

                        <form onSubmit={handlePaymentSubmit}>
                            {paymentMethod === 'card' ? (
                                <>
                                    <div className="payment-field">
                                        <label className="payment-field-label">Card Number</label>
                                        <input
                                            type="text"
                                            name="cardNumber"
                                            value={cardData.cardNumber}
                                            onChange={handleCardChange}
                                            placeholder="1234 5678 9012 3456"
                                            className={`payment-input ${errors.cardNumber ? 'error' : ''}`}
                                        />
                                        {errors.cardNumber && <div className="payment-error">{errors.cardNumber}</div>}
                                    </div>
                                    <div className="payment-field">
                                        <label className="payment-field-label">Card Holder Name</label>
                                        <input
                                            type="text"
                                            name="cardHolder"
                                            value={cardData.cardHolder}
                                            onChange={handleCardChange}
                                            placeholder="JOHN DOE"
                                            className={`payment-input payment-input-uppercase ${errors.cardHolder ? 'error' : ''}`}
                                        />
                                        {errors.cardHolder && <div className="payment-error">{errors.cardHolder}</div>}
                                    </div>
                                    <div className="payment-field-row">
                                        <div>
                                            <label className="payment-field-label">Expiry Date</label>
                                            <input
                                                type="text"
                                                name="expiryDate"
                                                value={cardData.expiryDate}
                                                onChange={handleCardChange}
                                                placeholder="MM/YY"
                                                className={`payment-input ${errors.expiryDate ? 'error' : ''}`}
                                            />
                                            {errors.expiryDate && <div className="payment-error">{errors.expiryDate}</div>}
                                        </div>
                                        <div>
                                            <label className="payment-field-label">CVV</label>
                                            <input
                                                type="text"
                                                name="cvv"
                                                value={cardData.cvv}
                                                onChange={handleCardChange}
                                                placeholder="123"
                                                className={`payment-input ${errors.cvv ? 'error' : ''}`}
                                            />
                                            {errors.cvv && <div className="payment-error">{errors.cvv}</div>}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="payment-paypal-placeholder">
                                    <div className="payment-paypal-emoji">🅿️</div>
                                    <div className="payment-paypal-text">
                                        You will be redirected to PayPal to complete your payment securely.
                                    </div>
                                </div>
                            )}

                            <div className="payment-security">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="#22c55e">
                                    <path d="M10,2 L18,6 L18,10 C18,14.4 14.4,18 10,18 C5.6,18 2,14.4 2,10 L2,6 L10,2 Z"/>
                                    <path d="M7,10 L9,12 L13,8" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <div className="payment-security-text">
                                    Your payment information is secure and encrypted
                                </div>
                            </div>

                            <button type="submit" disabled={processing} className="payment-pay-btn">
                                {processing ? '⏳ Processing...' : `💰 Pay $${totalPrice.toFixed(2)}`}
                            </button>

                            <button type="button" onClick={() => navigate(-1)} className="payment-back-btn">
                                ← Back to Passenger Info
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;