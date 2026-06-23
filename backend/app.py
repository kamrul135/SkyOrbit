import os
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from datetime import datetime, date, timedelta
from flask_mail import Mail, Message
from flask import render_template
from dotenv import load_dotenv
from openai import OpenAI
import secrets
import random
from apscheduler.schedulers.background import BackgroundScheduler
import threading
import traceback
import json

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# ════════════════════════════════════════
# EMAIL CONFIGURATION
# ════════════════════════════════════════
app.config['MAIL_SERVER']         = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT']           = int(os.getenv('MAIL_PORT', '587'))
app.config['MAIL_USE_TLS']        = os.getenv('MAIL_USE_TLS', 'true').lower() == 'true'
app.config['MAIL_USERNAME']       = os.getenv('MAIL_USERNAME', 'hridoy516578@gmail.com')
app.config['MAIL_PASSWORD']       = os.getenv('MAIL_PASSWORD', 'nfrv utyc ivkj dtmu')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER', app.config['MAIL_USERNAME'])
try:
    mail = Mail(app)
except:
    mail = None


ZHIPU_API_KEY = os.getenv('ZHIPU_API_KEY', '')
ZHIPU_MODEL   = 'glm-4-flash'  # Zhipu AI এর fast & free model
 
# Zhipu AI OpenAI-compatible endpoint দিয়ে কাজ করে
openrouter_client = OpenAI(
    api_key  = ZHIPU_API_KEY,
    base_url = 'https://open.bigmodel.cn/api/paas/v4/',
) if ZHIPU_API_KEY else None

# ════════════════════════════════════════
# ✅ TRAINED SYSTEM PROMPT
# ════════════════════════════════════════
AIRLINE_ASSISTANT_PROMPT = """
You are SkyAssist — a friendly, professional, and highly knowledgeable airline support assistant for SkyOrbit, a flight booking platform.

═══════════════════════════════════════
PERSONALITY & TONE
═══════════════════════════════════════
- Warm, helpful, and concise. Never robotic.
- Always greet users politely on first message.
- Use short paragraphs. Maximum 3-4 sentences per reply.
- Never use bullet points or markdown headers in responses.
- If the user writes in Bengali (বাংলা), reply in Bengali. Otherwise reply in English.

═══════════════════════════════════════
CORE EXPERTISE — WHAT YOU KNOW
═══════════════════════════════════════

1. FLIGHT SEARCH
   - Help users find flights by origin, destination, and date.
   - Always use the database flight context provided. Never invent flights.
   - If multiple flights exist, recommend the cheapest or earliest based on user preference.
   - Mention flight number, airline, departure time, and price clearly.

2. BOOKING PROCESS
   - Step 1: Search flights on the Search page.
   - Step 2: Select seats on the Seat Selection page.
   - Step 3: Fill in passenger details.
   - Step 4: Pay on the Payment page.
   - Step 5: Receive booking confirmation by email.

3. OTP & VERIFICATION
   - OTP is sent to the registered email during sign-up.
   - OTP expires in 10 minutes.
   - If not received: check spam folder, or click "Resend OTP".
   - OTP issues are the most common login problem — guide users patiently.

4. CANCELLATION & REFUNDS
   - Users can cancel bookings from the Dashboard page.
   - Refunds are processed within 5-7 business days to the original payment method.
   - Cancellations made more than 24 hours before departure are fully refundable.
   - Cancellations within 24 hours may incur a 20% fee.

5. SEAT SELECTION
   - Economy class: rows 6–15.
   - Business class: rows 3–5.
   - First Class: rows 1–2.
   - Red seats = already booked. Blue = selected. Green = available.

6. BAGGAGE POLICY
   - Economy: 1 carry-on (7kg) + 1 checked bag (23kg) included.
   - Business: 2 checked bags (32kg each) included.
   - First Class: 3 checked bags (32kg each) included.
   - Excess baggage fee: $15 per kg.

7. PAYMENT
   - Accepted: Visa, Mastercard, Amex, PayPal.
   - All payments are SSL encrypted and secure.
   - Payment issues: try a different card or contact your bank.

8. ACCOUNT & PROFILE
   - Users can update profile, passport info, and preferences from the Profile page.
   - Password can be changed from Profile settings.
   - For account deletion, contact support at support@skyorbit.com.

9. CONTACT & SUPPORT
   - Email: support@skyorbit.com
   - Phone: +1 (800) 123-4567
   - Available 24/7.

═══════════════════════════════════════
WHAT YOU MUST NEVER DO
═══════════════════════════════════════
- Never invent, fabricate, or guess flight details, prices, or schedules.
- Never discuss topics unrelated to travel, flights, or this platform.
- Never provide medical, legal, or financial advice.
- Never share other users' personal data.
- If asked something outside your scope, politely say: "I can only help with flight bookings and travel support on SkyOrbit."
"""

# ════════════════════════════════════════
# DATABASE
# ════════════════════════════════════════
def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv('MYSQL_HOST', 'localhost'),
        user=os.getenv('MYSQL_USER', 'root'),
        password=os.getenv('MYSQL_PASSWORD', '265249'),
        database=os.getenv('MYSQL_DATABASE', 'flight_booking'),
        time_zone='+00:00'
    )


# ════════════════════════════════════════
# CHATBOT HELPERS
# ════════════════════════════════════════
def is_flight_related(text):
    if not text:
        return False
        
    text = text.lower().strip()
    
    # ❌ সাধারণ গ্রিটিংস বা হ্যালো-হাই যা চ্যাট শুরুর সময় ইউজার বলে (এগুলো ফ্লাইট খোঁজা নয়)
    greetings = {"hello", "hi", "hey", "good morning", "good afternoon", "good evening", "yo", "sup"}
    if text in greetings:
        return False

    # 🎯 নির্দিষ্ট কিছু কি-ওয়ার্ড যা থাকলে নিশ্চিত হওয়া যায় ইউজার ফ্লাইটের খোঁজ করছে
    flight_keywords = [
        "flight", "flights", "ticket", "book", "booking", "price", "fare", "cost",
        "available", "schedule", "fly", "flying", "to", "from", "route", "july", "find"
    ]
    
    # যেকোনো একটি কি-ওয়ার্ড টেক্সটের মধ্যে থাকলে True রিটার্ন করবে
    return any(keyword in text for keyword in flight_keywords)


def extract_airport_codes(message, airports):
    lowered = message.lower()
    matched_codes = []
    for airport in airports:
        tokens = [airport['code'].lower(), airport['city'].lower(), airport['name'].lower()]
        if any(token in lowered for token in tokens):
            matched_codes.append(airport['code'])
    return matched_codes





