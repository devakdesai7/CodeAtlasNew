#!/usr/bin/env python3
"""
Synthetic Emergency Report Dataset Generator
Generates 10,000 fragmented emergency reports representing ~3,500 true incidents
for training AI deduplication and clustering models.
"""

import json
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any
import math

# Simulated libraries (using only standard library)
# In production: pip install faker numpy

class SyntheticEmergencyGenerator:
    """Generates realistic emergency report payloads with spatial/temporal clustering."""
    
    # Los Angeles bounding box (can be swapped for NYC or other major cities)
    BBOX = {
        "lat_min": 33.7,
        "lat_max": 34.2,
        "lng_min": -118.7,
        "lng_max": -117.9
    }
    
    # Incident types and realistic descriptions
    INCIDENT_TYPES = {
        "FIRE": {
            "descriptions": [
                "Structure fire at residential building",
                "Vehicle fire on highway",
                "Warehouse fire with heavy smoke",
                "Brush fire spreading rapidly",
                "Commercial building ablaze"
            ],
            "call_transcripts": [
                "Help! There's a massive fire! Building is engulfed!",
                "Fire fire fire! Please send trucks now!",
                "My house is on fire, flames everywhere!",
                "There's a big fire near the docks, spreading fast!",
                "Vehicle on fire blocking the freeway!"
            ]
        },
        "MEDICAL": {
            "descriptions": [
                "Person unresponsive, potential cardiac event",
                "Severe injury from fall",
                "Choking victim needs immediate assistance",
                "Allergic reaction, difficulty breathing",
                "Pedestrian struck by vehicle"
            ],
            "call_transcripts": [
                "My mother is unconscious, not breathing!",
                "Severe accident, multiple people injured!",
                "Please help, person is bleeding heavily!",
                "Someone collapsed in the street!",
                "Difficulty breathing, need ambulance now!"
            ]
        },
        "CRASH": {
            "descriptions": [
                "Multi-vehicle collision on interstate",
                "Pedestrian struck by car",
                "Vehicle vs. bicycle accident",
                "Rollover accident, vehicle on side",
                "Head-on collision on main road"
            ],
            "call_transcripts": [
                "Massive car crash, cars everywhere!",
                "Hit and run, person on the ground!",
                "Accident on the freeway, traffic backed up!",
                "Multiple cars crashed, send help!",
                "Car flipped over, need emergency crew!"
            ]
        },
        "HAZMAT": {
            "descriptions": [
                "Chemical spill in industrial area",
                "Gas leak detected near residential zone",
                "Hazardous materials transport accident",
                "Unknown substance leaking from container",
                "Toxic fumes spreading in neighborhood"
            ],
            "call_transcripts": [
                "Strange smell, chemical leak I think!",
                "Gas smell everywhere, evacuating!",
                "Hazmat truck accident, spill everywhere!",
                "Unknown chemical everywhere, help!",
                "Toxic fumes in the area, can't breathe!"
            ]
        }
    }
    
    SENSOR_TYPES = {
        "FIRE": ["SMOKE_DETECTOR", "HEAT_SENSOR", "FLAME_DETECTOR"],
        "MEDICAL": [],
        "CRASH": ["IMPACT_SENSOR", "MOTION_DETECTOR"],
        "HAZMAT": ["GAS_SENSOR", "CHEMICAL_DETECTOR"]
    }
    
    def __init__(self, seed: int = 42):
        """Initialize generator with optional random seed."""
        random.seed(seed)
    
    def random_coordinate(self) -> tuple:
        """Generate random lat/lng within LA bounding box."""
        lat = random.uniform(self.BBOX["lat_min"], self.BBOX["lat_max"])
        lng = random.uniform(self.BBOX["lng_min"], self.BBOX["lng_max"])
        return (lat, lng)
    
    def apply_spatial_noise(self, lat: float, lng: float, radius_meters: int = 500) -> tuple:
        """Apply random spatial offset (0-radius_meters) to coordinates."""
        meters_per_degree_lat = 111000
        meters_per_degree_lng = 111000 * math.cos(math.radians(lat))
        
        offset_meters = random.uniform(0, radius_meters)
        angle = random.uniform(0, 2 * math.pi)
        
        lat_offset = (offset_meters / meters_per_degree_lat) * math.cos(angle)
        lng_offset = (offset_meters / meters_per_degree_lng) * math.sin(angle)
        
        return (lat + lat_offset, lng + lng_offset)
    
    def apply_temporal_noise(self, base_time: datetime, max_minutes: int = 15) -> datetime:
        """Apply random temporal offset (0-max_minutes) to timestamp."""
        offset_seconds = random.randint(0, max_minutes * 60)
        return base_time + timedelta(seconds=offset_seconds)
    
    def generate_base_incidents(self, count: int = 3500) -> List[Dict[str, Any]]:
        """Generate base true incidents with random locations and timestamps."""
        incidents = []
        base_time = datetime(2026, 9, 19, 9, 0, 0)
        
        for i in range(count):
            incident_type = random.choice(list(self.INCIDENT_TYPES.keys()))
            lat, lng = self.random_coordinate()
            timestamp = base_time + timedelta(minutes=random.randint(0, 480))  # 8-hour window
            
            incidents.append({
                "id": f"incident_{i}",
                "type": incident_type,
                "base_lat": lat,
                "base_lng": lng,
                "base_timestamp": timestamp,
                "report_count": random.randint(1, 5)
            })
        
        return incidents
    
    def generate_emergency_call(self, incident: Dict) -> Dict[str, Any]:
        """Generate an EMERGENCY_CALL payload."""
        noisy_lat, noisy_lng = self.apply_spatial_noise(
            incident["base_lat"], 
            incident["base_lng"], 
            radius_meters=random.randint(100, 500)
        )
        noisy_time = self.apply_temporal_noise(incident["base_timestamp"])
        
        descriptions = self.INCIDENT_TYPES[incident["type"]]["call_transcripts"]
        
        return {
            "stream_type": "EMERGENCY_CALL",
            "timestamp": noisy_time.isoformat() + "Z",
            "caller_id": f"+1555{random.randint(100, 9999):04d}",
            "location": {
                "lat": round(noisy_lat, 6),
                "lng": round(noisy_lng, 6),
                "accuracy_meters": random.randint(100, 500)
            },
            "transcript": random.choice(descriptions),
            "ai_keywords": []  # CRITICAL: Must be empty for raw stream data
        }
    
    def generate_citizen_app(self, incident: Dict) -> Dict[str, Any]:
        """Generate a CITIZEN_APP payload."""
        noisy_lat, noisy_lng = self.apply_spatial_noise(
            incident["base_lat"], 
            incident["base_lng"], 
            radius_meters=random.randint(5, 20)
        )
        noisy_time = self.apply_temporal_noise(incident["base_timestamp"])
        
        descriptions = self.INCIDENT_TYPES[incident["type"]]["descriptions"]
        
        payload = {
            "stream_type": "CITIZEN_APP",
            "timestamp": noisy_time.isoformat() + "Z",
            "user_id": f"usr_{random.randint(10000, 99999)}",
            "location": {
                "lat": round(noisy_lat, 6),
                "lng": round(noisy_lng, 6),
                "accuracy_meters": random.randint(5, 20)
            },
            "incident_category": incident["type"],
            "description": random.choice(descriptions)
        }
        
        # Optional media URL (50% chance)
        if random.random() > 0.5:
            payload["media_url"] = f"https://dummyimage.com/incident_{random.randint(1000, 9999)}.jpg"
        
        return payload
    
    def generate_iot_sensor(self, incident: Dict) -> Dict[str, Any]:
        """Generate an IOT_SENSOR payload."""
        # Only generate sensors for incidents that support them
        sensor_types = self.SENSOR_TYPES.get(incident["type"], [])
        if not sensor_types:
            return None
        
        noisy_lat, noisy_lng = self.apply_spatial_noise(
            incident["base_lat"], 
            incident["base_lng"], 
            radius_meters=0  # Sensors are stationary
        )
        noisy_time = self.apply_temporal_noise(incident["base_timestamp"], max_minutes=5)
        
        sensor_type = random.choice(sensor_types)
        
        # Generate realistic readings based on sensor type
        if "SMOKE" in sensor_type or "HEAT" in sensor_type or "FLAME" in sensor_type:
            reading = random.uniform(300, 500)  # PPM or temperature
            unit = "ppm" if "SMOKE" in sensor_type else "°C"
        elif "GAS" in sensor_type or "CHEMICAL" in sensor_type:
            reading = random.uniform(50, 300)
            unit = "ppm"
        else:
            reading = random.uniform(0.5, 1.0)
            unit = "G-force"
        
        return {
            "stream_type": "IOT_SENSOR",
            "timestamp": noisy_time.isoformat() + "Z",
            "sensor_id": f"{sensor_type[:3]}-{random.randint(1000, 9999)}",
            "sensor_type": sensor_type,
            "location": {
                "lat": round(noisy_lat, 6),
                "lng": round(noisy_lng, 6)
            },
            "reading": round(reading, 2),
            "unit": unit,
            "status": "ALERT" if reading > 250 else "WARNING"
        }
    
    def generate_dataset(self, total_reports: int = 10000) -> List[Dict[str, Any]]:
        """Generate complete synthetic dataset."""
        print(f"Generating base incidents...")
        incidents = self.generate_base_incidents(count=3500)
        
        reports = []
        report_distribution = {
            "EMERGENCY_CALL": 0.40,
            "CITIZEN_APP": 0.40,
            "IOT_SENSOR": 0.20
        }
        
        print(f"Generating {total_reports} fragmented reports...")
        for incident in incidents:
            for _ in range(incident["report_count"]):
                report_type = random.choices(
                    list(report_distribution.keys()),
                    weights=list(report_distribution.values()),
                    k=1
                )[0]
                
                if report_type == "EMERGENCY_CALL":
                    reports.append(self.generate_emergency_call(incident))
                elif report_type == "CITIZEN_APP":
                    reports.append(self.generate_citizen_app(incident))
                else:  # IOT_SENSOR
                    sensor_report = self.generate_iot_sensor(incident)
                    if sensor_report:
                        reports.append(sensor_report)
        
        # Trim or pad to exactly 10,000
        if len(reports) > total_reports:
            reports = reports[:total_reports]
        elif len(reports) < total_reports:
            # Generate additional random reports
            print(f"Padding dataset with {total_reports - len(reports)} additional reports...")
            while len(reports) < total_reports:
                incident = random.choice(incidents)
                report_type = random.choice(
                    ["EMERGENCY_CALL", "CITIZEN_APP", "IOT_SENSOR"]
                )
                
                if report_type == "EMERGENCY_CALL":
                    reports.append(self.generate_emergency_call(incident))
                elif report_type == "CITIZEN_APP":
                    reports.append(self.generate_citizen_app(incident))
                else:
                    sensor_report = self.generate_iot_sensor(incident)
                    if sensor_report:
                        reports.append(sensor_report)
        
        # Shuffle to simulate real-world order
        random.shuffle(reports)
        return reports


