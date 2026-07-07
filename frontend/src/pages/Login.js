import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaPlane } from 'react-icons/fa';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/login', { username, password });
            localStorage.setItem('user', JSON.stringify(res.data.user));
            toast.success("Login successful!", { position: "top-center" });
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Invalid credentials', { position: "top-center" });
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <ToastContainer theme="dark" />

                <div className="auth-icon">
                    <FaPlane style={{ transform: 'rotate(-45deg)' }} />
                </div>

                <h2 className="auth-title">Welcome Back!</h2>
                <p className="auth-subtitle">Login to your account</p>

                <form onSubmit={handleLogin} className="auth-form">
                    {/* Username */}
                    <div className="input-group">
                        <FaUser className="input-icon" />
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            className="input-with-icon"
                        />
                    </div>

                    {/* Password */}
                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            className="input-with-toggle"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="password-toggle"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    <button type="submit" className="primary-btn" style={{ marginTop: '20px' }}>
                        Login
                    </button>
                </form>

                <p className="auth-foot">
                    Don't have an account?{' '}
                    <Link to="/register">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;

