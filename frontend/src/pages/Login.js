import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// সুন্দর ও আধুনিক আইকন ইমপোর্ট করা হলো
import { FaUser, FaLock, FaEye, FaEyeSlash, FaPlane } from 'react-icons/fa';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // পাসওয়ার্ড টগলের জন্য স্টেট
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
        <div className="auth-card">
            <ToastContainer theme="dark" />
            
            {/* সাধারণ ইমোজির বদলে রিয়্যাক্ট আইকন ব্যবহার, যা সিএসএস দিয়ে সহজেই কালার করা যাবে */}
            <div className="auth-icon" style={{ fontSize: '2.5rem', color: '#3b82f6', marginBottom: '15px' }}>
                <FaPlane style={{ transform: 'rotate(-45deg)' }} />
            </div>
            
            <h2 style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '5px', color: '#fff' }}>Welcome Back!</h2>
            <p style={{ color: '#94a3b8', marginBottom: '25px', fontSize: '0.9rem' }}>Login to your account</p>
            
            <form onSubmit={handleLogin} className="auth-form" style={{ display: 'flex', flexDirection: 'col', gap: '16px' }}>
                
                {/* Username Input Container */}
                <div className="input-group" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <FaUser style={{ position: 'absolute', left: '12px', color: '#64748b' }} />
                    <input 
                        type="text" 
                        placeholder="Username" 
                        value={username} 
                        onChange={e => setUsername(e.target.value)} 
                        required 
                        style={{
                            width: '100%',
                            padding: '12px 12px 12px 40px', // বামে আইকনের জন্য জায়গা ছাড়া হয়েছে
                            background: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            color: '#fff',
                            outline: 'none',
                            fontSize: '0.95rem',
                            transition: 'all 0.3s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                        onBlur={(e) => e.target.style.borderColor = '#334155'}
                    />
                </div>

                {/* Password Input Container */}
                <div className="input-group" style={{ position: 'relative', display: 'flex', alignItems: 'center', marginTop: '15px' }}>
                    <FaLock style={{ position: 'absolute', left: '12px', color: '#64748b' }} />
                    <input 
                        type={showPassword ? "text" : "password"} // স্টেট অনুযায়ী টাইপ চেঞ্জ হবে
                        placeholder="Password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        required 
                        style={{
                            width: '100%',
                            padding: '12px 40px 12px 40px', // ডানে ও বামে আইকনের জন্য জায়গা রাখা হয়েছে
                            background: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            color: '#fff',
                            outline: 'none',
                            fontSize: '0.95rem',
                            transition: 'all 0.3s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                        onBlur={(e) => e.target.style.borderColor = '#334155'}
                    />
                    {/* পাসওয়ার্ড দেখা বা লুকানোর বাটন */}
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            position: 'absolute',
                            right: '12px',
                            background: 'none',
                            border: 'none',
                            color: '#64748b',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>

                {/* Login Button with Hover/Active animations via inline style parameters */}
                <button 
                    type="submit" 
                    className="primary-btn" 
                    style={{
                        marginTop: '20px',
                        width: '100%',
                        padding: '12px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', // গ্রাডিয়েন্ট ব্যাকগ্রাউন্ড
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, opacity 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                    onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
                    onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                >
                    Login
                </button>
            </form>

            <p style={{ marginTop: '25px', fontSize: '0.9rem', color: '#94a3b8' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: '#3b82f6', fontWeight: 'bold', textDecoration: 'none' }}>
                    Register
                </Link>
            </p>
        </div>
    );
};

export default Login;