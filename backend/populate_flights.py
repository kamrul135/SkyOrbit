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

airports = ['JFK', 'LHR', 'CDG', 'DXB', 'HND', 'SYD', 'SIN', 'FRA']
airlines_map = {
    ('JFK', 'LHR'): [('British Airways', 'BA'), ('Virgin Atlantic', 'VS'), ('Delta', 'DL'), ('American Airlines', 'AA')],
    ('LHR', 'JFK'): [('British Airways', 'BA'), ('Virgin Atlantic', 'VS'), ('Delta', 'DL'), ('American Airlines', 'AA')],
    ('LHR', 'CDG'): [('British Airways', 'BA'), ('Air France', 'AF')],
    ('CDG', 'LHR'): [('British Airways', 'BA'), ('Air France', 'AF')],
    ('LHR', 'DXB'): [('Emirates', 'EK'), ('British Airways', 'BA')],
    ('DXB', 'LHR'): [('Emirates', 'EK'), ('British Airways', 'BA')],
    ('CDG', 'DXB'): [('Air France', 'AF'), ('Emirates', 'EK')],
    ('DXB', 'CDG'): [('Air France', 'AF'), ('Emirates', 'EK')],
    ('DXB', 'SIN'): [('Emirates', 'EK'), ('Singapore Airlines', 'SQ')],
    ('SIN', 'DXB'): [('Emirates', 'EK'), ('Singapore Airlines', 'SQ')],
    ('SIN', 'SYD'): [('Singapore Airlines', 'SQ'), ('Qantas', 'QF')],
    ('SYD', 'SIN'): [('Singapore Airlines', 'SQ'), ('Qantas', 'QF')],
    ('HND', 'SIN'): [('Japan Airlines', 'JL'), ('All Nippon Airways', 'NH'), ('Singapore Airlines', 'SQ')],
    ('SIN', 'HND'): [('Japan Airlines', 'JL'), ('All Nippon Airways', 'NH'), ('Singapore Airlines', 'SQ')],
    ('FRA', 'JFK'): [('Lufthansa', 'LH'), ('Delta', 'DL')],
    ('JFK', 'FRA'): [('Lufthansa', 'LH'), ('Delta', 'DL')],
    ('FRA', 'CDG'): [('Lufthansa', 'LH'), ('Air France', 'AF')],
    ('CDG', 'FRA'): [('Lufthansa', 'LH'), ('Air France', 'AF')],
    ('FRA', 'DXB'): [('Lufthansa', 'LH'), ('Emirates', 'EK')],
    ('DXB', 'FRA'): [('Lufthansa', 'LH'), ('Emirates', 'EK')],
}

durations = {
    ('JFK', 'LHR'): 7, ('LHR', 'JFK'): 8,
    ('LHR', 'CDG'): 1.5, ('CDG', 'LHR'): 1.5,
    ('LHR', 'DXB'): 7, ('DXB', 'LHR'): 7.5,
    ('CDG', 'DXB'): 6.5, ('DXB', 'CDG'): 7,
    ('DXB', 'SIN'): 7.5, ('SIN', 'DXB'): 7.5,
    ('SIN', 'SYD'): 7.5, ('SYD', 'SIN'): 8,
    ('HND', 'SIN'): 7, ('SIN', 'HND'): 7,
    ('FRA', 'JFK'): 8.5, ('JFK', 'FRA'): 8,
    ('FRA', 'CDG'): 1.5, ('CDG', 'FRA'): 1.5,
    ('FRA', 'DXB'): 6, ('DXB', 'FRA'): 6.5,
}

base_date = datetime(2026, 6, 1)

flights = []
flight_id_counter = 100

for day_offset in range(15):  # 15 days of flights
    current_date = base_date + timedelta(days=day_offset)
    
    for route, carriers in airlines_map.items():
        origin, dest = route
        duration_hours = durations[route]
        
        for carrier_name, carrier_code in carriers:
            # 2 flights per carrier per day per route
            for f_num in range(1, 3):
                dep_hour = random.randint(6, 22)
                dep_minute = random.choice([0, 15, 30, 45])
                
                dep_time = current_date.replace(hour=dep_hour, minute=dep_minute)
                arr_time = dep_time + timedelta(hours=duration_hours)
                
                flight_number = f"{carrier_code}{random.randint(100, 999)}"
                price = round(random.uniform(200.0, 900.0), 2)
                
                flights.append((flight_number, carrier_name, origin, dest, dep_time, arr_time, price))

# Insert
cursor.executemany("""
    INSERT INTO flights (flight_number, airline, origin_code, destination_code, departure_time, arrival_time, price)
    VALUES (%s, %s, %s, %s, %s, %s, %s)
""", flights)

db.commit()
print(f"Inserted {len(flights)} flights successfully across multiple airlines and connections.")
cursor.close()
db.close()
