import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPlaneDeparture } from 'react-icons/fa';
import './FlightResults.css';

const formatDuration = (ms) => {
    const totalMins = Math.floor(ms / 60000);
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${h}h ${m > 0 ? m + 'm' : ''}`.trim();
};

const FlightResults = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const origin      = searchParams.get('origin') || '';
    const dest        = searchParams.get('dest') || '';
    const startDate   = searchParams.get('start_date') || '';
    const endDate     = searchParams.get('end_date') || '';
    const passengers  = searchParams.get('passengers') || 1;
    const flightClass = searchParams.get('class') || '';
    const tripType    = searchParams.get('trip_type') || 'oneWay';

    const [directFlights, setDirectFlights]         = useState([]);
    const [connectingFlights, setConnectingFlights] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [sortOrder, setSortOrder] = useState('Price ASC');

    useEffect(() => {
        const fetchFlights = async () => {
            setLoading(true);
            try {
                const url = tripType === 'oneWay'
                    ? `http://localhost:5000/search?origin=${origin}&dest=${dest}&start_date=${startDate}`
                    : `http://localhost:5000/search?origin=${origin}&dest=${dest}&start_date=${startDate}&end_date=${endDate}`;
                const res = await axios.get(url);
                setDirectFlights(res.data.direct);
                setConnectingFlights(res.data.connecting);
            } catch (err) {
                console.error("Error fetching flights", err);
            }
            setLoading(false);
        };
        fetchFlights();
    }, [origin, dest, startDate, endDate, tripType]);

    const getSortedFlights = () => {
        let all = [
            ...directFlights.map(f => ({
                ...f, type: 'direct',
                sortPrice: parseFloat(f.price),
                sortArrTime: new Date(f.arrival_time).getTime(),
                duration: new Date(f.arrival_time).getTime() - new Date(f.departure_time).getTime()
            })),
            ...connectingFlights.map(cf => ({
                ...cf, type: 'connecting',
                sortPrice: parseFloat(cf.total_price),
                sortArrTime: new Date(cf.leg2_arr).getTime(),
                duration: new Date(cf.leg2_arr).getTime() - new Date(cf.leg1_dep).getTime()
            }))
        ];
        if (sortOrder === 'Price ASC')              all.sort((a, b) => a.sortPrice - b.sortPrice);
        else if (sortOrder === 'Price DESC')        all.sort((a, b) => b.sortPrice - a.sortPrice);
        else if (sortOrder === 'Arrival Earliest')  all.sort((a, b) => a.sortArrTime - b.sortArrTime);
        else if (sortOrder === 'Arrival Latest')    all.sort((a, b) => b.sortArrTime - a.sortArrTime);
        else if (sortOrder === 'Duration Shortest') all.sort((a, b) => a.duration - b.duration);
        return all;
    };

    const handleSelectFlight = (flight) => {
        const isConn = flight.type === 'connecting';
        const finalPrice = isConn ? parseFloat(flight.total_price) : parseFloat(flight.price);

        // Connecting flights are not a single row — they have leg1_id / leg2_id.
        // Payment.js needs flightId (path) for leg 1 and leg2_id (query) for leg 2.
        const leg1Id = isConn ? flight.leg1_id : flight.id;
        const leg2Id = isConn ? flight.leg2_id : null;

        const qs = new URLSearchParams({
            passengers: passengers,
            class:      flightClass,
            ...(leg2Id && { leg2_id: leg2Id })
        });

        navigate(`/booking-info/${leg1Id}?${qs.toString()}`, {
            state: {
                price: finalPrice,
                isConnecting: isConn,
                origin: isConn ? origin : flight.origin_code,
                dest: isConn ? dest : flight.destination_code,
                leg1_id: leg1Id,
                leg2_id: leg2Id,
                leg1_price: isConn ? parseFloat(flight.leg1_price) : finalPrice,
                leg2_price: isConn ? parseFloat(flight.leg2_price) : 0,
                layover: isConn ? flight.layover_code : ''
            }
        });
    };

    const sortedFlights = getSortedFlights();

    return (
        <div className="results-page-container">
            {/* ─── Top Bar ─── */}
            <div className="results-topbar">
                <button className="back-to-search-btn" onClick={() => navigate('/')}>
                    ← Modify Search
                </button>
                <div className="results-route-info">
                    <span className="results-route-text">
                        <strong>{origin}</strong> → <strong>{dest}</strong>
                    </span>
                    <span className="results-meta">
                        {startDate && new Date(startDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        {tripType === 'roundTrip' && endDate && ` — ${new Date(endDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}`}
                        {' · '}{passengers} passenger{Number(passengers) > 1 ? 's' : ''}
                        {' · '}{flightClass}
                    </span>
                </div>
                <div className="sort-filter-box">
                    <label>Sort By</label>
                    <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        <option>Price ASC</option>
                        <option>Price DESC</option>
                        <option>Arrival Earliest</option>
                        <option>Arrival Latest</option>
                        <option>Duration Shortest</option>
                    </select>
                </div>
            </div>

            {/* ─── Count Bar ─── */}
            <div className="results-count-bar">
                {loading ? <span>Searching flights...</span> : (
                    <span>
                        {sortedFlights.length > 0
                            ? <><strong style={{color:'#f1f5f9'}}>{sortedFlights.length}</strong> flights found</>
                            : 'No flights found'}
                    </span>
                )}
            </div>

            {/* ─── Loading ─── */}
            {loading && (
                <div className="results-loading">
                    <div className="loading-plane">✈</div>
                    <p>Searching for the best flights...</p>
                </div>
            )}

            {/* ─── Empty State ─── */}
            {!loading && sortedFlights.length === 0 && (
                <div className="empty-results-state">
                    <div className="empty-illustration">✈</div>
                    <h3>No flights found</h3>
                    <p>We couldn't find flights for this route and date. Try different dates or routes.</p>
                    <button className="select-flight-btn" style={{marginTop:'16px'}} onClick={() => navigate('/')}>
                        ← Back to Search
                    </button>
                </div>
            )}

            {/* ─── Flight Cards ─── */}
            <div className="flight-cards-container">
                {sortedFlights.map((flight, idx) => {
                    if (flight.type === 'direct') {
                        const depTime  = new Date(flight.departure_time);
                        const arrTime  = new Date(flight.arrival_time);
                        const duration = formatDuration(arrTime - depTime);
                        return (
                            <div key={`direct-${flight.id}`} className="premium-flight-card">
                                <div className="airline-branding">
                                    <div className="airline-logo-placeholder">{flight.airline?.charAt(0)}</div>
                                    <div>
                                        <h4>{flight.airline}</h4>
                                        {/* ✅ Direct flight number */}
                                        {flight.flight_number && (
                                            <p className="flight-number">{flight.flight_number}</p>
                                        )}
                                        <span className="flight-tag direct">Direct</span>
                                    </div>
                                </div>

                                <div className="timeline-block">
                                    <div className="time-node">
                                        <h3>{depTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h3>
                                        <p className="airport-code">{flight.origin_code}</p>
                                    </div>
                                    <div className="timeline-visual">
                                        <p className="duration-text">{duration}</p>
                                        <div className="timeline-line-row">
                                            <div className="flight-line"></div>
                                            <FaPlaneDeparture className="plane-icon-mid" />
                                        </div>
                                    </div>
                                    <div className="time-node">
                                        <h3>{arrTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h3>
                                        <p className="airport-code">{flight.destination_code}</p>
                                    </div>
                                </div>

                                <div className="pricing-action-block">
                                    <p className="price-label">Price from</p>
                                    <h2 className="flight-price">${parseFloat(flight.price).toFixed(2)}</h2>
                                    <p className="price-per-person">per person</p>
                                    <button className="select-flight-btn" onClick={() => handleSelectFlight(flight)}>
                                        Select →
                                    </button>
                                </div>
                            </div>
                        );

                    } else {
                        const leg1Dep  = new Date(flight.leg1_dep);
                        const leg2Arr  = new Date(flight.leg2_arr);
                        const duration = formatDuration(leg2Arr - leg1Dep);
                        return (
                            <div key={`conn-${idx}`} className="premium-flight-card connecting">
                                <div className="airline-branding">
                                    <div className="airline-logo-placeholder multiple">1+</div>
                                    <div>
                                        <h4>{flight.leg1_airline}</h4>
                                        {/* ✅ Connecting flight numbers — leg1 + leg2 */}
                                        <p className="flight-number">
                                            {flight.leg1_flight}
                                            {flight.leg2_flight && ` · ${flight.leg2_flight}`}
                                        </p>
                                        <span className="flight-tag stopover">1 Stop · {flight.layover_code}</span>
                                    </div>
                                </div>

                                <div className="timeline-block">
                                    <div className="time-node">
                                        <h3>{leg1Dep.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h3>
                                        <p className="airport-code">{origin}</p>
                                    </div>
                                    <div className="timeline-visual">
                                        <p className="duration-text layover">{duration}</p>
                                        <div className="timeline-line-row">
                                            <div className="flight-line stop"></div>
                                            <FaPlaneDeparture className="plane-icon-mid amber" />
                                        </div>
                                        <p className="via-text">via {flight.layover_code}</p>
                                    </div>
                                    <div className="time-node">
                                        <h3>{leg2Arr.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h3>
                                        <p className="airport-code">{dest}</p>
                                    </div>
                                </div>

                                <div className="pricing-action-block">
                                    <p className="price-label">Price from</p>
                                    <h2 className="flight-price">${parseFloat(flight.total_price).toFixed(2)}</h2>
                                    <p className="price-per-person">per person</p>
                                    <button className="select-flight-btn" onClick={() => handleSelectFlight(flight)}>
                                        Select →
                                    </button>
                                </div>
                            </div>
                        );
                    }
                })}
            </div>
        </div>
    );
};

export default FlightResults;