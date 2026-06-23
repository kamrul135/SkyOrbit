import mysql.connector
from datetime import datetime, timedelta
import random

db = mysql.connector.connect(
    host='localhost',
    user='root',
    password='',
    database='flight_booking'
)

cursor = db.cursor()

cities = ['JFK', 'LHR', 'CDG', 'DXB', 'HND', 'SYD', 'SIN', 'FRA', 'PEK']
airlines = ['British Airways', 'Emirates', 'Air France', 'Singapore Airlines', 'Lufthansa', 'Delta Airlines', 'Qatar Airways', 'ANA']

cursor.execute("DELETE FROM bookings")
cursor.execute("DELETE FROM flights")
db.commit()

# Ensure PEK is in airports
cursor.execute("INSERT IGNORE INTO airports (code, city, name) VALUES ('PEK', 'Beijing', 'Beijing Capital International')")
db.commit()

base_date = datetime(2026, 6, 1)

for origin in cities:
    for dest in cities:
        if origin != dest:
            # Generate 2 flights per route
            for i in range(2):
                airline = random.choice(airlines)
                flight_number = f"{airline[:2].upper()}{random.randint(100, 999)}"
                
                # Random departure time
                dep_time = base_date + timedelta(hours=random.randint(0, 23), minutes=random.choice([0, 15, 30, 45]))
                duration = timedelta(hours=random.randint(6, 14))
                arr_time = dep_time + duration
                
                price = random.uniform(300.0, 1500.0)
                
                cursor.execute("""
                    INSERT INTO flights (flight_number, airline, origin_code, destination_code, departure_time, arrival_time, price)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (flight_number, airline, origin, dest, dep_time.strftime('%Y-%m-%d %H:%M:%S'), arr_time.strftime('%Y-%m-%d %H:%M:%S'), round(price, 2)))

db.commit()
cursor.close()
db.close()
print("Populated Database with flights.")
