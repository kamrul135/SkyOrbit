import os
import re

# 1. Email Templates
os.makedirs('backend/templates', exist_ok=True)

with open('backend/templates/verification.html', 'w', encoding='utf-8') as f:
    f.write('''<!DOCTYPE html>
<html><body>
<h2>Welcome to FlightBooking!</h2>
<p>Please verify your email address by clicking the link below:</p>
<a href="{{ verify_link }}" style="display:inline-block; padding:10px 20px; background-color:#4F7CFF; color:white; text-decoration:none; border-radius:5px;">Verify Email</a>
</body></html>''')

with open('backend/templates/booking_confirmation.html', 'w', encoding='utf-8') as f:
    f.write('''<!DOCTYPE html>
<html><body>
<h2>Booking Confirmed!</h2>
<p>Hi {{ passenger_name }},</p>
<p>Your flight <strong>{{ airline }} {{ flight_number }}</strong> from <strong>{{ origin }}</strong> to <strong>{{ dest }}</strong> is confirmed.</p>
<p>Departure: {{ departure_time }}</p>
<p>Seat Number: {{ seat_number }}</p>
<p>Total Paid: ${{ price }}</p>
<p>Thank you for choosing FlightBooking!</p>
</body></html>''')

with open('backend/templates/reminder.html', 'w', encoding='utf-8') as f:
    f.write('''<!DOCTYPE html>
<html><body>
<h2>Upcoming Flight Reminder</h2>
<p>Hi {{ passenger_name }},</p>
<p>This is a reminder that your flight <strong>{{ airline }} {{ flight_number }}</strong> from <strong>{{ origin }}</strong> to <strong>{{ dest }}</strong> will depart soon!</p>
<p>Departure Time: {{ departure_time }}</p>
<p>Seat Number: {{ seat_number }}</p>
<p>Have a safe trip!</p>
</body></html>''')

# 2. Update Backend Additions (app.py)
with open('backend/app.py', 'r') as f:
    backend_content = f.read()

# Add imports if not present
if 'from flask_mail import' not in backend_content:
    backend_content = backend_content.replace('from datetime import datetime', 
'''from datetime import datetime
from flask_mail import Mail, Message
from flask import render_template
import secrets
from apscheduler.schedulers.background import BackgroundScheduler
import threading''')

# Add mail config
if 'mail = Mail(app)' not in backend_content:
    backend_content = backend_content.replace('CORS(app)',
'''CORS(app)

# Email Configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'demo.flightbooking@gmail.com' # Replace in prod
app.config['MAIL_PASSWORD'] = 'demopassword123'              # Replace in prod
app.config['MAIL_DEFAULT_SENDER'] = 'demo.flightbooking@gmail.com'
try:
    mail = Mail(app)
except:
    mail = None
''')

# Modify Register logic
register_replacement = '''@app.route('/register', methods=['POST'])
def register():
    data = request.json
    db = get_db_connection()
    cursor = db.cursor()
    try:
        token = secrets.token_urlsafe(32)
        cursor.execute("INSERT INTO users (username, password, email, verification_token, is_verified) VALUES (%s, %s, %s, %s, %s)", 
                       (data['username'], data['password'], data['email'], token, False))
        db.commit()
        
        # Send Verification Email
        try:
            verify_link = f"http://localhost:3000/verify/{token}"
            msg = Message("Verify Your Email", recipients=[data['email']])
            msg.html = render_template('verification.html', verify_link=verify_link)
            mail.send(msg)
        except Exception as e:
            print("Mail error:", str(e))
            
        return jsonify({"message": "Registration successful. Please check your email to verify."}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        db.close()'''

# Fix login logic
login_replacement = '''@app.route('/login', methods=['POST'])
def login():
    data = request.json
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id, username, role, is_verified FROM users WHERE username=%s AND password=%s", 
                   (data.get('username'), data.get('password')))
    user = cursor.fetchone()
    cursor.close()
    db.close()
    
    if user:
        if not user.get('is_verified') and user.get('role') != 'admin':
            return jsonify({"error": "Please verify your email before logging in."}), 403
        return jsonify({"message": "Login successful", "user": user}), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401'''

