import os
import re

# 1. Update templates/verification.html
html_content = '''<!DOCTYPE html>
<html lang="en">
<body style="background-color: #0b1020; color: #ffffff; font-family: Arial, sans-serif; margin: 0; padding: 40px; text-align: center;">
    <div style="max-width: 500px; margin: auto; background: #1A233A; padding: 30px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
        <h1 style="color: #4F7CFF; margin-bottom: 5px;">✈️ FlightBooking</h1>
        <h2 style="color: #ffffff; margin-top: 0;">Email Verification</h2>
        <p style="color: #a0aec0; line-height: 1.5;">Thank you for registering! Please use the following One-Time Password (OTP) to complete your verification.</p>
        
        <div style="margin: 30px 0; padding: 20px; background: rgba(79, 124, 255, 0.1); border-radius: 8px;">
            <span style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #4F7CFF;">{{ otp }}</span>
        </div>
        
        <p style="color: #EF4444; font-size: 0.9rem; font-weight: bold;">⚠️ This OTP will expire in 10 minutes.</p>
        <p style="color: #a0aec0; font-size: 0.8rem; margin-top: 30px;">If you did not request this, please ignore this email.</p>
    </div>
</body>
</html>'''

with open('backend/templates/verification.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

# 2. Update app.py
with open('backend/app.py', 'r', encoding='utf-8') as f:
    app_content = f.read()

if 'from datetime import datetime, timedelta' not in app_content:
    app_content = app_content.replace('from datetime import datetime', 'from datetime import datetime, timedelta')

# Update mail config placeholders
app_content = re.sub(r"app\.config\['MAIL_USERNAME'\].*", "app.config['MAIL_USERNAME'] = 'your_username@gmail.com' # CHANGE TO YOUR GMAIL", app_content)
app_content = re.sub(r"app\.config\['MAIL_PASSWORD'\].*", "app.config['MAIL_PASSWORD'] = 'your_app_password_here'      # CHANGE TO YOUR 16-CHAR APP PASSWORD", app_content)
app_content = re.sub(r"app\.config\['MAIL_DEFAULT_SENDER'\].*", "app.config['MAIL_DEFAULT_SENDER'] = 'your_username@gmail.com'", app_content)

# Update register
register_replaced = '''@app.route('/register', methods=['POST'])
def register():
    data = request.json
    db = get_db_connection()
    cursor = db.cursor()
    try:
        otp = str(random.randint(100000, 999999))
        expiry = datetime.now() + timedelta(minutes=10)
        
        print(f"[DEBUG] Generated OTP {otp} for {data['email']}")
        
        cursor.execute("INSERT INTO users (username, password, email, otp_code, otp_expiry, is_verified) VALUES (%s, %s, %s, %s, %s, %s)", 
                       (data['username'], data['password'], data['email'], otp, expiry, False))
        db.commit()
        
        # Send Verification Email
        try:
            msg = Message("Verify Your Email - OTP", recipients=[data['email']])
            msg.html = render_template('verification.html', otp=otp)
            mail.send(msg)
            print(f"[DEBUG] OTP email sent successfully to {data['email']}")
        except Exception as e:
            print("[ERROR] Failed to send OTP email:", str(e))
            
        return jsonify({"message": "Registration successful. Please check your email for the OTP."}), 201
    except mysql.connector.Error as err:
        print("[ERROR] DB Register Error:", str(err))
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        db.close()'''
app_content = re.sub(r"@app\.route\('/register', methods=\['POST'\]\).*?db\.close\(\)", register_replaced, app_content, flags=re.DOTALL)

# Replace verify + add send-otp & test-mail
verify_replaced = '''@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json
    email = data.get('email')
    otp = data.get('otp')
    
    print(f"[DEBUG] Verifying OTP {otp} for {email}")
    
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, otp_code, otp_expiry FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        if not user:
            print(f"[ERROR] Verification failed: User {email} not found")
            return jsonify({"error": "User not found"}), 404
            
        if user['otp_code'] != otp:
            print("[ERROR] Verification failed: Invalid OTP passed")
            return jsonify({"error": "Invalid OTP code"}), 400
            
        if user['otp_expiry'] and datetime.now() > user['otp_expiry']:
            print("[ERROR] Verification failed: OTP has expired")
            return jsonify({"error": "OTP has expired. Please resend."}), 400
            
        cursor.execute("UPDATE users SET is_verified = TRUE, otp_code = NULL, otp_expiry = NULL WHERE email = %s", (email,))
        db.commit()
        print(f"[DEBUG] User {email} successfully verified.")
        return jsonify({"message": "Email verified successfully"}), 200
    finally:
        cursor.close()
        db.close()

@app.route('/send-otp', methods=['POST'])
def send_otp():
    data = request.json
    email = data.get('email')
    
    db = get_db_connection()
    cursor = db.cursor()
    try:
        otp = str(random.randint(100000, 999999))
        expiry = datetime.now() + timedelta(minutes=10)
        
        cursor.execute("UPDATE users SET otp_code=%s, otp_expiry=%s WHERE email=%s", (otp, expiry, email))
        if cursor.rowcount == 0:
            return jsonify({"error": "Email not registered"}), 404
        db.commit()
        
        try:
            msg = Message("Your New OTP Code", recipients=[email])
            msg.html = render_template('verification.html', otp=otp)
            mail.send(msg)
            print(f"[DEBUG] Resent OTP successfully to {email}")
            return jsonify({"message": "OTP resent successfully"}), 200
        except Exception as e:
            print("[ERROR] Setup: Check Gmail App Password. Error:", str(e))
            return jsonify({"error": "Failed to send email. Check SMTP setup."}), 500
            
    finally:
        cursor.close()
        db.close()

@app.route('/test-mail', methods=['GET'])
def test_mail():
    target = request.args.get('email', app.config['MAIL_DEFAULT_SENDER'])
    print(f"[DEBUG] Test Mail Route Executed: Sending to {target}")
    try:
        msg = Message("Test SMTP Configuration", recipients=[target])
        msg.body = "If you are reading this, your Flask-Mail and Gmail App Password are configured correctly!"
        mail.send(msg)
        print("[DEBUG] Test email sent successfully to", target)
        return jsonify({"message": f"Test email sent successfully to {target}!"}), 200
    except Exception as e:
        print("[ERROR] Test email failed:", str(e))
        return jsonify({"error": str(e)}), 500
'''

app_content = re.sub(r"@app\.route\('/verify', methods=\['POST'\]\).*?db\.close\(\)", verify_replaced, app_content, flags=re.DOTALL)

with open('backend/app.py', 'w', encoding='utf-8') as f:
    f.write(app_content)

# 3. Update VerifyEmail.js
verify_js = """import React, { useState, useEffect } from 'react';
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
"""

with open('frontend/src/pages/VerifyEmail.js', 'w', encoding='utf-8') as f:
    f.write(verify_js)

print("Updates applied successfully.")
