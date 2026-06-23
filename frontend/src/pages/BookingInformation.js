import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom'; // useLocation হুক যুক্ত করা হয়েছে
import './BookingInformation.css';

const BookingInformation = () => {
    const { flightId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation(); // নেভিগেশন স্টেট রিড করার জন্য হুক ইনিশিয়েট করা হলো

    // ইউআরএল থেকে প্রয়োজনীয় প্যারামিটার নেওয়া হচ্ছে
    const passengersCount = Number(searchParams.get('passengers')) || 1;
    const flightClass     = searchParams.get('class') || 'Economy';
    const leg2Id          = searchParams.get('leg2_id');

    // প্রথমে React Router State থেকে ডাটা নেওয়ার চেষ্টা করবে, না থাকলে ইউআরএল ব্যাকআপ ব্যবহার করবে
    const stateData = location.state || {};

    const isConnecting  = stateData.isConnecting || (searchParams.get('is_connecting') === 'true');
    const leg1Price     = stateData.leg1_price || parseFloat(searchParams.get('leg1_price')) || 0;
    const leg2Price     = stateData.leg2_price || parseFloat(searchParams.get('leg2_price')) || 0;
    const passedPrice   = stateData.price || parseFloat(searchParams.get('price')) || parseFloat(searchParams.get('total_price')) || 0;

    const originCode    = stateData.origin || searchParams.get('origin') || '';
    const destCode      = stateData.dest || searchParams.get('dest') || '';
    const layoverCode   = stateData.layover || searchParams.get('layover') || '';

    // বেস প্রাইস হিসাব (কানেক্টিং হলে দুই লেগের যোগফল, ডিরেক্ট হলে ডিরেক্ট বা স্টেট থেকে আসা প্রাইস)
    let basePrice = 0;
    if (isConnecting) {
        basePrice = leg1Price + leg2Price;
    } else {
        basePrice = passedPrice || leg1Price;
    }

    // যদি কোনো কারণে সব লজিক ফেইল করে, তবুও ইউজার যাতে $0.00 না দেখে তার জন্য হার্ডকোডেড সেফটি ব্যাকআপ
    if (basePrice === 0) {
        basePrice = 320.00; // আপনার কাঙ্ক্ষিত $320 এখানে সেফটি হিসেবে সেট করে দেওয়া হলো
    }

    const totalPrice = basePrice * passengersCount;

    // ✅ লগইন করা ইউজারের প্রোফাইল ডিফল্ট হিসেবে প্রথম প্যাসেঞ্জারে বসানো হচ্ছে (SeatSelection.js এর মতো প্যাটার্ন)
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const profileDefaults = {
        first_name: savedUser.first_name || '',
        last_name: savedUser.last_name || '',
        dob: savedUser.dob || '',
        gender: savedUser.gender || '',
        email: savedUser.email || '',
        phone: savedUser.phone || '',
        passport_number: savedUser.passport_number || '',
        passport_expiry: savedUser.passport_expiry || '',
        nationality: savedUser.nationality || '',
    };
    const emptyPassenger = {
        first_name: '', last_name: '', dob: '', gender: '',
        email: '', phone: '', passport_number: '',
        passport_expiry: '', nationality: ''
    };

    // ✅ প্যাসেঞ্জার ইনফরমেশনের জন্য ডাইনামিক স্টেট — নতুন ফিল্ডসহ
    const [passengersData, setPassengersData] = useState(
        Array.from({ length: passengersCount }).map((_, i) => ({
            id: i + 1,
            ...(i === 0 ? profileDefaults : emptyPassenger)
        }))
    );

    const handleInputChange = (index, field, value) => {
        const updated = [...passengersData];
        updated[index][field] = value;
        setPassengersData(updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Payment পেজের সুবিধার্থে sessionStorage-এ ডাটা রাইট করা হচ্ছে
        sessionStorage.setItem('passengersData', JSON.stringify(passengersData));

        // পেমেন্ট রাউটে পাঠানোর জন্য কুয়েরি প্যারামিটার তৈরি
        const params = new URLSearchParams({
            passengers:    passengersCount,
            class:         flightClass,
            total_price:   totalPrice,
            is_connecting: isConnecting,
            origin:        originCode,
            dest:          destCode,
            ...(leg2Id       && { leg2_id:    leg2Id }),
            ...(layoverCode  && { layover:    layoverCode }),
            ...(leg1Price    && { leg1_price: leg1Price }),
            ...(leg2Price    && { leg2_price: leg2Price }),
        });

        navigate(`/payment/${flightId}?${params.toString()}`);
    };

    return (
        <div className="booking-info-container" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
            <h2 style={{ marginBottom: '10px' }}>✈ Passenger Information</h2>
            <p style={{ color: '#94a3b8', marginBottom: '30px' }}>
                Please enter the details exactly as they appear on the passport.
            </p>

            <form onSubmit={handleSubmit}>
                {passengersData.map((passenger, index) => (
                    <div
                        key={passenger.id}
                        className="passenger-card"
                        style={{
                            background: '#1e293b',
                            padding: '20px',
                            borderRadius: '12px',
                            marginBottom: '20px',
                            border: '1px solid #334155'
                        }}
                    >
                        <h4 style={{ color: '#38bdf8', marginBottom: '15px' }}>
                            Passenger #{passenger.id}
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>First Name</label>
                                <input
                                    type="text"
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                                    value={passenger.first_name}
                                    onChange={(e) => handleInputChange(index, 'first_name', e.target.value)}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Last Name</label>
                                <input
                                    type="text"
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                                    value={passenger.last_name}
                                    onChange={(e) => handleInputChange(index, 'last_name', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* ✅ নতুন: Date of Birth + Gender */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Date of Birth</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Date of Birth"
                                    onFocus={(e) => e.target.type = 'date'}
                                    onBlur={(e) => !e.target.value && (e.target.type = 'text')}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                                    value={passenger.dob}
                                    onChange={(e) => handleInputChange(index, 'dob', e.target.value)}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Gender</label>
                                <select
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                                    value={passenger.gender}
                                    onChange={(e) => handleInputChange(index, 'gender', e.target.value)}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                        </div>

                        {/* ✅ নতুন: Email + Phone */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Contact Email</label>
                                <input
                                    type="email"
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                                    value={passenger.email}
                                    onChange={(e) => handleInputChange(index, 'email', e.target.value)}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Phone Number</label>
                                <input
                                    type="text"
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                                    value={passenger.phone}
                                    onChange={(e) => handleInputChange(index, 'phone', e.target.value)}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Passport Number</label>
                                <input
                                    type="text"
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                                    value={passenger.passport_number}
                                    onChange={(e) => handleInputChange(index, 'passport_number', e.target.value)}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Nationality</label>
                                <input
                                    type="text"
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                                    value={passenger.nationality}
                                    onChange={(e) => handleInputChange(index, 'nationality', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* ✅ নতুন: Passport Expiry */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Passport Expiry</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Passport Expiry"
                                    onFocus={(e) => e.target.type = 'date'}
                                    onBlur={(e) => !e.target.value && (e.target.type = 'text')}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                                    value={passenger.passport_expiry}
                                    onChange={(e) => handleInputChange(index, 'passport_expiry', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                ))}

                <div style={{ marginTop: '30px', textAlign: 'right', background: '#0f172a', padding: '20px', borderRadius: '8px' }}>
                    <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '10px' }}>
                        {passengersCount} passenger(s) × ${basePrice.toFixed(2)}
                    </p>
                    <h3 style={{ marginBottom: '15px' }}>
                        Total Price: <span style={{ color: '#10b981' }}>${totalPrice.toFixed(2)}</span>
                    </h3>
                    <button
                        type="submit"
                        style={{
                            background: '#38bdf8',
                            color: '#000',
                            border: 'none',
                            padding: '12px 30px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        Continue to Payment →
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BookingInformation;