# Book flight replacement
book_replacement = '''@app.route('/book', methods=['POST'])
def book_flight():
    data = request.json
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    
    try:
        # Check concurrency
        cursor.execute("SELECT * FROM bookings WHERE flight_id=%s AND seat_number=%s AND status='confirmed'", (data['flight_id'], data['seat_number']))
        if cursor.fetchone():
            return jsonify({"error": "Seat already booked"}), 409

        cursor.execute("INSERT INTO bookings (user_id, flight_id, seat_number, status) VALUES (%s, %s, %s, 'confirmed')",
                       (data['user_id'], data['flight_id'], data['seat_number']))
        booking_id = cursor.lastrowid
        db.commit()
        
        # Fetch data for email
        cursor.execute("""
            SELECT u.email, u.username, f.airline, f.flight_number, f.departure_time, f.price,
                   o.city as origin, d.city as dest
            FROM flights f
            JOIN users u ON u.id = %s
            JOIN airports o ON f.origin_code = o.code
            JOIN airports d ON f.destination_code = d.code
            WHERE f.id = %s
        """, (data['user_id'], data['flight_id']))
        info = cursor.fetchone()
        
        # Send Booking Confirmation
        if info and info['email']:
            try:
                msg = Message("Booking Confirmation", recipients=[info['email']])
                msg.html = render_template('booking_confirmation.html', 
                    passenger_name=info['username'], airline=info['airline'],
                    flight_number=info['flight_number'], origin=info['origin'],
                    dest=info['dest'], departure_time=info['departure_time'],
                    seat_number=data['seat_number'], price=info['price'])
                mail.send(msg)
            except Exception as e:
                print("Email fail:", str(e))
                
        return jsonify({"message": "Booking successful", "booking_id": booking_id}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        db.close()'''

import re
backend_content = re.sub(r'@app\.route\(\'/register\', methods=\[\'POST\'\]\).*?db\.close\(\)', register_replacement, backend_content, flags=re.DOTALL)
backend_content = re.sub(r'@app\.route\(\'/login\', methods=\[\'POST\'\]\).*?401', login_replacement, backend_content, flags=re.DOTALL)
backend_content = re.sub(r'@app\.route\(\'/book\', methods=\[\'POST\'\]\).*?db\.close\(\)', book_replacement, backend_content, flags=re.DOTALL)

# Add Verify and Scheduler
additions = '''
@app.route('/verify/<token>', methods=['GET'])
def verify_email(token):
    db = get_db_connection()
    cursor = db.cursor()
    try:
        cursor.execute("UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE verification_token = %s", (token,))
        if cursor.rowcount > 0:
            db.commit()
            return jsonify({"message": "Email verified successfully"}), 200
        return jsonify({"error": "Invalid or expired token"}), 400
    finally:
        cursor.close()
        db.close()

def send_flight_reminders():
    with app.app_context():
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        # Check flights departing within 24 hours
        cursor.execute("""
            SELECT b.id, b.seat_number, u.email, u.username, f.airline, f.flight_number, f.departure_time, o.city as origin, d.city as dest
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN flights f ON b.flight_id = f.id
            JOIN airports o ON f.origin_code = o.code
            JOIN airports d ON f.destination_code = d.code
            WHERE b.status = 'confirmed' AND b.reminder_sent = FALSE
            AND f.departure_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 24 HOUR)
        """)
        reminders = cursor.fetchall()
        for r in reminders:
            try:
                if r['email']:
                    msg = Message(f"Reminder: Upcoming Flight {r['flight_number']}", recipients=[r['email']])
                    msg.html = render_template('reminder.html', 
                        passenger_name=r['username'], airline=r['airline'], flight_number=r['flight_number'],
                        origin=r['origin'], dest=r['dest'], departure_time=r['departure_time'], seat_number=r['seat_number']
                    )
                    mail.send(msg)
                
                # Update status
                cursor.execute("UPDATE bookings SET reminder_sent = TRUE WHERE id = %s", (r['id'],))
                db.commit()
            except Exception as e:
                print("Scheduler Mail error:", e)
                
        cursor.close()
        db.close()

if not app.debug or os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
    try:
        scheduler = BackgroundScheduler()
        scheduler.add_job(func=send_flight_reminders, trigger="interval", minutes=30)
        scheduler.start()
    except Exception as e:
        print("Scheduler setup error:", e)
'''

