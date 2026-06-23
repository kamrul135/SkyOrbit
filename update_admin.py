import os

css_content = """
.admin-panel {
    display: flex;
    min-height: 100vh;
    background-color: #0B1020;
    color: #fff;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.admin-sidebar {
    width: 250px;
    background-color: #1A233A;
    padding: 20px;
    display: flex;
    flex-direction: column;
    border-right: 1px solid rgba(255, 255, 255, 0.05);
    transition: all 0.3s;
}

.admin-sidebar-logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: #4F7CFF;
    margin-bottom: 30px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.admin-nav-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 12px 15px;
    margin-bottom: 5px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #a0aec0;
}

.admin-nav-item:hover, .admin-nav-item.active {
    background-color: rgba(79, 124, 255, 0.1);
    color: #4F7CFF;
}

.admin-content {
    flex: 1;
    padding: 30px;
    overflow-y: auto;
    height: 100vh;
}

/* Stats Cards */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.stat-card {
    background: #1A233A;
    padding: 20px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 15px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
}

.stat-card:hover {
    transform: translateY(-5px);
}

.stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
}

.stat-info h4 {
    margin: 0;
    color: #a0aec0;
    font-size: 0.9rem;
}

.stat-info h2 {
    margin: 5px 0 0 0;
    font-size: 1.5rem;
    color: #fff;
}

.admin-card {
    background: #1A233A;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 20px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.admin-table {
    width: 100%;
    border-collapse: collapse;
}

.admin-table th, .admin-table td {
    padding: 15px;
    text-align: left;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.admin-table th {
    color: #a0aec0;
    font-weight: 500;
    font-size: 0.9rem;
}

.admin-table tr:hover {
    background-color: rgba(255, 255, 255, 0.02);
}

.badge {
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: bold;
}

.badge-success { background: rgba(34, 197, 94, 0.1); color: #22C55E; }
.badge-danger { background: rgba(239, 68, 68, 0.1); color: #EF4444; }
.badge-primary { background: rgba(79, 124, 255, 0.1); color: #4F7CFF; }
.badge-warning { background: rgba(245, 158, 11, 0.1); color: #F59E0B; }

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.form-group label {
    font-size: 0.85rem;
    color: #a0aec0;
}

.form-group input, .form-group select {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    padding: 10px 15px;
    border-radius: 8px;
    outline: none;
    transition: all 0.3s;
}

.form-group input:focus, .form-group select:focus {
    border-color: #4F7CFF;
}

.btn {
    padding: 10px 20px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.btn-primary { background: #4F7CFF; color: white; }
.btn-primary:hover { background: #3c65d1; }
.btn-danger { background: #EF4444; color: white; }
.btn-danger:hover { background: #d13636; }
.btn-success { background: #22C55E; color: white; }
.btn-success:hover { background: #1a9e49; }
.btn-warning { background: #F59E0B; color: white; }

.filter-bar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 10px;
    margin-bottom: 20px;
}
.filter-bar input, .filter-bar select {
    background: rgba(0,0,0,0.2);
    border: 1px solid rgba(255,255,255,0.1);
    color: #fff;
    padding: 10px;
    border-radius: 8px;
    width: 100%;
}

.modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(5px);
}

.modal-content {
    background: #1A233A;
    padding: 30px;
    border-radius: 12px;
    width: 90%;
    max-width: 450px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    animation: popup 0.3s ease;
}

@keyframes popup {
    0% { transform: scale(0.9); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
}

/* Activity item hover effect */
.activity-item {
    transition: background 0.3s;
    border-radius: 6px;
}
.activity-item:hover {
    background: rgba(255, 255, 255, 0.03);
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .admin-panel {
        flex-direction: column;
    }
    .admin-sidebar {
        width: 100%;
        flex-direction: row;
        flex-wrap: wrap;
        padding: 10px;
        justify-content: center;
    }
    .admin-sidebar-logo { margin-bottom: 0; margin-right: 20px; }
    .admin-nav-item { padding: 8px; font-size: 0.85rem; gap: 5px; }
    
    .form-grid { grid-template-columns: 1fr; }
    
    .filter-bar {
        grid-template-columns: 1fr;
    }
    
    .admin-table th, .admin-table td {
        padding: 10px 5px;
        font-size: 0.8rem;
    }
}
"""

