import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LayoutDashboard, Plane, Users, CalendarCheck, LogOut,
    Plus, Trash2, Edit, Search, CheckCircle, XCircle
} from 'lucide-react';
import {
    CartesianGrid, Tooltip, ResponsiveContainer, XAxis, YAxis, Area, AreaChart
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
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCity, setFilterCity] = useState('ALL');
    const [sortOrder, setSortOrder] = useState('Price ASC');
    const [loading, setLoading] = useState(false);
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
                axios.get('http://localhost:5000/admin/stats').catch(() => ({ data: {} })),
                axios.get('http://localhost:5000/flights'),
                axios.get('http://localhost:5000/admin/bookings').catch(() => ({ data: [] })),
                axios.get('http://localhost:5000/admin/users').catch(() => ({ data: [] }))
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

    useEffect(() => { fetchData(); }, []);

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
        setFlightForm({ flight_number: '', airline: '', origin_code: 'JFK', destination_code: 'LHR', departure_time: '', arrival_time: '', price: '' });
    };

    const triggerEditFlight = (f) => {
        setEditFlightId(f.id);
        setIsEditing(true);
        setFlightForm({
            flight_number: f.flight_number, airline: f.airline,
            origin_code: f.origin_code, destination_code: f.destination_code,
            departure_time: f.departure_time.slice(0, 16),
            arrival_time: f.arrival_time.slice(0, 16), price: f.price
        });
        setActiveTab('addFlight');
    };

    const confirmAction = async () => {
        if (!modalConfig) return;
        const { type, id } = modalConfig;
        try {
            if (type === 'flight') {
                await axios.delete(`http://localhost:5000/flights/${id}`);
                toast.success("Flight deleted!");
            } else if (type === 'user') {
                await axios.delete(`http://localhost:5000/admin/users/${id}`);
                toast.success("User deleted!");
            } else if (type === 'booking') {
                await axios.put(`http://localhost:5000/admin/bookings/${id}`, { status: 'cancelled' });
                toast.success("Booking cancelled!");
            }
            setModalConfig(null);
            fetchData();
        } catch (err) {
            toast.error("Action failed");
        }
    };

    const revenueData = [
        { name: 'Jan', revenue: 4000 }, { name: 'Feb', revenue: 3000 },
        { name: 'Mar', revenue: 2000 }, { name: 'Apr', revenue: 2780 },
        { name: 'May', revenue: 1890 }, { name: 'Jun', revenue: stats.total_revenue || 5000 },
    ];

    const AIRPORTS = ['JFK','LHR','CDG','DXB','HND','SYD','SIN','FRA','PEK'];
    const AIRPORT_LABELS = { JFK:'New York (JFK)', LHR:'London (LHR)', CDG:'Paris (CDG)', DXB:'Dubai (DXB)', HND:'Tokyo (HND)', SYD:'Sydney (SYD)', SIN:'Singapore (SIN)', FRA:'Frankfurt (FRA)', PEK:'Beijing (PEK)' };

    const STAT_CARDS = [
        { label: 'Total Flights',  value: stats.total_flights  || flights.length,  icon: <Plane size={22}/>,        color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  tab: 'flights'  },
        { label: 'Total Users',    value: stats.total_users    || users.length,     icon: <Users size={22}/>,        color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   tab: 'users'    },
        { label: 'Total Bookings', value: stats.total_bookings || bookings.length,  icon: <CalendarCheck size={22}/>,color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  tab: 'bookings' },
        { label: 'Total Revenue',  value: `$${stats.total_revenue ? Number(stats.total_revenue).toLocaleString() : '0'}`, icon: <span style={{fontWeight:'800',fontSize:'1.1rem'}}>$</span>, color: '#a855f7', bg: 'rgba(168,85,247,0.1)', tab: 'bookings' },
    ];

    /* ── Dashboard ── */
    const renderDashboard = () => (
        <div>
            <h2>Dashboard Overview</h2>
            <div className="stats-grid">
                {STAT_CARDS.map((s, i) => (
                    <div
                        key={i}
                        className="stat-card"
                        onClick={() => setActiveTab(s.tab)}
                    >
                        <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                        <div className="stat-info">
                            <h4>{s.label}</h4>
                            <h2>{s.value}</h2>
                            <p className="stat-view-all" style={{ color: s.color }}>VIEW ALL →</p>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
                <div className="admin-card">
                    <h3>Revenue — Last 6 Months</h3>
                    <div style={{ height: '280px', marginTop: '20px' }}>
                        <ResponsiveContainer>
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="name" stroke="#334155" tick={{ fontSize: 12 }} />
                                <YAxis stroke="#334155" tick={{ fontSize: 12 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f1a2e', border: '1px solid #1a2f4e', borderRadius: '10px', color: '#f1f5f9' }} />
                                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#revGrad)" dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="admin-card" style={{ overflowY: 'auto', maxHeight: '360px' }}>
                    <h3>Recent Activity</h3>
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {bookings.slice(0, 8).map((b, i) => (
                            <div key={i} className="activity-item" style={{ padding: '10px 8px', borderBottom: '1px solid #0d1525', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                                    <CalendarCheck size={14} />
                                </div>
                                <div style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
                                    <p style={{ margin: 0, color: '#cbd5e1' }}>
                                        <strong style={{ color: '#f1f5f9' }}>{b.passenger_name || 'Passenger'}</strong>
                                        {' '}booked on{' '}
                                        <strong style={{ color: '#60a5fa' }}>{b.airline}</strong>
                                    </p>
                                    <p style={{ margin: 0, color: '#334155', fontSize: '0.75rem' }}>
                                        {b.flight_number} · ${b.price}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {bookings.length === 0 && <p style={{ color: '#334155', fontSize: '0.85rem' }}>No recent activity.</p>}
                    </div>
                </div>
            </div>
        </div>
    );

    /* ── Flights ── */
    const renderFlights = () => {
        let filtered = flights.filter(f =>
            (f.flight_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
             f.airline.toLowerCase().includes(searchQuery.toLowerCase())) &&
            (filterCity === 'ALL' || f.origin_code === filterCity || f.destination_code === filterCity)
        );
        if (sortOrder === 'Price ASC') filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        else if (sortOrder === 'Price DESC') filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        else if (sortOrder === 'Departure Earliest') filtered.sort((a, b) => new Date(a.departure_time) - new Date(b.departure_time));

        return (
            <div>
                <div className="admin-section-header">
                    <h2>Manage Flights <span style={{fontSize:'0.85rem',color:'#334155',fontWeight:'500'}}>({filtered.length} flights)</span></h2>
                    <button className="btn btn-primary" onClick={() => { resetFlightForm(); setActiveTab('addFlight'); }}>
                        <Plus size={16} /> Add Flight
                    </button>
                </div>
                <div className="admin-card">
                    <div className="filter-bar">
                        <div style={{ position: 'relative', flex: 2 }}>
                            <Search size={15} style={{ position: 'absolute', left: '12px', top: '11px', color: '#475569' }} />
                            <input type="text" placeholder="Search airline or flight number..." style={{ paddingLeft: '36px' }} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                        <select value={filterCity} onChange={e => setFilterCity(e.target.value)}>
                            <option value="ALL">All Airports</option>
                            {AIRPORTS.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                        <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                            <option value="Price ASC">Price ↑</option>
                            <option value="Price DESC">Price ↓</option>
                            <option value="Departure Earliest">Earliest Departure</option>
                        </select>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Airline</th><th>Flight No.</th><th>Route</th>
                                    <th>Departure</th><th>Arrival</th><th>Price</th><th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(f => (
                                    <tr key={f.id}>
                                        <td><strong style={{ color: '#f1f5f9' }}>{f.airline}</strong></td>
                                        <td><span className="badge badge-primary">{f.flight_number}</span></td>
                                        <td style={{ color: '#94a3b8' }}>{f.origin_code} → {f.destination_code}</td>
                                        <td style={{ fontSize: '0.82rem', color: '#34d399' }}>{new Date(f.departure_time).toLocaleString()}</td>
                                        <td style={{ fontSize: '0.82rem', color: '#f87171' }}>{new Date(f.arrival_time).toLocaleString()}</td>
                                        <td><strong style={{ color: '#f1f5f9' }}>${f.price}</strong></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button className="btn btn-warning" style={{ padding: '5px 8px' }} onClick={() => triggerEditFlight(f)}><Edit size={13} /></button>
                                                <button className="btn btn-danger"  style={{ padding: '5px 8px' }} onClick={() => setModalConfig({ type: 'flight', id: f.id, text: f.flight_number })}><Trash2 size={13} /></button>
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

    /* ── Bookings ── */
    const renderBookings = () => (
        <div>
            <h2>Booking Management</h2>
            <div className="admin-card" style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                    <thead>
                        <tr><th>Passenger</th><th>Airline & Flight</th><th>Seat</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {bookings.map(b => (
                            <tr key={b.booking_id}>
                                <td><strong style={{ color: '#f1f5f9' }}>{b.passenger_name || 'N/A'}</strong></td>
                                <td style={{ color: '#94a3b8' }}>{b.airline} · <span style={{ fontFamily: 'monospace', color: '#60a5fa' }}>{b.flight_number}</span></td>
                                <td><span className="badge badge-primary">{b.seat_number || b.seat || 'N/A'}</span></td>
                                <td><strong style={{ color: '#f1f5f9' }}>${b.price}</strong></td>
                                <td><span className={`badge ${b.status === 'confirmed' ? 'badge-success' : 'badge-danger'}`}>{(b.status || 'PENDING').toUpperCase()}</span></td>
                                <td>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        {b.status !== 'confirmed' && (
                                            <button className="btn btn-success" style={{ padding: '5px 8px' }} onClick={() => toast.info("Status update coming soon")}><CheckCircle size={13} /></button>
                                        )}
                                        <button className="btn btn-danger" style={{ padding: '5px 8px' }}
                                            onClick={() => setModalConfig({ type: 'booking', id: b.booking_id, text: `Booking #${b.booking_id}` })}>
                                            <XCircle size={13} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    /* ── Users ── */
    const renderUsers = () => (
        <div>
            <h2>Manage Users</h2>
            <div className="admin-card" style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                    <thead><tr><th>ID</th><th>Username</th><th>Role</th><th>Actions</th></tr></thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td style={{ color: '#475569', fontFamily: 'monospace' }}>#{u.id}</td>
                                <td><strong style={{ color: '#f1f5f9' }}>{u.username}</strong></td>
                                <td><span className="badge badge-success">{u.role.toUpperCase()}</span></td>
                                <td>
                                    <button className="btn btn-danger" style={{ padding: '6px 12px' }}
                                        onClick={() => setModalConfig({ type: 'user', id: u.id, text: u.username })}>
                                        <Trash2 size={13} /> Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    /* ── Add/Edit Flight ── */
    const renderAddFlight = () => (
        <div>
            <h2>{isEditing ? '✏️ Edit Flight' : '➕ Add New Flight'}</h2>
            <div className="admin-card" style={{ maxWidth: '760px' }}>
                <form onSubmit={handleFlightFormSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Flight Number</label>
                            <input type="text" placeholder="e.g. BA102" required value={flightForm.flight_number} onChange={e => setFlightForm({ ...flightForm, flight_number: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Airline Name</label>
                            <input type="text" placeholder="e.g. British Airways" required value={flightForm.airline} onChange={e => setFlightForm({ ...flightForm, airline: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Origin Airport</label>
                            <select required value={flightForm.origin_code} onChange={e => setFlightForm({ ...flightForm, origin_code: e.target.value })}>
                                {AIRPORTS.map(a => <option key={a} value={a}>{AIRPORT_LABELS[a]}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Destination Airport</label>
                            <select required value={flightForm.destination_code} onChange={e => setFlightForm({ ...flightForm, destination_code: e.target.value })}>
                                {AIRPORTS.map(a => <option key={a} value={a}>{AIRPORT_LABELS[a]}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Departure Time</label>
                            <input type="datetime-local" required value={flightForm.departure_time} onChange={e => setFlightForm({ ...flightForm, departure_time: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Arrival Time</label>
                            <input type="datetime-local" required value={flightForm.arrival_time} onChange={e => setFlightForm({ ...flightForm, arrival_time: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Ticket Price ($)</label>
                            <input type="number" step="0.01" placeholder="0.00" required value={flightForm.price} onChange={e => setFlightForm({ ...flightForm, price: e.target.value })} />
                        </div>
                    </div>
                    <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button type="button" className="btn" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid #1a2540' }}
                            onClick={() => { resetFlightForm(); setActiveTab('flights'); }}>Cancel</button>
                        <button type="submit" className="btn btn-primary">
                            <Plane size={15} /> {isEditing ? 'Update Flight' : 'Publish Flight'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <div className="admin-panel">
            <ToastContainer theme="dark" position="bottom-right" />

            <div className="admin-sidebar">
                <div className="admin-sidebar-logo"><Plane size={22} /> SkyOrbit Admin</div>
                {[
                    { id: 'dashboard', icon: <LayoutDashboard size={18}/>, label: 'Dashboard' },
                    { id: 'flights',   icon: <Plane size={18}/>,           label: 'Flights' },
                    { id: 'bookings',  icon: <CalendarCheck size={18}/>,   label: 'Bookings' },
                    { id: 'users',     icon: <Users size={18}/>,           label: 'Users' },
                ].map(item => (
                    <div key={item.id} className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.id)}>
                        {item.icon} {item.label}
                    </div>
                ))}
                <div style={{ flex: 1 }} />
                <div className="admin-nav-item" style={{ color: '#ef4444' }}
                    onClick={() => { localStorage.removeItem('user'); window.location.href = '/login'; }}>
                    <LogOut size={18} color="#ef4444" /> Logout
                </div>
            </div>

            <div className="admin-content">
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'flights'   && renderFlights()}
                {activeTab === 'addFlight' && renderAddFlight()}
                {activeTab === 'bookings'  && renderBookings()}
                {activeTab === 'users'     && renderUsers()}
            </div>

            {modalConfig && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Confirm Action</h3>
                        <p style={{ marginTop: '10px', color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
                            Are you sure about <strong style={{ color: '#f1f5f9' }}>"{modalConfig.text}"</strong>? This cannot be undone.
                        </p>
                        <div className="modal-actions">
                            <button className="btn" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid #1a2540' }}
                                onClick={() => setModalConfig(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={confirmAction}>Yes, Proceed</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;