def collect_chatbot_flight_context(message):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        # ১. এয়ারপোর্ট লিস্ট লোড করা
        cursor.execute('SELECT code, city, name FROM airports ORDER BY city ASC')
        airports = cursor.fetchall()
        matched_codes = extract_airport_codes(message, airports)
        origin_code      = None
        destination_code = None

        # ২. রেগুলার এক্সপ্রেশন দিয়ে রুট খোঁজা
        from_match = re.search(r'from\s+([a-zA-Z\s]+?)(?:\s+to\s+|\s+on\s+|\s+for\s+|\?|$)', message, re.IGNORECASE)
        to_match   = re.search(r'to\s+([a-zA-Z\s]+?)(?:\s+from\s+|\s+on\s+|\s+for\s+|\?|$)', message, re.IGNORECASE)

        if from_match:
            origin_code = next(
                (a['code'] for a in airports if from_match.group(1).strip().lower() in
                 [a['code'].lower(), a['city'].lower(), a['name'].lower()]), None)
        if to_match:
            destination_code = next(
                (a['code'] for a in airports if to_match.group(1).strip().lower() in
                 [a['code'].lower(), a['city'].lower(), a['name'].lower()]), None)

        if not origin_code and len(matched_codes) >= 1:
            destination_code = destination_code or matched_codes[-1]
        if not origin_code and len(matched_codes) >= 2:
            origin_code = matched_codes[0]

        # ৩. ইউজার জুলাই ৫ বা কোনো ফ্লাইট খুঁজছে কি না তা ট্র্যাক করা
        is_july_5_requested = "july 5" in message.lower() or "july 5th" in message.lower() or "5 july" in message.lower()
        is_general_query = any(k in message.lower() for k in ["any flight", "which flight", "anything find", "all flight", "available flight"])

        # ৪. ইউজার যদি 'today' বা 'now' বলে কিন্তু ডাটাবেজে সেই ডেটের ফ্লাইট না থাকে
        if ("today" in message.lower() or "now" in message.lower()) and not (origin_code or destination_code):
            return {
                'origin_code': None, 'destination_code': None, 'flights': [],
                'summary': 'No matching flights found for today in the database.'
            }

        # যদি কোনো নির্দিষ্ট রুট বা জুলাই ৫ বা জেনারেল কুয়েরি না থাকে, তবে ফাঁকা পাঠাবে (যাতে হ্যালো বললে ফ্লাইট না আসে)
        if not origin_code and not destination_code and not is_july_5_requested and not is_general_query:
            return {
                'origin_code': None, 'destination_code': None, 'flights': [],
                'summary': 'No specific route or date requested.'
            }

        # ৫. সর্ٹنگ অর্ডার সেট করা
        order_clause = ('ORDER BY f.price ASC'
                        if any(t in message.lower() for t in ['cheap', 'cheapest', 'lowest', 'best price', 'budget', 'সস্তা'])
                        else 'ORDER BY f.departure_time ASC')

        # ৬. মেইন কুয়েরি তৈরি করা
        params = []
        query = '''
            SELECT f.id, f.flight_number, f.airline, f.origin_code, f.destination_code,
                   f.departure_time, f.arrival_time, f.price,
                   o.city AS origin_city, d.city AS destination_city
            FROM flights f
            JOIN airports o ON f.origin_code = o.code
            JOIN airports d ON f.destination_code = d.code
        '''
        conditions = []
        
        if origin_code:
            conditions.append('f.origin_code = %s')
            params.append(origin_code)
        if destination_code:
            conditions.append('f.destination_code = %s')
            params.append(destination_code)
            
        # ইউজার জুলাই ৫ এর কথা বললে বা জেনারেল খোঁজ করলে ডেট ফিল্টার হবে
        if is_july_5_requested or is_general_query or (not origin_code and not destination_code):
            conditions.append("DATE(f.departure_time) = '2026-07-05'")

        if conditions:
            query += ' WHERE ' + ' AND '.join(conditions)
            
        query += f' {order_clause} LIMIT 5'

        cursor.execute(query, params)
        flights = cursor.fetchall()

        # আংশিক নাম দিয়ে খোঁজার ব্যাকআপ কুয়েরি
        if not flights and destination_code:
            cursor.execute('''
                SELECT f.id, f.flight_number, f.airline, f.origin_code, f.destination_code,
                       f.departure_time, f.arrival_time, f.price,
                       o.city AS origin_city, d.city AS destination_city
                FROM flights f
                JOIN airports o ON f.origin_code = o.code
                JOIN airports d ON f.destination_code = d.code
                WHERE (d.city LIKE %s OR d.name LIKE %s OR d.code = %s) AND DATE(f.departure_time) = '2026-07-05'
                ORDER BY f.price ASC LIMIT 5
            ''', (f'%{destination_code}%', f'%{destination_code}%', destination_code))
            flights = cursor.fetchall()

        if not flights and origin_code:
            cursor.execute('''
                SELECT f.id, f.flight_number, f.airline, f.origin_code, f.destination_code,
                       f.departure_time, f.arrival_time, f.price,
                       o.city AS origin_city, d.city AS destination_city
                FROM flights f
                JOIN airports o ON f.origin_code = o.code
                JOIN airports d ON f.destination_code = d.code
                WHERE (o.city LIKE %s OR o.name LIKE %s OR o.code = %s) AND DATE(f.departure_time) = '2026-07-05'
                ORDER BY f.price ASC LIMIT 5
            ''', (f'%{origin_code}%', f'%{origin_code}%', origin_code))
            flights = cursor.fetchall()

        # ৭. টাইম অবজেক্টগুলোকে সুন্দর স্ট্রিং ফরম্যাটে কনভার্ট করা
        for f in flights:
            if isinstance(f['departure_time'], (date, datetime)):
                f['departure_time'] = f['departure_time'].strftime('%a, %d %b %Y %I:%M %p')
            if isinstance(f['arrival_time'], (date, datetime)):
                f['arrival_time'] = f['arrival_time'].strftime('%a, %d %b %Y %I:%M %p')

        summary_lines = [
            f"{f['flight_number']} | {f['airline']} | {f['origin_city']} ({f['origin_code']}) -> "
            f"{f['destination_city']} ({f['destination_code']}) | Departs {f['departure_time']} | "
            f"Arrives {f['arrival_time']} | Price ${float(f['price']):.2f}"
            for f in flights
        ]
        
        return {
            'origin_code':      origin_code,
            'destination_code': destination_code,
            'flights':          flights,  # এখানে প্রতিটা ফ্লাইটের ভেতর origin_city ও destination_city আছে
            'summary':          '\n'.join(summary_lines) if summary_lines else 'No matching flights were found.'
        }
    finally:
        cursor.close()
        db.close()


