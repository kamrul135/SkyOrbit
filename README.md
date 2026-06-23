# ✈️ SkyOrbit — Flight Ticket Booking System

A modern, full-stack **flight ticket booking platform** built with **React** on the frontend and **Flask + MySQL** on the backend. SkyOrbit lets users search flights, pick seats, pay, and manage their trips — all wrapped in a dark-themed UI with an AI-powered support chatbot.

---

## 🌟 Features

- 🔍 **Smart Flight Search** — Search by origin, destination, date, and passenger count across 13+ global cities with a custom date picker and recent-search history.
- 💺 **Interactive Seat Selection** — Visual seat map (First / Business / Economy) with real-time availability and color-coded seat states.
- 💳 **Secure Payment Flow** — Multi-step booking: search → seat → passenger info → payment → confirmation.
- 📧 **Email Notifications** — Automated booking confirmation, OTP-based email verification, and 24-hour departure reminders via Flask-Mail.
- 🤖 **AI Chatbot (SkyAssist)** — Built-in support assistant powered by Zhipu AI (`glm-4-flash`) that answers booking, baggage, refund, and policy questions in English or Bengali.
- 👤 **User Accounts** — Register, login, dashboard, profile management, and "My Trips" view.
- 🛫 **Online Check-In** — Dedicated check-in flow with seat re-selection per booking.
- 🗺️ **Map Preview** — Leaflet-powered route map to visualize the journey.
- 📄 **PDF Tickets** — Downloadable booking tickets generated with `jsPDF` + `html2canvas`.
- 🌙 **Dark-Themed UI** — Polished, responsive interface with FontAwesome icons and animated components.
- ⏰ **Background Scheduler** — APScheduler runs departure-reminder jobs automatically.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **React Router DOM** | Client-side routing |
| **Axios** | API requests |
| **Leaflet / React-Leaflet** | Interactive maps |
| **jsPDF + html2canvas** | PDF ticket generation |
| **FontAwesome / React-Icons** | Iconography |
| **Custom CSS** | Dark theme styling |

### Backend
| Technology | Purpose |
|---|---|
| **Python 3 / Flask** | REST API server |
| **Flask-CORS** | Cross-origin support |
| **Flask-Mail** | Transactional email |
| **MySQL Connector** | Database access |
| **APScheduler** | Background reminder jobs |
| **OpenAI SDK (Zhipu AI)** | Chatbot inference |
| **python-dotenv** | Environment configuration |

### Database
- **MySQL** — `flights`, `bookings`, `users`, `airports`, `payments`, etc.

---

## 📁 Project Structure

```
Flight Ticket Booking System/
├── backend/
│   ├── app.py                  # Flask app, routes, scheduler, chatbot logic
│   ├── populate_db.py          # Seed database with airports
│   ├── populate_flights.py     # Seed flight records
│   ├── requirements.txt        # Python dependencies
│   ├── backup.sql              # Database backup
│   ├── config/
│   │   └── config.py           # Backend configuration
│   ├── models/
│   │   └── models.py           # Data models
│   ├── routes/
│   │   └── routes.py           # API route definitions
│   └── templates/              # HTML email templates
│       ├── booking_confirmation.html
│       ├── reminder.html
│       └── verification.html
│
├── frontend/
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   ├── build/                  # Production build output
│   └── src/
│       ├── App.js              # Main router & navbar
│       ├── App.css / index.css
│       ├── components/
│       │   ├── Chatbot.js / .css
│       │   ├── FlightCard.js
│       │   ├── MyTrips.js / .css
│       │   ├── TravelProsSection.js / .css
│       │   └── axiosInstance.js
│       └── pages/
│           ├── SearchFlights.js / .css
│           ├── FlightResults.js / .css
│           ├── BookingInformation.js / .css
│           ├── Payment.js
│           ├── BookingConfirmation.js
│           ├── CheckIn.js
│           ├── Checkinseatselection.js
│           ├── Login.js / Register.js / VerifyEmail.js
│           ├── Dashboard.js / .css
│           ├── Profile.js / .css
│           └── AdminPanel.js / .css
│
├── database/
│   ├── flight.sql              # Schema
│   ├── flight_booking_backup.sql
│   └── backup.sql
│
├── package.json                # Root metadata
├── apply_otp_fixes.py          # OTP patch script
├── update_admin.py             # Admin account patch
├── update_appjs.py             # App.js patch
├── deploy_email.py             # Email deployment helper
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/kamrul135/SkyOrbit.git
cd SkyOrbit
```