if '@app.route(\'/verify/<token>\'' not in backend_content:
    backend_content = backend_content.replace("if __name__ == '__main__':", additions + "\nif __name__ == '__main__':")

with open('backend/app.py', 'w', encoding='utf-8') as f:
    f.write(backend_content)


# 3. Update Register.js
register_js = '''import React, { useState } from 'react';
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
            setTimeout(() => navigate('/login'), 5000);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Registration failed', { position: "top-center" });
        }
        setLoading(false);
    };

    return (
        <div className="auth-card" style={{position: 'relative'}}>
            <ToastContainer theme="dark" />
            <div className="auth-icon">✈</div>
            <h2 style={{fontSize: '1.5rem', marginBottom: '5px'}}>Create Account</h2>
            <p style={{color: '#718096', marginBottom: '20px', fontSize: '0.9rem'}}>Sign up to book your next flight</p>
            <form onSubmit={handleRegister} className="auth-form">
                <input type="text" placeholder="Choose a Username" value={username} onChange={e => setUsername(e.target.value)} required />
                <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder="Create a Password" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="submit" className="primary-btn" style={{marginTop: '15px'}} disabled={loading}>
                    {loading ? 'Registering & Sending Email...' : 'Register'}
                </button>
            </form>
            <p style={{marginTop: '25px', fontSize: '0.9rem'}}>Already have an account? <Link to="/login" style={{color: 'var(--primary-color)', fontWeight: 'bold', textDecoration: 'none'}}>Login here</Link></p>
        </div>
    );
}

export default Register;
'''

with open('frontend/src/pages/Register.js', 'w', encoding='utf-8') as f:
    f.write(register_js)


# 4. Update Login.js
login_js = '''import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
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
            <div className="auth-icon">✈</div>
            <h2 style={{fontSize: '1.5rem', marginBottom: '5px'}}>Welcome Back!</h2>
            <p style={{color: '#718096', marginBottom: '20px', fontSize: '0.9rem'}}>Login to your account</p>
            <form onSubmit={handleLogin} className="auth-form">
                <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="submit" className="primary-btn" style={{marginTop: '10px'}}>Login</button>
            </form>
            <p style={{marginTop: '25px', fontSize: '0.9rem'}}>Don't have an account? <Link to="/register" style={{color: 'var(--primary-color)', fontWeight: 'bold', textDecoration: 'none'}}>Register</Link></p>
        </div>
    );
};

export default Login;
'''

with open('frontend/src/pages/Login.js', 'w', encoding='utf-8') as f:
    f.write(login_js)

# 5. Add VerifyEmail.js
verify_js = '''import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('Verifying...');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const verify = async () => {
            try {
                await axios.get(`http://localhost:5000/verify/${token}`);
                setStatus('Email Verified Successfully!');
                setSuccess(true);
            } catch (err) {
                setStatus('Verification Failed. Invalid or expired token.');
                setSuccess(false);
            }
        };
        verify();
    }, [token]);

    return (
        <div className="content" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh'}}>
            <div className="auth-card" style={{textAlign: 'center'}}>
                <div style={{fontSize: '40px', marginBottom: '20px'}}>
                    {success ? '✅' : '⏳'}
                </div>
                <h2>{status}</h2>
                <p style={{color: '#a0aec0', marginTop: '10px'}}>
                    {success ? 'Your email address is now confirmed. You can log in.' : 'Please try registering again or contact support.'}
                </p>
                {success && (
                    <Link to="/login">
                        <button className="primary-btn" style={{marginTop: '20px'}}>Go to Login</button>
                    </Link>
                )}
            </div>
        </div>
    );
}

export default VerifyEmail;
'''

with open('frontend/src/pages/VerifyEmail.js', 'w', encoding='utf-8') as f:
    f.write(verify_js)

print("Deploy Email script prepared successfully.")
