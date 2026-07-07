import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import './BookingInformation.css';

const BookingInformation = () => {
    const { flightId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();

    const passengersCount = Number(searchParams.get('passengers')) || 1;
    const flightClass     = searchParams.get('class') || 'Economy';
    const leg2Id          = searchParams.get('leg2_id');

    const stateData = location.state || {};

    const isConnecting  = stateData.isConnecting || (searchParams.get('is_connecting') === 'true');
    const leg1Price     = stateData.leg1_price || parseFloat(searchParams.get('leg1_price')) || 0;
    const leg2Price     = stateData.leg2_price || parseFloat(searchParams.get('leg2_price')) || 0;
    const passedPrice   = stateData.price || parseFloat(searchParams.get('price')) || parseFloat(searchParams.get('total_price')) || 0;

    const originCode    = stateData.origin || searchParams.get('origin') || '';
    const destCode      = stateData.dest || searchParams.get('dest') || '';
    const layoverCode   = stateData.layover || searchParams.get('layover') || '';

    let basePrice = 0;
    if (isConnecting) {
        basePrice = leg1Price + leg2Price;
    } else {
        basePrice = passedPrice || leg1Price;
    }

    if (basePrice === 0) {
        basePrice = 320.00;
    }

    const totalPrice = basePrice * passengersCount;

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

        sessionStorage.setItem('passengersData', JSON.stringify(passengersData));

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
        <div className="booking-info-container">
            <h2 className="booking-info-title">✈ Passenger Information</h2>
            <p className="booking-info-subtitle">
                Please enter the details exactly as they appear on the passport.
            </p>

            <form onSubmit={handleSubmit}>
                {passengersData.map((passenger, index) => (
                    <div key={passenger.id} className="passenger-card">
                        <h4 className="passenger-card-title">
                            Passenger #{passenger.id}
                        </h4>

                        <div className="passenger-field-grid">
                            <div>
                                <label className="passenger-field-label">First Name</label>
                                <input
                                    type="text"
                                    required
                                    className="passenger-field-input"
                                    value={passenger.first_name}
                                    onChange={(e) => handleInputChange(index, 'first_name', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="passenger-field-label">Last Name</label>
                                <input
                                    type="text"
                                    required
                                    className="passenger-field-input"
                                    value={passenger.last_name}
                                    onChange={(e) => handleInputChange(index, 'last_name', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="passenger-field-grid">
                            <div>
                                <label className="passenger-field-label">Date of Birth</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Date of Birth"
                                    onFocus={(e) => e.target.type = 'date'}
                                    onBlur={(e) => !e.target.value && (e.target.type = 'text')}
                                    className="passenger-field-input"
                                    value={passenger.dob}
                                    onChange={(e) => handleInputChange(index, 'dob', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="passenger-field-label">Gender</label>
                                <select
                                    required
                                    className="passenger-field-select"
                                    value={passenger.gender}
                                    onChange={(e) => handleInputChange(index, 'gender', e.target.value)}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                        </div>

                        <div className="passenger-field-grid">
                            <div>
                                <label className="passenger-field-label">Contact Email</label>
                                <input
                                    type="email"
                                    required
                                    className="passenger-field-input"
                                    value={passenger.email}
                                    onChange={(e) => handleInputChange(index, 'email', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="passenger-field-label">Phone Number</label>
                                <input
                                    type="text"
                                    required
                                    className="passenger-field-input"
                                    value={passenger.phone}
                                    onChange={(e) => handleInputChange(index, 'phone', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="passenger-field-grid">
                            <div>
                                <label className="passenger-field-label">Passport Number</label>
                                <input
                                    type="text"
                                    required
                                    className="passenger-field-input"
                                    value={passenger.passport_number}
                                    onChange={(e) => handleInputChange(index, 'passport_number', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="passenger-field-label">Nationality</label>
                                <input
                                    type="text"
                                    required
                                    className="passenger-field-input"
                                    value={passenger.nationality}
                                    onChange={(e) => handleInputChange(index, 'nationality', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="passenger-field-grid-single">
                            <div>
                                <label className="passenger-field-label">Passport Expiry</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Passport Expiry"
                                    onFocus={(e) => e.target.type = 'date'}
                                    onBlur={(e) => !e.target.value && (e.target.type = 'text')}
                                    className="passenger-field-input"
                                    value={passenger.passport_expiry}
                                    onChange={(e) => handleInputChange(index, 'passport_expiry', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                ))}

                <div className="price-summary">
                    <p className="price-summary-line">
                        {passengersCount} passenger(s) × ${basePrice.toFixed(2)}
                    </p>
                    <h3 className="price-summary-total">
                        Total Price: <span className="price-summary-amount">${totalPrice.toFixed(2)}</span>
                    </h3>
                    <button type="submit" className="continue-payment-btn">
                        Continue to Payment →
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BookingInformation;