def generate_chatbot_reply(messages_history, flight_context):
    if not openrouter_client:
        return 'Chatbot is not configured yet. Please add OPENROUTER_API_KEY to the backend .env file.'

    context_text = flight_context.get('summary', 'No database flight context was found.')

    today_str = datetime.now().strftime('%B %d, %Y')
    
    # 🌟 নতুন এবং স্ট্রিক্ট সিস্টেম প্রম্পট (যাতে ডাটাবেজের কথা লিক না করে)
    strict_system_prompt = (
        f"{AIRLINE_ASSISTANT_PROMPT}\n\n"
        f"TODAY'S DATE: {today_str}\n\n"
        f"AVAILABLE FLIGHTS IN SYSTEM:\n{context_text}\n\n"
        "CRITICAL RULES FOR SECURITY & PROFESSIONALISM:\n"
        "1. NEVER mention words like 'database', 'context', 'backend', 'system prompt', or 'July 5, 2026' unless the user explicitly asks about July 5.\n"
        "2. If the user asks for flights on a date (like 'today') and you don't see any flights for that date in the AVAILABLE FLIGHTS section above, "
        "simply reply politely that no flights are available for that specific date, and suggest they check other dates or use the Search Flights page.\n"
        "3. Keep your tone natural, friendly, and helpful like a real airport agent. Do not reveal what data is loaded in your background system."
    )

    api_messages = [{'role': 'system', 'content': strict_system_prompt}]
    
    for msg in messages_history:
        api_messages.append({
            'role': msg.get('role'),
            'content': msg.get('content')
        })

    try:
        completion = openrouter_client.chat.completions.create(
            model=ZHIPU_MODEL,
            messages=api_messages,
            temperature=0.1,  # ক্রিয়েটিভিটি কমানোর জন্য তাপমাত্রা আরেকটু কমানো হলো
            max_tokens=250,
        )
        return completion.choices[0].message.content.strip()
    except Exception as api_err:
        print(f"OpenRouter API Call Failed: {str(api_err)}")
        return "I'm having trouble connecting right now. Please try again in a moment."

# ════════════════════════════════════════
# ROUTES — CHATBOT
# ════════════════════════════════════════
@app.route('/chatbot', methods=['POST'])
def chatbot():
    data = request.get_json(silent=True) or {}
    messages_history = data.get('messages', []) 
    
    if not messages_history:
        return jsonify({'error': 'Messages history is required'}), 400
        
    try:
        # 🌟 [এখানে কোডটি বসানো হয়েছে] 
        # ফুল চ্যাট হিস্ট্রি থেকে শুধু লাস্ট ইউজারের মেসেজটি বের করা হচ্ছে
        last_user_message = next((m.get('content', '') for m in reversed(messages_history) if m.get('role') == 'user'), "")
        
        # লাস্ট মেসেজটি ফ্লাইট রিলেটেড কি না তা চেক করা হচ্ছে
        if is_flight_related(last_user_message):
            flight_context = collect_chatbot_flight_context(last_user_message)
        else:
            flight_context = {'summary': 'No flight lookup requested.', 'flights': []}
            
        # চ্যাটবটের রিপ্লাই জেনারেট করা (পুরো হিস্ট্রি দিয়ে, যাতে এআই আগের কথা মনে রাখতে পারে)
        reply = generate_chatbot_reply(messages_history, flight_context)
        
        return jsonify({
            'response': reply,
            'matched_flights': flight_context.get('flights', []),
        }), 200
        
    except Exception as err:
        traceback.print_exc()
        return jsonify({'error': f'Chatbot request failed: {str(err)}'}), 500


# ════════════════════════════════════════
# ROUTES — AUTH
# ════════════════════════════════════════
@app.route('/register', methods=['POST'])
def register():
    data   = request.json
    db     = get_db_connection()
    cursor = db.cursor()
    try:
        otp    = str(random.randint(100000, 999999))
        expiry = datetime.now() + timedelta(minutes=10)
        cursor.execute(
            "INSERT INTO users (username, password, email, otp_code, otp_expiry, is_verified) "
            "VALUES (%s, %s, %s, %s, %s, %s)",
            (data['username'], data['password'], data['email'], otp, expiry, False)
        )
        db.commit()
        try:
            msg      = Message("Verify Your Email - OTP", recipients=[data['email']])
            msg.html = render_template('verification.html', otp=otp)
            mail.send(msg)
        except Exception as e:
            print("[ERROR] Failed to send OTP email:", str(e))
        return jsonify({"message": "Registration successful. Please check your email for the OTP."}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        db.close()


@app.route('/login', methods=['POST'])
def login():
    data   = request.json
    db     = get_db_connection()
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT id, username, role, is_verified FROM users WHERE username=%s AND password=%s",
        (data.get('username'), data.get('password'))
    )
    user = cursor.fetchone()
    cursor.close()
    db.close()
    if user:
        if not user.get('is_verified') and user.get('role') != 'admin':
            return jsonify({"error": "Please verify your email before logging in."}), 403
        return jsonify({"message": "Login successful", "user": user}), 200
    return jsonify({"error": "Invalid credentials"}), 401


@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    data   = request.json
    email  = data.get('email')
    otp    = data.get('otp')
    db     = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, otp_code, otp_expiry FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404
        if user['otp_code'] != otp:
            return jsonify({"error": "Invalid OTP code"}), 400
        if user['otp_expiry'] and datetime.now() > user['otp_expiry']:
            return jsonify({"error": "OTP has expired. Please resend."}), 400
        cursor.execute(
            "UPDATE users SET is_verified = TRUE, otp_code = NULL, otp_expiry = NULL WHERE email = %s",
            (email,)
        )
        db.commit()
        return jsonify({"message": "Email verified successfully"}), 200
    finally:
        cursor.close()
        db.close()


@app.route('/send-otp', methods=['POST'])
def send_otp():
    data   = request.json
    email  = data.get('email')
    db     = get_db_connection()
    cursor = db.cursor()
    try:
        otp    = str(random.randint(100000, 999999))
        expiry = datetime.now() + timedelta(minutes=10)
        cursor.execute("UPDATE users SET otp_code=%s, otp_expiry=%s WHERE email=%s", (otp, expiry, email))
        if cursor.rowcount == 0:
            return jsonify({"error": "Email not registered"}), 404
        db.commit()
        try:
            msg      = Message("Your New OTP Code", recipients=[email])
            msg.html = render_template('verification.html', otp=otp)
            mail.send(msg)
            return jsonify({"message": "OTP resent successfully"}), 200
        except Exception as e:
            return jsonify({"error": "Failed to send email. Check SMTP setup."}), 500
    finally:
        cursor.close()
        db.close()


