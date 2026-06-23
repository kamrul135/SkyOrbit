# Flight Ticket Booking System

This project contains a full-stack flight booking platform built using React, Flask, and MySQL.

## Structure
- `/database` - Contains the raw SQL schema and seed data.
- `/backend` - The Python Flask API server.
- `/frontend` - The React application.

## How to Run

### Database Environment
1. Start your local MySQL instance (e.g., using XAMPP, WAMP, or directly via Docker).
2. Execute `/database/flight.sql` in your SQL environment to build the schema and populate start-up data manually.
   _Note: Make sure to update the database credentials (username/password) inside `backend/app.py` based on your local MySQL setup._

### Backend Server
1. Navigate to `/backend` in your terminal.
2. We recommend creating a virtual environment: `python -m venv venv` and activating it.
3. Install dependencies: `pip install -r requirements.txt`.
4. Run the Flask server: `python app.py`.
   _The server runs on http://localhost:5000_

### Frontend Client
1. Navigate to `/frontend` in your terminal.
2. Install npm packages: `npm install`
3. Start the React app: `npm start`
   _The development server will run on http://localhost:3000_

## Features Setup
- **User Authentication**: A sample admin account is pre-created the DB (`admin` / `admin123`).
- **Connecting Flights Logic**: Defined via DB JOIN queries inside `backend/app.py` in the `/search` route.
- **Seat Mapping**: Select an empty block interactively in the UI to confirm standard booking limits.
- **Simulated Payment**: After you choose a seat, checking out acts as a confirmation screen without executing a real payment gateway.