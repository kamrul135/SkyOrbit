import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const VerifyEmail = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const emailParam = queryParams.get('email') || '';

    const [email, setEmail] = useState(emailParam);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [timer, setTimer] = useState(60);
    const navigate = useNavigate();

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/verify-otp', { email, otp });
            setSuccess(true);
            toast.success("Email verified successfully! You can now login.", { position: "top-center" });
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            toast.error(err.response?.data?.error || "Verification failed. Invalid or expired OTP.", { position: "top-center" });
        }
        setLoading(false);
    };

    const handleResend = async () => {
        if (!email) {
            toast.error("Email address missing");
            return;
        }
        setResendLoading(true);
        try {
            await axios.post('http://localhost:5000/send-otp', { email });
            toast.success("A new OTP has been sent to your email.", { position: "top-center" });
            setTimer(60); // Reset timer
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to resend OTP", { position: "top-center" });
        }
        setResendLoading(false);
    }

    return (
        <div className="content" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh'}}>
            <ToastContainer theme="dark" />
            <div className="auth-card" style={{textAlign: 'center', width: '100%', maxWidth: '400px'}}>
                <div style={{fontSize: '40px', marginBottom: '20px'}}>
                    {success ? '✅' : '✈️'}
                </div>
                <h2 style={{marginBottom: '10px'}}>{success ? 'Verified!' : 'Email Verification'}</h2>
                <p style={{color: '#a0aec0', marginBottom: '20px', fontSize: '0.9rem'}}>
                    {success ? 'Your email address is now confirmed. Redirecting...' : 'Please enter the 6-digit code sent to your email.'}
                </p>
                
                {!success && (
                    <form onSubmit={handleVerify} className="auth-form" style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            disabled={!!emailParam}
                            style={{padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white'}}
                        />
                        <input 
                            type="text" 
                            placeholder="6-Digit OTP" 
                            value={otp} 
                            onChange={(e) => setOtp(e.target.value)} 
                            maxLength={6}
                            required 
                            style={{padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', textAlign: 'center', letterSpacing: '8px', fontSize: '1.5rem', fontWeight: 'bold'}}
                        />
                        <button type="submit" className="primary-btn" disabled={loading} style={{padding: '12px'}}>
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </form>
                )}
                
                {!success && (
                    <div style={{marginTop: '20px'}}>
                        <button 
                            onClick={handleResend} 
                            type="button"
                            disabled={timer > 0 || resendLoading}
                            style={{
                                background: 'transparent', 
                                border: 'none', 
                                color: (timer > 0 || resendLoading) ? '#718096' : '#4F7CFF', 
                                cursor: (timer > 0 || resendLoading) ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                            }}
                        >
                            {resendLoading ? 'Sending...' : (timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP')}
                        </button>
                    </div>
                )}

                <p style={{marginTop: '20px', fontSize: '0.9rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px'}}>
                    <Link to="/login" style={{color: 'var(--primary-color)', textDecoration: 'none'}}>Back to Login</Link>
                </p>
            </div>
        </div>
    );
}

export default VerifyEmail;
