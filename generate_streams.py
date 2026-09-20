import json
import random
import uuid
from datetime import datetime, timedelta

# Import the transcript generator from your existing file
from transcript_generation import generate_transcript

TOTAL_PAYLOADS = 10000
NEGATIVE_SAMPLE_RATIO = 0.15 # 15% of all payloads will be noise/false alarms

def generate_random_location():
    # Approximate bounding box for Pan India
    lat = random.uniform(8.0, 37.0)
    lng = random.uniform(68.0, 97.0)
    return lat, lng

def offset_location(lat, lng, max_offset_meters=500):
    # 1 degree of latitude is approx 111,000 meters
    offset_deg = max_offset_meters / 111000.0
    new_lat = lat + random.uniform(-offset_deg, offset_deg)
    new_lng = lng + random.uniform(-offset_deg, offset_deg)
    return new_lat, new_lng

def offset_timestamp(base_ts, max_offset_mins=15):
    # Adds a random delay between 0 and 15 minutes to simulate staggered reporting
    return base_ts + timedelta(minutes=random.uniform(0, max_offset_mins))

def generate_panicked_transcript():
    # 1. Get the base template string from your existing script
    base_transcript = generate_transcript()
    
    # 2. Add realistic panic, stutters, and urgency
    greetings = ["Oh my god!", "Help!", "Please hurry!", "Ahhh!", "911?"]
    stutters = ["I... I don't know...", "It's, um... really bad.", "Wait, yes,"]
    pleas = ["Send someone now!", "Please hurry!", "They need help!"]
    
    parts = []
    
    # 20% chance for a panicked greeting
    if random.random() > 0.8:
        parts.append(random.choice(greetings))
        
    # 40% chance for stuttering/confusion
    if random.random() > 0.6:
        parts.append(random.choice(stutters))
        
    parts.append(base_transcript)
    
    # 30% chance for a desperate plea at the end
    if random.random() > 0.7:
        parts.append(random.choice(pleas))
        
    return " ".join(parts)

def generate_payload(is_negative=False, base_lat=None, base_lng=None, base_ts=None):
    # Decide time and location based on whether it's a negative (isolated) or positive (clustered) sample
    if is_negative:
        lat, lng = generate_random_location()
        ts = datetime.utcnow() - timedelta(days=random.randint(0, 7), hours=random.randint(0, 23))
    else:
        lat, lng = offset_location(base_lat, base_lng)
        ts = offset_timestamp(base_ts)
        
    stream_type = random.choice(["EMERGENCY_CALL", "CITIZEN_APP", "IOT_SENSOR"])
    
    if stream_type == "EMERGENCY_CALL":
        if is_negative:
            # Negative Samples for Calls (Noise)
            transcripts = [
                "Oh sorry, pocket dial.",
                "No, no, everything is fine, sorry.",
                "[muffled background noise, sounds like rustling]",
                "Yeah, my neighbor is playing music way too loud again.",
                "Can you send someone? A car is blocking my driveway.",
                "Wait, is this 911? I meant to call my wife.",
                "My cat won't come down from the tree!"
            ]
            transcript = random.choice(transcripts)
        else:
            # True Emergency Transcript
            transcript = generate_panicked_transcript()
            
        return {
            "stream_type": "EMERGENCY_CALL",
            "timestamp": ts.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "caller_id": f"+1555{random.randint(1000, 9999)}",
            "location": {
                "lat": round(lat, 6),
                "lng": round(lng, 6),
                "accuracy_meters": random.randint(100, 500)
            },
            "transcript": transcript,
            "ai_keywords": [] # CRITICAL: explicitly empty for the AI to learn
        }
        
    elif stream_type == "CITIZEN_APP":
        if is_negative:
            # Negative Samples for Citizen App
            categories = ["NOISE_COMPLAINT", "PARKING_VIOLATION", "LOST_PET", "GRAFFITI"]
            descriptions = [
                "Loud party next door, it's 2 AM.",
                "Car parked right in front of the fire hydrant.",
                "Found a stray golden retriever.",
                "Someone spray painted the retaining wall."
            ]
            cat = random.choice(categories)
            desc = random.choice(descriptions)
        else:
            # True Citizen App Emergency
            cat = random.choice(["FIRE", "MEDICAL", "CRASH", "HAZMAT"])
            descriptions = [
                f"Severe {cat.lower()} incident observed.",
                "Looks really bad, send help immediately.",
                "Just witnessed this happen.",
                "Uploading photo of the scene."
            ]
            desc = random.choice(descriptions)
            
        return {
            "stream_type": "CITIZEN_APP",
            "timestamp": ts.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "user_id": f"usr_{random.randint(10000, 99999)}",
            "location": {
                "lat": round(lat, 6),
                "lng": round(lng, 6),
                "accuracy_meters": random.randint(5, 30)
            },
            "incident_category": cat,
            "description": desc
        }
        
    else: # IOT_SENSOR
        sensor_types = [("SMOKE_DETECTOR", "ppm"), ("FLAME_DETECTOR", "C"), ("GAS_SENSOR", "ppm"), ("IMPACT_SENSOR", "G")]
        s_type, unit = random.choice(sensor_types)
        
        if is_negative:
            # Negative Samples for IoT (Glitches, Maintenance)
            status = random.choice(["CALIBRATION_ERROR", "MAINTENANCE_MODE", "SENSOR_FAULT", "FALSE_POSITIVE"])
            reading = round(random.uniform(0.1, 5.0), 2)
        else:
            # True Sensor Alert
            status = "CRITICAL_ALERT"
            reading = round(random.uniform(50.0, 500.0), 2)
            
        return {
            "stream_type": "IOT_SENSOR",
            "timestamp": ts.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "sensor_id": f"{s_type[:3]}-{random.randint(1000, 9999)}",
            "sensor_type": s_type,
            "location": {
                "lat": round(lat, 6),
                "lng": round(lng, 6)
            },
            "reading": reading,
            "unit": unit,
            "status": status
        }

def build_dataset():
    payloads = []
    
    negative_count = int(TOTAL_PAYLOADS * NEGATIVE_SAMPLE_RATIO)
    positive_count = TOTAL_PAYLOADS - negative_count
    
    print(f"Generating {negative_count} negative samples (noise)...")
    for _ in range(negative_count):
        payloads.append(generate_payload(is_negative=True))
        
    print(f"Generating {positive_count} true clustered reports...")
    
    generated_positives = 0
    # Loop to generate "Base Incidents" and their echo reports
    while generated_positives < positive_count:
        # Create the underlying hidden "True Incident"
        base_lat, base_lng = generate_random_location()
        base_ts = datetime.utcnow() - timedelta(days=random.randint(0, 7), hours=random.randint(0, 23))
        
        # Decide how many fragmented reports this incident generated (1 to 5)
        cluster_size = random.randint(1, 5)
        
        for _ in range(cluster_size):
            if generated_positives >= positive_count:
                break
                
            payload = generate_payload(
                is_negative=False, 
                base_lat=base_lat, 
                base_lng=base_lng, 
                base_ts=base_ts
            )
            payloads.append(payload)
            generated_positives += 1
            
    print("Shuffling dataset to simulate real-world stream...")
    random.shuffle(payloads)
    
    output_filename = "synthetic_emergency_streams.json"
    with open(output_filename, "w") as f:
        json.dump(payloads, f, indent=2)
        
    print(f"\nSuccess! Wrote {len(payloads)} payloads to {output_filename}.")

if __name__ == "__main__":
    build_dataset()
