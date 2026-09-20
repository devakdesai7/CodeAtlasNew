from backend.models.schemas import EmergencyCallPayload, IotSensorPayload, Location
from backend.pipeline import IncidentPipeline
import json

def run_tests():
    print("==================================================")
    print("  INITIALIZING INCIDENT PIPELINE")
    print("==================================================")
    
    # Initialize the pipeline (looks for pkl files in the current root directory)
    pipeline = IncidentPipeline(model_dir=".")

    print("\n\n[TEST 1] Processing a brand new 911 Call...")
    p1 = EmergencyCallPayload(
        caller_id="+1555-FIRE",
        timestamp="2026-09-19T10:00:00Z",
        location=Location(lat=34.050000, lng=-118.240000),
        transcript="Oh my god, massive explosion and flames at the warehouse!"
    )
    inc1 = pipeline.process(p1)
    print("-> FINAL INCIDENT CARD:", json.dumps(inc1, indent=2))


    print("\n\n[TEST 2] Processing a Smoke Detector near Test 1 (Should Deduplicate!)...")
    p2 = IotSensorPayload(
        sensor_id="SMK-992",
        sensor_type="SMOKE_DETECTOR",
        timestamp="2026-09-19T10:01:00Z",
        location=Location(lat=34.050100, lng=-118.240100), # Just ~15 meters away
        reading=450.5,
        unit="ppm",
        status="CRITICAL_ALERT"
    )
    inc2 = pipeline.process(p2)
    print("-> FINAL INCIDENT CARD:", json.dumps(inc2, indent=2))


    print("\n\n[TEST 3] Processing a Crash far away (Should Create New)...")
    p3 = EmergencyCallPayload(
        caller_id="+1555-CRASH",
        timestamp="2026-09-19T10:05:00Z",
        location=Location(lat=34.500000, lng=-118.900000), # 50+ miles away
        transcript="A truck just flipped over on the highway, people trapped."
    )
    inc3 = pipeline.process(p3)
    print("-> FINAL INCIDENT CARD:", json.dumps(inc3, indent=2))

if __name__ == "__main__":
    run_tests()