def main():
    """Generate and save synthetic emergency dataset."""
    generator = SyntheticEmergencyGenerator(seed=42)
    
    print("Starting synthetic emergency report generation...")
    reports = generator.generate_dataset(total_reports=10000)
    
    output_file = "synthetic_emergency_streams.json"
    print(f"Writing {len(reports)} reports to {output_file}...")
    
    with open(output_file, "w") as f:
        json.dump(reports, f, indent=2)
    
    # Print summary statistics
    print("\n" + "="*60)
    print("DATASET SUMMARY")
    print("="*60)
    print(f"Total reports: {len(reports)}")
    
    stream_types = {}
    for report in reports:
        stream_type = report["stream_type"]
        stream_types[stream_type] = stream_types.get(stream_type, 0) + 1
    
    print("\nReport types:")
    for stream_type, count in sorted(stream_types.items()):
        pct = (count / len(reports)) * 100
        print(f"  {stream_type}: {count} ({pct:.1f}%)")
    
    incident_categories = {}
    for report in reports:
        if "incident_category" in report:
            cat = report["incident_category"]
            incident_categories[cat] = incident_categories.get(cat, 0) + 1
    
    if incident_categories:
        print("\nIncident categories:")
        for cat, count in sorted(incident_categories.items()):
            pct = (count / len(reports)) * 100
            print(f"  {cat}: {count} ({pct:.1f}%)")
    
    print(f"\nFile saved to: {output_file}")
    print("="*60)


if __name__ == "__main__":
    main()