js_content = """
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    LayoutDashboard, Plane, Users, CalendarCheck, LogOut, 
    Plus, Trash2, Edit, Search, CheckCircle, XCircle 
} from 'lucide-react';
import { 
    CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis 
} from 'recharts';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AdminPanel.css';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({ total_flights: 0, total_users: 0, total_bookings: 0, total_revenue: 0 });
    const [flights, setFlights] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [users, setUsers] = useState([]);
    
    // Filters & States
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCity, setFilterCity] = useState('ALL');
    const [sortOrder, setSortOrder] = useState('Price ASC');
    const [loading, setLoading] = useState(false);
    
    // Form state handling both Adding and Editing
    const [isEditing, setIsEditing] = useState(false);
    const [editFlightId, setEditFlightId] = useState(null);
    const [flightForm, setFlightForm] = useState({
        flight_number: '', airline: '', origin_code: 'JFK', destination_code: 'LHR',
        departure_time: '', arrival_time: '', price: ''
    });

    const [modalConfig, setModalConfig] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, flightsRes, bookingsRes, usersRes] = await Promise.all([
                axios.get('http://localhost:5000/admin/stats').catch(() => ({data: {}})),
                axios.get('http://localhost:5000/flights'),
                axios.get('http://localhost:5000/admin/bookings').catch(() => ({data: []})),
                axios.get('http://localhost:5000/admin/users').catch(() => ({data: []}))
            ]);
            setStats(statsRes.data);
            setFlights(flightsRes.data);
            setBookings(bookingsRes.data);
            setUsers(usersRes.data);
        } catch (err) {
            toast.error("Failed to load dashboard data");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFlightFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.put(`http://localhost:5000/flights/${editFlightId}`, flightForm);
                toast.success("Flight updated successfully!");
            } else {
                await axios.post('http://localhost:5000/flights', flightForm);
                toast.success("Flight added successfully!");
            }
            fetchData();
            setActiveTab('flights');
            resetFlightForm();
        } catch (err) {
            toast.error(`Failed to ${isEditing ? 'update' : 'add'} flight`);
        }
    };

    const resetFlightForm = () => {
        setIsEditing(false);
        setEditFlightId(null);
        setFlightForm({
            flight_number: '', airline: '', origin_code: 'JFK', destination_code: 'LHR',
            departure_time: '', arrival_time: '', price: ''
        });
    };

    const triggerEditFlight = (f) => {
        setEditFlightId(f.id);
        setIsEditing(true);
        setFlightForm({
            flight_number: f.flight_number, airline: f.airline, origin_code: f.origin_code, destination_code: f.destination_code,
            departure_time: f.departure_time.slice(0,16), arrival_time: f.arrival_time.slice(0,16), price: f.price
        });
        setActiveTab('addFlight');
    };

    const confirmAction = async () => {
        if (!modalConfig) return;
        const { type, id } = modalConfig;
        
        try {
            if (type === 'flight') {
                await axios.delete(`http://localhost:5000/flights/${id}`);
                toast.success("Flight deleted successfully!");
            } else if (type === 'user') {
                await axios.delete(`http://localhost:5000/admin/users/${id}`);
                toast.success("User deleted successfully!");
            } else if (type === 'booking') {
                await axios.put(`http://localhost:5000/admin/bookings/${id}`, { status: 'cancelled' });
                toast.success("Booking cancelled successfully!");
            }
            setModalConfig(null);
            fetchData();
        } catch (err) {
            toast.error(`Failed to ${type === 'booking' ? 'cancel booking' : 'delete record'}`);
        }
    };

    const handleBookingStatus = async (id, status) => {
        try {
            await axios.put(`http://localhost:5000/admin/bookings/${id}`, { status });
            toast.success(`Booking ${status}`);
            fetchData();
        } catch (err) {
            toast.error("Failed to update booking");
        }
    };

    // Derived Logic for Features
    const revenueData = [
        { name: 'Jan', revenue: 4000 }, { name: 'Feb', revenue: 3000 },
        { name: 'Mar', revenue: 2000 }, { name: 'Apr', revenue: 2780 },
        { name: 'May', revenue: 1890 }, { name: 'Jun', revenue: stats.total_revenue || 5000 },
    ];

    const renderDashboard = () => (
        <div>
            <h2 style={{marginBottom: '20px'}}>Dashboard Overview</h2>
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{background: 'rgba(79, 124, 255, 0.1)', color: '#4F7CFF'}}><Plane size={24} /></div>
                    <div className="stat-info">
                        <h4>Total Flights</h4>
                        <h2>{stats.total_flights || flights.length}</h2>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E'}}><Users size={24} /></div>
                    <div className="stat-info">
                        <h4>Total Users</h4>
                        <h2>{stats.total_users || users.length}</h2>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B'}}><CalendarCheck size={24} /></div>
                    <div className="stat-info">
                        <h4>Total Bookings</h4>
                        <h2>{stats.total_bookings || bookings.length}</h2>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{background: 'rgba(236, 72, 153, 0.1)', color: '#EC4899'}}><span style={{fontSize: '1.2rem', fontWeight: 'bold'}}>$</span></div>
                    <div className="stat-info">
                        <h4>Total Revenue</h4>
                        <h2>${stats.total_revenue ? stats.total_revenue.toLocaleString() : '0'}</h2>
                    </div>
                </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px'}}>
                <div className="admin-card">
                    <h3>Revenue (Last 6 Months)</h3>
                    <div style={{height: '300px', width: '100%', marginTop: '20px'}}>
                        <ResponsiveContainer>
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" stroke="#a0aec0" />
                                <YAxis stroke="#a0aec0" />
                                <Tooltip contentStyle={{backgroundColor: '#1A233A', border: '1px solid #4F7CFF'}} />
                                <Line type="monotone" dataKey="revenue" stroke="#4F7CFF" strokeWidth={3} dot={{r: 5, fill: '#4F7CFF'}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="admin-card" style={{overflowY: 'auto', maxHeight: '400px'}}>
                    <h3>Recent Activity</h3>
                    <div style={{marginTop: '15px'}}>
                        {bookings.slice(0, 7).map((b, i) => (
                            <div key={i} className="activity-item" style={{padding: '12px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '15px'}}>
                                <div style={{width: '35px', height: '35px', borderRadius: '50%', background: 'rgba(79, 124, 255, 0.1)', color: '#4F7CFF', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                    <CalendarCheck size={16} />
                                </div>
                                <div style={{fontSize: '0.9rem'}}>
                                    <p style={{margin: 0}}><strong>{b.passenger_name}</strong> {b.status === 'confirmed' ? 'booked' : <span style={{color: '#EF4444'}}>cancelled</span>} a seat on <strong>{b.airline}</strong></p>
                                    <p style={{margin: 0, color: '#a0aec0', fontSize: '0.8rem'}}>Flight {b.flight_number} • ${b.price}</p>
                                </div>
                            </div>
                        ))}
                        {bookings.length === 0 && <p style={{color: '#a0aec0'}}>No recent activity.</p>}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderFlights = () => {
        let filtered = flights.filter(f => 
            (f.flight_number.toLowerCase().includes(searchQuery.toLowerCase()) || f.airline.toLowerCase().includes(searchQuery.toLowerCase()))
            && (filterCity === 'ALL' || f.origin_code === filterCity || f.destination_code === filterCity)
        );

        if (sortOrder === 'Price ASC') {
            filtered.sort((a,b) => parseFloat(a.price) - parseFloat(b.price));
        } else if (sortOrder === 'Price DESC') {
            filtered.sort((a,b) => parseFloat(b.price) - parseFloat(a.price));
        } else if (sortOrder === 'Departure Earliest') {
            filtered.sort((a,b) => new Date(a.departure_time) - new Date(b.departure_time));
        }

        return (
            <div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                    <h2>Manage Flights</h2>
                    <button className="btn btn-primary" onClick={() => { resetFlightForm(); setActiveTab('addFlight'); }}>
                        <Plus size={18} /> Add New Flight
                    </button>
                </div>
                <div className="admin-card">
                    <div className="filter-bar">
                        <div style={{position: 'relative', flex: 2}}>
                            <Search size={18} style={{position: 'absolute', left: '10px', top: '12px', color: '#a0aec0'}} />
                            <input type="text" placeholder="Search airline or flight..." style={{paddingLeft: '35px', width: '100%'}} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                        <select value={filterCity} onChange={e => setFilterCity(e.target.value)}>
                            <option value="ALL">All Cities</option>
                            <option value="JFK">JFK</option>
                            <option value="LHR">LHR</option>
                            <option value="CDG">CDG</option>
                            <option value="DXB">DXB</option>
                        </select>
                        <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                            <option value="Price ASC">Price (Low to High)</option>
                            <option value="Price DESC">Price (High to Low)</option>
                            <option value="Departure Earliest">Departure (Earliest)</option>
                        </select>
                    </div>
                    <div style={{overflowX: 'auto'}}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Airline</th>
                                    <th>Flight No.</th>
                                    <th>Route</th>
                                    <th>Departure / Arrival</th>
                                    <th>Price</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(f => (
                                    <tr key={f.id}>
                                        <td><strong>{f.airline}</strong></td>
                                        <td><span className="badge badge-primary">{f.flight_number}</span></td>
                                        <td>{f.origin_code} ✈ {f.destination_code}</td>
                                        <td style={{fontSize: '0.85rem'}}>
                                            <div style={{color: '#4CAF50'}}>{new Date(f.departure_time).toLocaleString()}</div>
                                            <div style={{color: '#EF4444'}}>{new Date(f.arrival_time).toLocaleString()}</div>
                                        </td>
                                        <td><strong>${f.price}</strong></td>
                                        <td>
                                            <div style={{display: 'flex', gap: '5px'}}>
                                                <button className="btn btn-warning" style={{padding: '6px'}} onClick={() => triggerEditFlight(f)}>
                                                    <Edit size={14} />
                                                </button>
                                                <button className="btn btn-danger" style={{padding: '6px'}} onClick={() => setModalConfig({type: 'flight', id: f.id, text: f.flight_number})}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderBookings = () => (
        <div>
            <h2 style={{marginBottom: '20px'}}>Booking Management</h2>
            <div className="admin-card" style={{overflowX: 'auto'}}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Passenger</th>
                            <th>Airline & Flight</th>
                            <th>Seat No.</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map(b => (
                            <tr key={b.booking_id}>
                                <td><strong>{b.passenger_name}</strong></td>
                                <td>{b.airline} ({b.flight_number})</td>
                                <td><span className="badge badge-primary">{b.seat_number}</span></td>
                                <td>${b.price}</td>
                                <td>
                                    <span className={`badge ${b.status === 'confirmed' ? 'badge-success' : 'badge-danger'}`}>
                                        {b.status.toUpperCase()}
                                    </span>
                                </td>
                                <td>
                                    <div style={{display: 'flex', gap: '5px'}}>
                                        {b.status !== 'confirmed' && (
                                            <button onClick={() => handleBookingStatus(b.booking_id, 'confirmed')} className="btn btn-success" style={{padding: '6px'}} title="Confirm">
                                                <CheckCircle size={14} />
                                            </button>
                                        )}
                                        {b.status !== 'cancelled' && (
                                            <button onClick={() => setModalConfig({type: 'booking', id: b.booking_id, text: `Booking ID #${b.booking_id}`})} className="btn btn-danger" style={{padding: '6px'}} title="Cancel Booking">
                                                <XCircle size={14} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div>
            <h2 style={{marginBottom: '20px'}}>Manage Users</h2>
            <div className="admin-card" style={{overflowX: 'auto'}}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Username</th>
                            <th>Role Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td>#{u.id}</td>
                                <td><strong>{u.username}</strong></td>
                                <td><span className="badge badge-success">{u.role.toUpperCase()}</span></td>
                                <td>
                                    <button className="btn btn-danger" style={{padding: '6px 12px', fontSize: '0.85rem'}}
                                            onClick={() => setModalConfig({type: 'user', id: u.id, text: u.username})}>
                                        <Trash2 size={14} /> Delete User
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderAddFlight = () => (
        <div>
            <h2 style={{marginBottom: '20px'}}>{isEditing ? 'Edit Flight Details' : 'Add New Flight'}</h2>
            <div className="admin-card" style={{maxWidth: '800px'}}>
                <form onSubmit={handleFlightFormSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Flight Number</label>
                            <input type="text" placeholder="e.g. BA102" required value={flightForm.flight_number} onChange={e => setFlightForm({...flightForm, flight_number: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Airline Name</label>
                            <input type="text" placeholder="e.g. British Airways" required value={flightForm.airline} onChange={e => setFlightForm({...flightForm, airline: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Origin Airport</label>
                            <select required value={flightForm.origin_code} onChange={e => setFlightForm({...flightForm, origin_code: e.target.value})}>
                                <option value="JFK">New York (JFK)</option>
                                <option value="LHR">London (LHR)</option>
                                <option value="CDG">Paris (CDG)</option>
                                <option value="DXB">Dubai (DXB)</option>
                                <option value="HND">Tokyo (HND)</option>
                                <option value="SYD">Sydney (SYD)</option>
                                <option value="SIN">Singapore (SIN)</option>
                                <option value="FRA">Frankfurt (FRA)</option>
                                <option value="PEK">Beijing (PEK)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Destination Airport</label>
                            <select required value={flightForm.destination_code} onChange={e => setFlightForm({...flightForm, destination_code: e.target.value})}>
                                <option value="JFK">New York (JFK)</option>
                                <option value="LHR">London (LHR)</option>
                                <option value="CDG">Paris (CDG)</option>
                                <option value="DXB">Dubai (DXB)</option>
                                <option value="HND">Tokyo (HND)</option>
                                <option value="SYD">Sydney (SYD)</option>
                                <option value="SIN">Singapore (SIN)</option>
                                <option value="FRA">Frankfurt (FRA)</option>
                                <option value="PEK">Beijing (PEK)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Departure Time</label>
                            <input type="datetime-local" required value={flightForm.departure_time} onChange={e => setFlightForm({...flightForm, departure_time: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Arrival Time</label>
                            <input type="datetime-local" required value={flightForm.arrival_time} onChange={e => setFlightForm({...flightForm, arrival_time: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Ticket Price ($)</label>
                            <input type="number" step="0.01" placeholder="0.00" required value={flightForm.price} onChange={e => setFlightForm({...flightForm, price: e.target.value})} />
                        </div>
                    </div>
                    <div style={{marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                        <button type="button" className="btn" style={{background: 'transparent', border: '1px solid #a0aec0'}} onClick={() => {resetFlightForm(); setActiveTab('flights');}}>Cancel</button>
                        <button type="submit" className="btn btn-primary"><Plane size={18}/> {isEditing ? 'Update Flight' : 'Publish Flight'}</button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <div className="admin-panel">
            <ToastContainer theme="dark" position="bottom-right" />
            
            <div className="admin-sidebar" style={{minWidth: '250px'}}>
                <div className="admin-sidebar-logo">
                    <Plane size={28} /> AdminPro
                </div>
                
                <div className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                    <LayoutDashboard size={20} /> Dashboard
                </div>
                <div className={`admin-nav-item ${activeTab === 'flights' ? 'active' : ''}`} onClick={() => setActiveTab('flights')}>
                    <Plane size={20} /> Flights
                </div>
                <div className={`admin-nav-item ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
                    <CalendarCheck size={20} /> Bookings
                </div>
                <div className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                    <Users size={20} /> Users
                </div>
                <div style={{flex: 1}}></div>
                <div className="admin-nav-item" onClick={() => {
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                }}>
                    <LogOut size={20} color="#EF4444" /> <span style={{color: '#EF4444'}}>Logout</span>
                </div>
            </div>

            <div className="admin-content">
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'flights' && renderFlights()}
                {activeTab === 'addFlight' && renderAddFlight()}
                {activeTab === 'bookings' && renderBookings()}
                {activeTab === 'users' && renderUsers()}
            </div>

            {modalConfig && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Confirm Action</h3>
                        <p style={{marginTop: '10px', color: '#a0aec0'}}>
                            Are you sure you want to proceed with acting on '{modalConfig.text}'? This action cannot be undone.
                        </p>
                        <div className="modal-actions">
                            <button className="btn" style={{background: 'rgba(255,255,255,0.1)'}} onClick={() => setModalConfig(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={confirmAction}>
                                Yes, Proceed
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
"""

with open('frontend/src/pages/AdminPanel.css', 'w', encoding='utf-8') as f:
    f.write(css_content)

with open('frontend/src/pages/AdminPanel.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print("Updates deployed successfully.")