### 2. Backend setup
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
```

### 3. Database setup
- Make sure **MySQL** is running.
- Import the schema:
```bash
mysql -u root -p < ../database/flight.sql
```
- (Optional) Seed sample data:
```bash
python populate_db.py
python populate_flights.py
```

### 4. Environment variables
Create a `.env` file inside `backend/`:
```env
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_DEFAULT_SENDER=your_email@gmail.com
ZHIPU_API_KEY=your_zhipu_api_key
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=flight_booking
```

### 5. Run the backend
```bash
python app.py
```
The API will start on **http://localhost:5000**.

### 6. Frontend setup
```bash
cd ../frontend
npm install
npm start
```
The React app will open on **http://localhost:3000**.

### 7. Production build
```bash
npm run build
```

---

## 🔌 API Overview

| Endpoint | Method | Description |
|---|---|---|
| `/api/register` | POST | Register new user, send OTP |
| `/api/verify` | POST | Verify email via OTP |
| `/api/login` | POST | User login |
| `/api/flights/search` | GET | Search available flights |
| `/api/flights/<id>` | GET | Flight details |
| `/api/bookings` | POST/GET | Create / list bookings |
| `/api/bookings/<id>/cancel` | POST | Cancel a booking |
| `/api/seats/<flight_id>` | GET | Seat map for a flight |
| `/api/checkin` | POST | Online check-in |
| `/api/chat` | POST | Chatbot message (SkyAssist) |
| `/api/payment` | POST | Process payment |

> See `backend/app.py` and `backend/routes/routes.py` for the full route catalog.

---

## 🤖 SkyAssist Chatbot

The in-app **SkyAssist** bot (in `frontend/src/components/Chatbot.js`) is powered by **Zhipu AI's `glm-4-flash`** model. It uses a trained system prompt covering:

- Flight search guidance
- Booking flow walkthrough
- OTP & verification help
- Cancellation & refund policy (5–7 business days, 20% fee within 24h)
- Seat-class boundaries (First 1–2, Business 3–5, Economy 6–15)
- Baggage allowances per class

The bot auto-detects Bengali input and replies in Bengali.

---

## 📧 Email Templates

Located in `backend/templates/`:
- **`verification.html`** — OTP code for sign-up
- **`booking_confirmation.html`** — Booking receipt
- **`reminder.html`** — 24-hour departure reminder (auto-sent by APScheduler)

---

## 🧰 Utility Scripts

| Script | Purpose |
|---|---|
| `apply_otp_fixes.py` | Patch OTP-related database columns |
| `update_admin.py` | Promote a user to admin |
| `update_appjs.py` | Apply router updates to `App.js` |
| `deploy_email.py` | Test/verify email deployment |
| `backend/populate_db.py` | Seed airports |
| `backend/populate_flights.py` | Seed flights |

---

## 🚀 Roadmap

- [ ] Multi-city / round-trip search
- [ ] Loyalty & rewards program
- [ ] Admin analytics dashboard
- [ ] Stripe / SSLCommerz payment gateway integration
- [ ] Mobile app (React Native)
- [ ] Real-time flight status via third-party API

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/awesome`)
3. Commit your changes (`git commit -m 'Add awesome feature'`)
4. Push to the branch (`git push origin feature/awesome`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the **ISC License**.

---

## 👨‍💻 Author

**SkyOrbit** — maintained by [kamrul135](https://github.com/kamrul135)
Repository: [github.com/kamrul135/SkyOrbit](https://github.com/kamrul135/SkyOrbit)

---

> ✈️ *"Your journey to the world begins here."*