import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

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

            for (let i = 0; i < passengerCount; i++) {
                // LEG 1
                const res1 = await axios.post('http://localhost:5000/book', {
                    flight_id:    parseInt(flightId),
                    seat_number:  selectedSeats[i],
                    user_id:      currentUserId,
                    seat_class:   flightClass,   // ✅ fix
                    flight_class: flightClass,
                    ...passengersData[i]
                });

                if (res1.status === 201 || res1.status === 200) {
                    generatedIds.push({
                        booking_id:     res1.data.booking_id,
                        leg:            1,
                        flight_id:      parseInt(flightId),
                        airline:        flightDetails?.airline       || 'Emirates',
                        flight_no:      flightDetails?.flight_number || 'EK211',
                        origin:         originCode   || flightDetails?.origin_city || 'JFK',
                        destination:    layoverCode  || flightDetails?.dest_city   || 'DXB',
                        departure_time: flightDetails?.departure_time || '',
                        arrival_time:   flightDetails?.arrival_time   || '',
                        seat:           selectedSeats[i],
                        gate:           'B42',
                        seat_class:     flightClass,   // ✅ fix
                    });
                }

                // LEG 2 (connecting only)
                if (isConnecting && leg2Id) {
                    const res2 = await axios.post('http://localhost:5000/book', {
                        flight_id:    parseInt(leg2Id),
                        seat_number:  selectedSeats[i],
                        user_id:      currentUserId,
                        seat_class:   flightClass,   // ✅ fix
                        flight_class: flightClass,
                        ...passengersData[i]
                    });

                    if (res2.status === 201 || res2.status === 200) {
                        generatedIds.push({
                            booking_id:     res2.data.booking_id,
                            leg:            2,
                            flight_id:      parseInt(leg2Id),
                            airline:        leg2Airline || leg2Details?.airline       || 'Singapore Airlines',
                            flight_no:      leg2Flight  || leg2Details?.flight_number || 'SQ402',
                            origin:         layoverCode || 'DXB',
                            destination:    destCode    || 'SIN',
                            departure_time: leg2Details?.departure_time || leg2Dep || '',
                            arrival_time:   leg2Details?.arrival_time   || leg2Arr  || '',
                            seat:           selectedSeats[i],
                            gate:           'D10',
                            seat_class:     flightClass,   // ✅ fix
                        });
                    }
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
                    flightClass,   // ✅ fix — BookingConfirmation এ দরকার হবে
                }
            });

        } catch (error) {
            console.error('Payment/Booking error:', error);
            alert(error.response?.data?.error || 'Payment failed! Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '60px 20px', background: '#0b111e', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ color: '#fff', fontSize: '18px' }}>Loading...</div>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px 20px', background: '#0b111e', minHeight: '100vh' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>

                {/* Progress bar */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                    {['Passenger Info', 'Payment', 'Confirmation'].map((step, i) => (
                        <React.Fragment key={step}>
                            <div style={{
                                padding: '6px 16px', borderRadius: '20px', fontSize: '13px',
                                fontWeight: i === 1 ? 'bold' : 'normal',
                                background: i === 1 ? '#38bdf8' : i < 1 ? '#10b981' : '#1e293b',
                                color: i === 1 ? '#000' : i < 1 ? '#fff' : '#64748b'
                            }}>
                                {i < 1 ? '✓ ' : ''}{step}
                            </div>
                            {i < 2 && <span style={{ color: '#334155' }}>→</span>}
                        </React.Fragment>
                    ))}
                </div>

                <h2 style={{ color: '#deff9a', textAlign: 'center', marginBottom: '30px', fontSize: '28px' }}>
                    💳 Payment Details
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' }}>

                    {/* BOOKING SUMMARY */}
                    <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '12px', padding: '24px', border: '1px solid #334155' }}>
                        <h3 style={{ color: '#deff9a', marginTop: 0, marginBottom: '20px', fontSize: '18px', borderBottom: '2px solid #334155', paddingBottom: '10px' }}>
                            Booking Summary
                        </h3>
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Flight Details</div>
                            <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
                                {isConnecting
                                    ? `${originCode} → ${layoverCode} → ${destCode}`
                                    : `${flightDetails?.origin_city} → ${flightDetails?.dest_city}`}
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '13px' }}>
                                {flightDetails?.airline} {flightDetails?.flight_number}
                                {isConnecting && leg2Flight && ` + ${leg2Flight}`}
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
                                {flightDetails?.departure_time
                                    ? new Date(flightDetails.departure_time).toLocaleString()
                                    : ''}
                            </div>
                        </div>
                        <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #334155' }}>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Passenger(s)</div>
                            {passengersData.map((p, idx) => (
                                <div key={idx} style={{ color: '#fff', fontSize: '14px', marginBottom: '4px' }}>
                                    {idx + 1}. {p.first_name} {p.last_name}
                                </div>
                            ))}
                            <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '6px' }}>
                                {seatNumber && `Seat: ${seatNumber} | `}Class: {flightClass}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Price Details</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '14px', marginBottom: '6px' }}>
                                <span>Ticket Price</span>
                                <span>${(totalPrice / passengerCount / 1.1).toFixed(2)} × {passengerCount}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '14px', marginBottom: '6px' }}>
                                <span>Taxes & Fees</span>
                                <span>${(totalPrice * 0.1 / 1.1).toFixed(2)}</span>
                            </div>
                            <div style={{ borderTop: '2px solid #334155', paddingTop: '10px', marginTop: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#deff9a', fontSize: '20px', fontWeight: 'bold' }}>
                                    <span>Total</span>
                                    <span>${totalPrice.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PAYMENT FORM */}
                    <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '12px', padding: '24px', border: '1px solid #334155' }}>
                        <h3 style={{ color: '#deff9a', marginTop: 0, marginBottom: '20px', fontSize: '18px', borderBottom: '2px solid #334155', paddingBottom: '10px' }}>
                            Payment Method
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                            <button type="button" onClick={() => setPaymentMethod('card')}
                                style={{
                                    padding: '14px',
                                    background: paymentMethod === 'card' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#0f172a',
                                    color: paymentMethod === 'card' ? '#fff' : '#94a3b8',
                                    border: paymentMethod === 'card' ? '2px solid #3b82f6' : '1px solid #334155',
                                    borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px'
                                }}>
                                💳 Credit/Debit Card
                            </button>
                            <button type="button" onClick={() => setPaymentMethod('paypal')}
                                style={{
                                    padding: '14px',
                                    background: paymentMethod === 'paypal' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#0f172a',
                                    color: paymentMethod === 'paypal' ? '#fff' : '#94a3b8',
                                    border: paymentMethod === 'paypal' ? '2px solid #3b82f6' : '1px solid #334155',
                                    borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px'
                                }}>
                                🅿️ PayPal
                            </button>
                        </div>

                        <form onSubmit={handlePaymentSubmit}>
                            {paymentMethod === 'card' ? (
                                <>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>Card Number</label>
                                        <input type="text" name="cardNumber" value={cardData.cardNumber} onChange={handleCardChange} placeholder="1234 5678 9012 3456"
                                            style={{ width: '100%', padding: '14px', background: '#0f172a', border: errors.cardNumber ? '2px solid #ef4444' : '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '16px', boxSizing: 'border-box' }} />
                                        {errors.cardNumber && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.cardNumber}</div>}
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>Card Holder Name</label>
                                        <input type="text" name="cardHolder" value={cardData.cardHolder} onChange={handleCardChange} placeholder="JOHN DOE"
                                            style={{ width: '100%', padding: '14px', background: '#0f172a', border: errors.cardHolder ? '2px solid #ef4444' : '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '16px', boxSizing: 'border-box', textTransform: 'uppercase' }} />
                                        {errors.cardHolder && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.cardHolder}</div>}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>Expiry Date</label>
                                            <input type="text" name="expiryDate" value={cardData.expiryDate} onChange={handleCardChange} placeholder="MM/YY"
                                                style={{ width: '100%', padding: '14px', background: '#0f172a', border: errors.expiryDate ? '2px solid #ef4444' : '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '16px', boxSizing: 'border-box' }} />
                                            {errors.expiryDate && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.expiryDate}</div>}
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>CVV</label>
                                            <input type="text" name="cvv" value={cardData.cvv} onChange={handleCardChange} placeholder="123"
                                                style={{ width: '100%', padding: '14px', background: '#0f172a', border: errors.cvv ? '2px solid #ef4444' : '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '16px', boxSizing: 'border-box' }} />
                                            {errors.cvv && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.cvv}</div>}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div style={{ padding: '40px 20px', textAlign: 'center', background: '#0f172a', borderRadius: '8px', marginBottom: '20px' }}>
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🅿️</div>
                                    <div style={{ color: '#94a3b8', fontSize: '14px' }}>
                                        You will be redirected to PayPal to complete your payment securely.
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px', background: 'rgba(34,197,94,0.1)', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(34,197,94,0.3)' }}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="#22c55e">
                                    <path d="M10,2 L18,6 L18,10 C18,14.4 14.4,18 10,18 C5.6,18 2,14.4 2,10 L2,6 L10,2 Z"/>
                                    <path d="M7,10 L9,12 L13,8" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <div style={{ color: '#22c55e', fontSize: '13px', fontWeight: '500' }}>
                                    Your payment information is secure and encrypted
                                </div>
                            </div>

                            <button type="submit" disabled={processing}
                                style={{
                                    width: '100%', padding: '16px',
                                    background: processing ? '#64748b' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                                    color: '#fff', border: 'none', borderRadius: '8px',
                                    cursor: processing ? 'not-allowed' : 'pointer',
                                    fontWeight: 'bold', fontSize: '16px', opacity: processing ? 0.7 : 1
                                }}>
                                {processing ? '⏳ Processing...' : `💰 Pay $${totalPrice.toFixed(2)}`}
                            </button>

                            <button type="button" onClick={() => navigate(-1)}
                                style={{
                                    width: '100%', padding: '14px', marginTop: '12px',
                                    background: 'transparent', color: '#94a3b8',
                                    border: '1px solid #334155', borderRadius: '8px',
                                    cursor: 'pointer', fontWeight: 'bold', fontSize: '14px'
                                }}>
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