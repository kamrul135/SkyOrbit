import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/register', { username, email, password });
            toast.success(res.data.message || 'Registration successful! Verification email sent.', {
                position: "top-center",
                autoClose: 5000,
            });
            setTimeout(() => navigate(`/verify?email=${encodeURIComponent(email)}`), 3000);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Registration failed', { position: "top-center" });
        }
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-card" style={{position: 'relative'}}>
                <ToastContainer theme="dark" />
                <div className="auth-icon">✈</div>
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Sign up to book your next flight</p>
                <form onSubmit={handleRegister} className="auth-form">
                    <input type="text" placeholder="Choose a Username" value={username} onChange={e => setUsername(e.target.value)} required />
                    <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Create a Password" value={password} onChange={e => setPassword(e.target.value)} required />
                    <button type="submit" className="primary-btn" style={{marginTop: '15px'}} disabled={loading}>
                        {loading ? 'Registering & Sending Email...' : 'Register'}
                    </button>
                </form>
                <p className="auth-foot">Already have an account? <Link to="/login">Login here</Link></p>
            </div>
        </div>
    );
}

export default Register;