# ════════════════════════════════════════
# ROUTES — FLIGHTS
# ════════════════════════════════════════
@app.route('/flights', methods=['GET'])
def get_all_flights():
    db     = get_db_connection()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT f.*, o.city as origin_city, d.city as dest_city
        FROM flights f
        JOIN airports o ON f.origin_code = o.code
        JOIN airports d ON f.destination_code = d.code
        ORDER BY f.departure_time DESC
    """)
    flights = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(flights), 200


@app.route('/flights', methods=['POST'])
def add_flight():
    data   = request.json
    db     = get_db_connection()
    cursor = db.cursor()
    try:
        cursor.execute("""
            INSERT INTO flights (flight_number, airline, origin_code, destination_code,
                                 departure_time, arrival_time, price)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (data['flight_number'], data['airline'], data['origin_code'],
              data['destination_code'], data['departure_time'], data['arrival_time'], data['price']))
        db.commit()
        return jsonify({"message": "Flight added successfully"}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        db.close()


# ════════════════════════════════════════
# ROUTES — SEAT UPDATE (CHECK-IN FLOW)
# ════════════════════════════════════════
# এই route টা existing booking এর seat_number সেট/আপডেট করে।
# Check-in এর সময় ইউজার সিট বাছলে এটা কল হবে।
# একই flight এ একই সিট দুজন নিতে না পারে, তার জন্য validation যুক্ত আছে।

@app.route('/bookings/<int:booking_id>/seat', methods=['PUT'])
def update_booking_seat(booking_id):
    data        = request.json
    seat_number = data.get('seat_number')

    if not seat_number:
        return jsonify({"error": "seat_number is required"}), 400

    db     = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        try:
            cursor.execute("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT FALSE")
            db.commit()
        except mysql.connector.Error:
            pass

        cursor.execute("SELECT flight_id FROM bookings WHERE id = %s", (booking_id,))
        booking = cursor.fetchone()
        if not booking:
            return jsonify({"error": "Booking not found"}), 404

        flight_id = booking['flight_id']

        cursor.execute(
            "SELECT id FROM bookings WHERE flight_id = %s AND seat_number = %s "
            "AND status = 'confirmed' AND id != %s",
            (flight_id, seat_number, booking_id)
        )
        if cursor.fetchone():
            return jsonify({"error": f"Seat {seat_number} is already taken on this flight."}), 409

        cursor.execute(
            "UPDATE bookings SET seat_number = %s, checked_in = TRUE WHERE id = %s",
            (seat_number, booking_id)
        )
        db.commit()

        return jsonify({"message": "Seat updated successfully", "seat_number": seat_number, "checked_in": True}), 200

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        db.close()


@app.route('/flights/<int:flight_id>', methods=['DELETE'])
def delete_flight(flight_id):
    db     = get_db_connection()
    cursor = db.cursor()
    try:
        cursor.execute("DELETE FROM bookings WHERE flight_id=%s", (flight_id,))
        cursor.execute("DELETE FROM flights WHERE id=%s", (flight_id,))
        db.commit()
        return jsonify({"message": "Flight deleted successfully"}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        db.close()


@app.route('/search', methods=['GET'])
def search_flights():
    origin         = request.args.get('origin')
    destination    = request.args.get('dest')
    start_date_raw = request.args.get('start_date')
    end_date_raw   = request.args.get('end_date')

    db     = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        dt           = datetime.strptime(start_date_raw, '%Y-%m-%d')
        year         = dt.strftime('%Y')
        month_padded = dt.strftime('%m')
        month_single = str(int(month_padded))
        day_padded   = dt.strftime('%d')
        day_single   = str(int(day_padded))
        fmt1         = f"{year}-{month_padded}-{day_padded}%"
        fmt2         = f"{month_single}/{day_single}/{year}%"

        if (end_date_raw and end_date_raw.strip() not in ['', 'undefined', 'null']):
            date_condition_direct     = "DATE(f.departure_time) BETWEEN %s AND %s"
            date_condition_connecting = "DATE(f1.departure_time) BETWEEN %s AND %s"
            params_direct             = (origin, destination, start_date_raw, end_date_raw)
            params_connecting         = (origin, destination, start_date_raw, end_date_raw)
        else:
            date_condition_direct     = "(f.departure_time LIKE %s OR f.departure_time LIKE %s OR DATE(f.departure_time) = %s)"
            date_condition_connecting = "(f1.departure_time LIKE %s OR f1.departure_time LIKE %s OR DATE(f1.departure_time) = %s)"
            params_direct             = (origin, destination, fmt1, fmt2, start_date_raw)
            params_connecting         = (origin, destination, fmt1, fmt2, start_date_raw)

        query_direct = f"""
            SELECT f.*, o.city as origin_city, d.city as dest_city
            FROM flights f
            JOIN airports o ON f.origin_code = o.code
            JOIN airports d ON f.destination_code = d.code
            WHERE f.origin_code = %s AND f.destination_code = %s AND {date_condition_direct}
        """
        query_connecting = f"""
            SELECT
                f1.id as leg1_id, f1.flight_number as leg1_flight, f1.airline as leg1_airline,
                f1.departure_time as leg1_dep, f1.arrival_time as leg1_arr, f1.price as leg1_price,
                f2.id as leg2_id, f2.flight_number as leg2_flight, f2.airline as leg2_airline,
                f2.departure_time as leg2_dep, f2.arrival_time as leg2_arr, f2.price as leg2_price,
                f1.destination_code as layover_code,
                (f1.price + f2.price) as total_price
            FROM flights f1
            JOIN flights f2 ON f1.destination_code = f2.origin_code
            WHERE f1.origin_code = %s AND f2.destination_code = %s AND {date_condition_connecting}
            AND f2.departure_time > DATE_ADD(f1.arrival_time, INTERVAL 45 MINUTE)
            AND f2.departure_time < DATE_ADD(f1.arrival_time, INTERVAL 8 HOUR)
        """
        cursor.execute(query_direct, params_direct)
        direct_flights = cursor.fetchall()

        cursor.execute(query_connecting, params_connecting)
        connecting_flights = cursor.fetchall()

    except Exception as e:
        print("Error during flight search:", str(e))
        cursor.close()
        db.close()
        return jsonify({"error": str(e), "direct": [], "connecting": []}), 500

    cursor.close()
    db.close()
    return jsonify({"direct": direct_flights, "connecting": connecting_flights}), 200


# ════════════════════════════════════════
# ROUTES — AVAILABLE DATES
# ════════════════════════════════════════
@app.route('/available-dates', methods=['GET'])
def get_available_dates():
    origin = request.args.get('origin', '').strip()
    dest   = request.args.get('dest',   '').strip()
    month  = request.args.get('month',  '').strip()

    db     = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        query = """
            SELECT DATE(departure_time) AS flight_date, COUNT(*) AS cnt
            FROM flights
            WHERE origin_code = %s AND destination_code = %s
            AND DATE_FORMAT(departure_time, '%Y-%m') = %s
            GROUP BY DATE(departure_time)
        """
        cursor.execute(query, (origin, dest, month))
        direct_rows = cursor.fetchall()

        query2 = """
            SELECT DATE(f1.departure_time) AS flight_date, COUNT(*) AS cnt
            FROM flights f1
            JOIN flights f2 ON f1.destination_code = f2.origin_code
            WHERE f1.origin_code = %s AND f2.destination_code = %s
            AND DATE_FORMAT(f1.departure_time, '%Y-%m') = %s
            AND f2.departure_time > DATE_ADD(f1.arrival_time, INTERVAL 45 MINUTE)
            AND f2.departure_time < DATE_ADD(f1.arrival_time, INTERVAL 8 HOUR)
            GROUP BY DATE(f1.departure_time)
        """
        cursor.execute(query2, (origin, dest, month))
        conn_rows = cursor.fetchall()

        result = {}
        for row in direct_rows + conn_rows:
            date_str = str(row['flight_date'])
            result[date_str] = {'count': row['cnt']}

        return jsonify(result), 200
    except Exception as e:
        print(f"Error in /available-dates: {e}")
        return jsonify({}), 500
    finally:
        cursor.close()
        db.close()


# ════════════════════════════════════════
# ROUTES — SEATS
# ════════════════════════════════════════
@app.route('/flights/<int:flight_id>/seats', methods=['GET'])
def get_booked_seats(flight_id):
    db     = get_db_connection()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT seat_number FROM bookings WHERE flight_id=%s", (flight_id,))
    seats = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify([s['seat_number'] for s in seats if s['seat_number']]), 200


# ════════════════════════════════════════
# ROUTES — BOOKING
# ════════════════════════════════════════
# ════════════════════════════════════════
# এই পুরো ফাংশনটা দিয়ে আপনার backend ফাইলের existing
# book_flight() ফাংশনটা (POST /book route) REPLACE করুন
# ════════════════════════════════════════

@app.route('/book', methods=['POST'])
def book_flight():
    data   = request.json
    db     = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        flight_id   = data.get('flight_id')
        seat_number = data.get('seat_number')
        seat_class  = data.get('seat_class') or data.get('flight_class') or data.get('class') or 'Economy'

        # seat_class কলাম না থাকলে তৈরি করে নেওয়া (auto-migrate)
        try:
            cursor.execute("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS seat_class VARCHAR(20) DEFAULT 'Economy'")
            db.commit()
        except mysql.connector.Error:
            pass

        cursor.execute(
            "SELECT id FROM bookings WHERE flight_id = %s AND seat_number = %s AND status = 'confirmed'",
            (flight_id, seat_number)
        )
        if cursor.fetchone():
            return jsonify({"error": f"Seat {seat_number} is already booked on this flight."}), 409

        user_id_to_save = data.get('user_id')
        if not user_id_to_save or str(user_id_to_save).strip().lower() in ['undefined', 'null', '']:
            passenger_email = data.get('email')
            if passenger_email:
                cursor.execute("SELECT id FROM users WHERE email = %s", (passenger_email,))
                user_rec = cursor.fetchone()
                user_id_to_save = user_rec['id'] if user_rec else 8
            else:
                user_id_to_save = 8

        cursor.execute(
            "INSERT INTO bookings (user_id, flight_id, seat_number, status, seat_class) VALUES (%s, %s, %s, 'confirmed', %s)",
            (user_id_to_save, flight_id, seat_number, seat_class)
        )
        booking_id = cursor.lastrowid
        db.commit()

        cursor.execute("""
            SELECT f.airline, f.flight_number, f.departure_time, f.price,
                   o.city as origin, d.city as dest
            FROM flights f
            JOIN airports o ON f.origin_code = o.code
            JOIN airports d ON f.destination_code = d.code
            WHERE f.id = %s
        """, (flight_id,))
        info = cursor.fetchone()

        if info and data.get('email') and mail:
            try:
                full_name = f"{data.get('first_name', 'Passenger')} {data.get('last_name', '')}".strip()
                msg      = Message("Booking Confirmation", recipients=[data['email']])
                msg.html = render_template('booking_confirmation.html',
                    passenger_name=full_name, airline=info['airline'],
                    flight_number=info['flight_number'], origin=info['origin'],
                    dest=info['dest'], departure_time=info['departure_time'],
                    seat_number=seat_number, price=info['price'])
                mail.send(msg)
            except Exception as e:
                print("Confirmation email failed:", str(e))

        return jsonify({"message": "Booking successful", "booking_id": booking_id}), 201

    except mysql.connector.Error as err:
        print(f"SQL Error in /book: {err}")
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        db.close()

        
@app.route('/bookings', methods=['GET'])
def get_user_bookings():
    user_id = request.args.get('user_id')
    if not user_id or str(user_id).strip().lower() in ['undefined', 'null', '']:
        return jsonify([]), 200

    db     = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        try:
            cursor.execute("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT FALSE")
            db.commit()
        except mysql.connector.Error:
            pass

        cursor.execute("""
            SELECT b.id as b_id, b.seat_number, b.status, b.user_id as booking_user_id,
                   b.checked_in, b.flight_id, b.seat_class,
                   f.airline, f.flight_number, f.price, f.departure_time,
                   o.city as origin_city, d.city as dest_city
            FROM bookings b
            LEFT JOIN flights f ON b.flight_id = f.id
            LEFT JOIN airports o ON f.origin_code = o.code
            LEFT JOIN airports d ON f.destination_code = d.code
            WHERE b.user_id = %s
            ORDER BY b.id DESC
        """, (user_id,))
        all_bookings = cursor.fetchall()

        bookings = []
        for booking in all_bookings:
            booking['booking_id']  = booking['b_id']
            booking['id']          = booking['b_id']
            booking['seat_number'] = booking.get('seat_number') or 'N/A'
            booking['status']      = (booking['status'].upper() if booking['status'] else 'CONFIRMED')
            booking['origin']      = booking['origin_city']
            booking['destination'] = booking['dest_city']
            booking['checked_in']  = bool(booking.get('checked_in'))
            bookings.append(booking)
        return jsonify(bookings), 200

    except Exception as e:
        print(f"Error in get_user_bookings: {e}")
        return jsonify([]), 200
    finally:
        cursor.close()
        db.close()

@app.route('/bookings/<int:booking_id>/cancel', methods=['PATCH'])
def cancel_booking(booking_id):
    db     = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        # booking আছে কি না চেক করা
        cursor.execute("SELECT id, status FROM bookings WHERE id = %s", (booking_id,))
        booking = cursor.fetchone()
        if not booking:
            return jsonify({"error": "Booking not found"}), 404
        if booking['status'] == 'cancelled':
            return jsonify({"error": "Booking is already cancelled"}), 400

        cursor.execute(
            "UPDATE bookings SET status = 'cancelled' WHERE id = %s",
            (booking_id,)
        )
        db.commit()
        return jsonify({"message": "Booking cancelled successfully"}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        db.close()

@app.route('/bookings/checkin', methods=['POST'])
def mark_bookings_checked_in():
    data = request.json
    booking_ids = data.get('booking_ids', [])

    if not booking_ids:
        return jsonify({"error": "booking_ids is required"}), 400

    db     = get_db_connection()
    cursor = db.cursor()
    try:
        try:
            cursor.execute("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT FALSE")
            db.commit()
        except mysql.connector.Error:
            pass

        format_strings = ','.join(['%s'] * len(booking_ids))
        cursor.execute(
            f"UPDATE bookings SET checked_in = TRUE WHERE id IN ({format_strings})",
            tuple(booking_ids)
        )
        db.commit()
        return jsonify({"message": "Checked in successfully"}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        db.close()

@app.route('/bookings/<int:booking_id>/details', methods=['GET'])
def get_booking_details(booking_id):
    db     = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT b.id as booking_id, b.seat_number, b.status,
                   f.airline, f.flight_number, f.price, f.departure_time,
                   o.city as origin_city, d.city as dest_city,
                   f.departure_time as flight_status
            FROM bookings b
            LEFT JOIN flights f ON b.flight_id = f.id
            LEFT JOIN airports o ON f.origin_code = o.code
            LEFT JOIN airports d ON f.destination_code = d.code
            WHERE b.id = %s
        """, (booking_id,))
        booking = cursor.fetchone()
        if not booking:
            return jsonify({"error": "Booking not found"}), 404
        return jsonify(booking), 200
    finally:
        cursor.close()
        db.close()

# ════════════════════════════════════════
# ROUTES — ADMIN
# ════════════════════════════════════════
@app.route('/admin/stats', methods=['GET'])
def get_admin_stats():
    db     = get_db_connection()
    cursor = db.cursor(dictionary=True)
    stats  = {}
    try:
        cursor.execute("SELECT COUNT(*) as count FROM flights")
        stats['total_flights'] = cursor.fetchone()['count']
        cursor.execute("SELECT COUNT(*) as count FROM users WHERE role='user'")
        stats['total_users'] = cursor.fetchone()['count']
        cursor.execute("SELECT COUNT(*) as count FROM bookings")
        stats['total_bookings'] = cursor.fetchone()['count']
        cursor.execute("SELECT SUM(f.price) as revenue FROM bookings b JOIN flights f ON b.flight_id = f.id WHERE b.status='confirmed'")
        rev = cursor.fetchone()['revenue']
        stats['total_revenue'] = float(rev) if rev else 0
        return jsonify(stats), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        db.close()


@app.route('/admin/users', methods=['GET'])
def get_all_users():
    db     = get_db_connection()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id, username, role FROM users WHERE role='user'")
    users = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(users), 200


@app.route('/admin/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    db     = get_db_connection()
    cursor = db.cursor()
    try:
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        db.commit()
        return jsonify({"message": "User deleted successfully"}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        db.close()


@app.route('/admin/bookings', methods=['GET'])
def get_admin_bookings():
    db     = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT b.id as booking_id, b.seat_number, b.status,
                   u.username as passenger_name,
                   f.airline, f.flight_number, f.price
            FROM bookings b
            LEFT JOIN users u ON b.user_id = u.id
            LEFT JOIN flights f ON b.flight_id = f.id
            ORDER BY b.id DESC
        """)
        return jsonify(cursor.fetchall()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        db.close()


@app.route('/admin/bookings/<int:booking_id>', methods=['PUT'])
def update_booking_status(booking_id):
    db     = get_db_connection()
    cursor = db.cursor()
    try:
        cursor.execute("DELETE FROM bookings WHERE id = %s", (booking_id,))
        db.commit()
        return jsonify({"message": "Booking deleted successfully"}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        db.close()


# ════════════════════════════════════════
# ROUTES — PROFILE
# ════════════════════════════════════════
@app.route('/profile/<int:user_id>', methods=['GET'])
def get_profile(user_id):
    db     = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT id, username, email, role, seat_preference, meal_preference, profile_picture,
                   first_name, last_name, dob, gender, phone, passport_number, passport_expiry, nationality
            FROM users WHERE id = %s
        """, (user_id,))
        user = cursor.fetchone()
        if user:
            return jsonify(user), 200
        return jsonify({'message': 'User not found'}), 404
    except mysql.connector.Error as err:
        if err.errno == 1054:
            for col_sql in [
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS seat_preference VARCHAR(50) DEFAULT 'Any'",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS meal_preference VARCHAR(50) DEFAULT 'Any'",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture LONGTEXT",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) DEFAULT ''",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) DEFAULT ''",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS dob DATE NULL",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20) DEFAULT ''",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(30) DEFAULT ''",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS passport_number VARCHAR(50) DEFAULT ''",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS passport_expiry DATE NULL",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS nationality VARCHAR(100) DEFAULT ''",
            ]:
                try:
                    cursor.execute(col_sql)
                except:
                    pass
            db.commit()
            cursor.execute("""
                SELECT id, username, email, role, seat_preference, meal_preference, profile_picture,
                       first_name, last_name, dob, gender, phone, passport_number, passport_expiry, nationality
                FROM users WHERE id = %s
            """, (user_id,))
            user = cursor.fetchone()
            if user:
                return jsonify(user), 200
            return jsonify({'message': 'User not found'}), 404
        return jsonify({'error': str(err)}), 500
    finally:
        cursor.close()
        db.close()


@app.route('/profile/<int:user_id>', methods=['PUT'])
def update_profile(user_id):
    data   = request.json
    db     = get_db_connection()
    cursor = db.cursor()
    try:
        if data.get('password'):
            cursor.execute("""
                UPDATE users SET password=%s, seat_preference=%s, meal_preference=%s, profile_picture=%s,
                first_name=%s, last_name=%s, dob=%s, gender=%s, phone=%s,
                passport_number=%s, passport_expiry=%s, nationality=%s WHERE id=%s
            """, (data['password'], data.get('seat_preference','Any'), data.get('meal_preference','Any'),
                  data.get('profile_picture'), data.get('first_name',''), data.get('last_name',''),
                  data.get('dob') or None, data.get('gender',''), data.get('phone',''),
                  data.get('passport_number',''), data.get('passport_expiry') or None,
                  data.get('nationality',''), user_id))
        else:
            cursor.execute("""
                UPDATE users SET seat_preference=%s, meal_preference=%s, profile_picture=%s,
                first_name=%s, last_name=%s, dob=%s, gender=%s, phone=%s,
                passport_number=%s, passport_expiry=%s, nationality=%s WHERE id=%s
            """, (data.get('seat_preference','Any'), data.get('meal_preference','Any'),
                  data.get('profile_picture'), data.get('first_name',''), data.get('last_name',''),
                  data.get('dob') or None, data.get('gender',''), data.get('phone',''),
                  data.get('passport_number',''), data.get('passport_expiry') or None,
                  data.get('nationality',''), user_id))
        db.commit()
        return jsonify({'message': 'Profile updated successfully'}), 200
    except Exception as err:
        return jsonify({'error': str(err)}), 500
    finally:
        cursor.close()
        db.close()


# ════════════════════════════════════════
# ROUTES — TEST MAIL
# ════════════════════════════════════════
@app.route('/test-mail', methods=['GET'])
def test_mail():
    target = request.args.get('email', app.config['MAIL_DEFAULT_SENDER'])
    try:
        msg      = Message("Test SMTP Configuration", recipients=[target])
        msg.body = "Flask-Mail and Gmail App Password are configured correctly!"
        mail.send(msg)
        return jsonify({"message": f"Test email sent to {target}!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ════════════════════════════════════════
# SCHEDULER — FLIGHT REMINDERS
# ════════════════════════════════════════
def send_flight_reminders():
    with app.app_context():
        db     = get_db_connection()
        cursor = db.cursor(dictionary=True)
        try:
            cursor.execute("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE")
            db.commit()
            cursor.execute("""
                SELECT b.id, b.seat_number, u.email, u.username,
                       f.airline, f.flight_number, f.departure_time,
                       o.city as origin, d.city as dest
                FROM bookings b
                JOIN users u ON b.user_id = u.id
                JOIN flights f ON b.flight_id = f.id
                JOIN airports o ON f.origin_code = o.code
                JOIN airports d ON f.destination_code = d.code
                WHERE b.status = 'confirmed' AND b.reminder_sent = FALSE
                  AND f.departure_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 24 HOUR)
            """)
            for r in cursor.fetchall():
                try:
                    if r['email'] and mail:
                        msg      = Message(f"Reminder: Upcoming Flight {r['flight_number']}", recipients=[r['email']])
                        msg.html = render_template('reminder.html',
                            passenger_name=r['username'], airline=r['airline'],
                            flight_number=r['flight_number'], origin=r['origin'],
                            dest=r['dest'], departure_time=r['departure_time'],
                            seat_number=r['seat_number'])
                        mail.send(msg)
                    cursor.execute("UPDATE bookings SET reminder_sent = TRUE WHERE id = %s", (r['id'],))
                    db.commit()
                except Exception as e:
                    print("Scheduler mail error:", e)
        except Exception as e:
            print("Reminder scheduler error:", e)
        finally:
            cursor.close()
            db.close()


# ════════════════════════════════════════
# STARTUP
# ════════════════════════════════════════
if not app.debug or os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
    try:
        scheduler = BackgroundScheduler()
        scheduler.add_job(func=send_flight_reminders, trigger="interval", minutes=30)
        scheduler.start()
    except Exception as e:
        print("Scheduler setup error:", e)


# ========================================
# ROUTES — BEST TIME ANALYSIS (AI POWERED)
# ========================================
@app.route('/best-time', methods=['POST'])
def get_best_time_analysis():
    data = request.get_json(silent=True) or {}
    user_route = data.get('route', '').strip()
    
    if not user_route:
        return jsonify({"error": "Route or location is required"}), 400

    # ওপেনএআই বা জিপু ক্লায়েন্ট কনফিগার করা আছে কি না চেক করা
    if not openrouter_client:
        # ক্লায়েন্ট না থাকলে একটি ব্যাকআপ ডিফল্ট রেসপন্স দেবে
        return jsonify({
            "bestMonth": "October",
            "savingPercent": "20%",
            "advice": f"AI is not configured. General analysis for '{user_route}' suggests booking 4 weeks in advance."
        }), 200

    # এআই-কে নির্দিষ্ট ফরম্যাটে ডেটা দেওয়ার জন্য প্রম্পট
    system_prompt = (
        "You are a travel data analyzer. Analyze the flight route or location provided by the user. "
        "Determine the best month to visit/fly there for saving money based on real-world travel trends. "
        "You MUST respond ONLY with a raw JSON object. Do not include markdown blocks like ```json or any extra text. "
        "The JSON object must have exactly these three keys:\n"
        "1. 'bestMonth': The name of the best month (e.g., 'October', 'March').\n"
        "2. 'savingPercent': Estimated saving percentage string (e.g., '25%', '18%').\n"
        "3. 'advice': A short, helpful advice string (max 2 sentences) written in English, explaining why that month is best and booking tips.\n"
    )

    try:
        # AI মডেলকে কল করা (আপনার প্রজেক্টের ZHIPU_MODEL বা glm-4-flash ব্যবহার করে)
        completion = openrouter_client.chat.completions.create(
            model=ZHIPU_MODEL,
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': f"Analyze this route/location: {user_route}"}
            ],
            temperature=0.3,
            max_tokens=200
        )
        
        ai_response_text = completion.choices[0].message.content.strip()
        
        # এআই অনেক সময় ভুল করে ```json ... ``` কোড ব্লক দিতে পারে, তা পরিষ্কার করার সেফটি লজিক
        if ai_response_text.startswith("```"):
            ai_response_text = re.sub(r'^```[a-zA-Z]*\n|```$', '', ai_response_text, flags=re.MULTILINE).strip()

        # এআই-এর টেক্সট রেসপন্সকে পাইথন ডিকশনারি/জেসনে কনভার্ট করা
        import json
        clean_json_data = json.loads(ai_response_text)
        
        return jsonify(clean_json_data), 200

    except Exception as e:
        print(f"AI Best-Time Analysis Error: {str(e)}")
        # কোনো কারণে এআই ফেইল করলে যাতে অ্যাপ ক্র্যাশ না করে, তার জন্য একটি ব্যাকআপ ডাইনামিক রেসপন্স
        return jsonify({
            "bestMonth": "September",
            "savingPercent": "15%",
            "advice": f"Analysing trends for '{user_route}'. Mid-week flights generally offer up to 15% savings during off-peak periods."
        }), 200

# ========================================
# ROUTES — EXPLORE PLACES (AI POWERED)  
# ========================================

@app.route('/explore-places', methods=['POST'])
def explore_places():
    data = request.get_json(silent=True) or {}
    budget = data.get('budget', '').strip()
    origin = data.get('origin', '').strip()
    days   = data.get('days', '7')

    if not budget or not origin:
        return jsonify({"error": "Budget and origin are required"}), 400

    prompt = f"""You are an expert travel cost analyst.
The traveler is departing FROM: "{origin}"
Total budget: "{budget}" (covers flight + hotel + food + activities)
Trip duration: {days} days

Suggest exactly 3 destinations realistic for this budget FROM this origin.
Consider approximate round-trip flight cost from "{origin}" to each destination.

Return ONLY a valid JSON array, no markdown:
[
  {{
    "destination": "City, Country",
    "totalEstimate": "Approx $X",
    "flightCost": "~$X",
    "hotelCost": "~$X",
    "foodActivities": "~$X",
    "highlight": "One compelling reason to visit"
  }}
]"""

    try:
        res = openrouter_client.chat.completions.create(
            model=ZHIPU_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.8
        )
        raw = res.choices[0].message.content.strip()
        print(f"[AI RAW]: {raw}")

        clean = re.sub(r'```(?:json)?', '', raw).strip()
        match = re.search(r'\[\s*\{.*?\}\s*\]', clean, re.DOTALL)
        if not match:
            raise ValueError(f"No JSON found: {raw[:200]}")

        places = json.loads(match.group(0))
        return jsonify(places), 200

    except Exception as e:
        print(f"[ERROR] {type(e).__name__}: {e}")
        return jsonify([
            {"destination": "Bangkok, Thailand", "totalEstimate": "Approx $800",
             "flightCost": "~$350", "hotelCost": "~$280", "foodActivities": "~$170",
             "highlight": "Vibrant street food, temples, and very affordable from South Asia."},
            {"destination": "Kuala Lumpur, Malaysia", "totalEstimate": "Approx $700",
             "flightCost": "~$300", "hotelCost": "~$240", "foodActivities": "~$160",
             "highlight": "Modern skyline, multicultural food scene, budget-friendly flights."},
            {"destination": "Colombo, Sri Lanka", "totalEstimate": "Approx $500",
             "flightCost": "~$180", "hotelCost": "~$200", "foodActivities": "~$120",
             "highlight": "Beautiful beaches, colonial history, very close and affordable."},
        ]), 200

# ════════════════════════════════════════
# 🌟 ROUTES — MY TRIPS (একদম সঠিক ও ম্যাপড লজিক)
# ════════════════════════════════════════

@app.route('/trips', methods=['GET'])
def get_trips():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id required"}), 400

    db     = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        today = date.today()
        cursor.execute("SELECT * FROM trips WHERE user_id = %s AND DATE(departure_date) >= %s ORDER BY departure_date ASC", (user_id, today))
        upcoming = cursor.fetchall()

        cursor.execute("SELECT * FROM trips WHERE user_id = %s AND DATE(departure_date) < %s ORDER BY departure_date DESC", (user_id, today))
        past = cursor.fetchall()

        def format_trip(t):
            if t.get('departure_date') and isinstance(t['departure_date'], (date, datetime)):
                t['departure_date'] = t['departure_date'].strftime('%Y-%m-%d')
            if t.get('return_date') and isinstance(t['return_date'], (date, datetime)):
                t['return_date'] = t['return_date'].strftime('%Y-%m-%d')
            t['bookmarked'] = bool(t['bookmarked'])
            return t

        return jsonify({
            "upcoming": [format_trip(t) for t in upcoming],
            "past":     [format_trip(t) for t in past]
        }), 200
    except Exception as e:
        return jsonify({"upcoming": [], "past": []}), 200
    finally:
        cursor.close()
        db.close()


@app.route('/trips', methods=['POST'])
def save_trip():
    data = request.get_json(silent=True) or {}
    print(f"[DEBUG]: Received payload from frontend: {data}")

    # 🌟 ফ্রন্টএন্ড থেকে camelCase বা snake_case যাই আসুক, তা সঠিকভাবে রিসিভ করার সুপার গার্ড লজিক:
    payload = {
        'user_id': data.get('user_id') or data.get('userId'),
        'origin': data.get('origin') or data.get('from'),
        'destination': data.get('destination') or data.get('to') or data.get('dest'),
        'flight_number': data.get('flight_number') or data.get('flightNumber') or data.get('flightNo'),
        'departure_date': data.get('departure_date') or data.get('departureDate'),
        'total_cost': data.get('total_cost') or data.get('totalCost') or data.get('price')
    }

    # ফিল্ডগুলো খালি কি না তা চেক করা
    for field, val in payload.items():
        if val in [None, '', 'null', 'undefined']:
            return jsonify({"error": f"Required field '{field}' is missing"}), 400

    db     = get_db_connection()
    cursor = db.cursor()
    try:
        query = """
            INSERT INTO trips 
            (user_id, origin, destination, flight_number, airline,
             seat_class, travelers, departure_date, return_date,
             total_cost, currency, status, bookmarked)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        raw_return = data.get('return_date') or data.get('returnDate')
        return_date = raw_return if raw_return and raw_return not in ['null', 'undefined', ''] else None

        params = (
            int(payload['user_id']),
            payload['origin'],
            payload['destination'],
            payload['flight_number'],
            data.get('airline') or 'SkyOrbit Airline',
            data.get('seat_class') or data.get('seatClass') or 'Economy',
            int(data.get('travelers') or 1),
            payload['departure_date'],
            return_date,
            float(payload['total_cost']),
            data.get('currency', 'USD'),
            'upcoming',
            0
        )
        cursor.execute(query, params)
        db.commit()
        return jsonify({"message": "Trip saved successfully", "id": cursor.lastrowid}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        db.close()


@app.route('/trips/<int:trip_id>', methods=['DELETE'])
def delete_trip(trip_id):
    user_id = request.args.get('user_id')
    db     = get_db_connection()
    cursor = db.cursor()
    try:
        cursor.execute("DELETE FROM trips WHERE id = %s AND user_id = %s", (trip_id, user_id))
        db.commit()
        return jsonify({"message": "Trip deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        db.close()


@app.route('/trips/<int:trip_id>/bookmark', methods=['PATCH'])
def toggle_bookmark(trip_id):
    user_id = request.args.get('user_id')
    db     = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT bookmarked FROM trips WHERE id = %s AND user_id = %s", (trip_id, user_id))
        trip = cursor.fetchone()
        if not trip: return jsonify({"error": "Trip not found"}), 404
        new_val = 0 if trip['bookmarked'] else 1
        cursor.execute("UPDATE trips SET bookmarked = %s WHERE id = %s", (new_val, trip_id))
        db.commit()
        return jsonify({"bookmarked": bool(new_val)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        db.close()


@app.route('/trips/summary', methods=['GET'])
def trip_summary():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id required"}), 400
    db     = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        today = date.today()
        cursor.execute("SELECT * FROM trips WHERE user_id = %s", (user_id,))
        trips = cursor.fetchall()
        total_spent, upcoming_cost, bookmarked = 0, 0, 0
        for t in trips:
            cost = float(t['total_cost']) if t.get('total_cost') else 0.0
            dep_date = t['departure_date']
            if isinstance(dep_date, datetime): dep_date = dep_date.date()
            elif isinstance(dep_date, str):
                try: dep_date = datetime.strptime(dep_date, '%Y-%m-%d').date()
                except: dep_date = today
            if dep_date < today: total_spent += cost
            else: upcoming_cost += cost
            if t.get('bookmarked'): bookmarked += 1
        return jsonify({"total_trips": len(trips), "total_spent": round(total_spent, 2), "upcoming_cost": round(upcoming_cost, 2), "bookmarked": bookmarked}), 200
    except Exception as e:
        return jsonify({"total_trips": 0, "total_spent": 0, "upcoming_cost": 0, "bookmarked": 0}), 200
    finally:
        cursor.close()
        db.close()


if __name__ == '__main__':
    app.run(debug=True, port=5000)