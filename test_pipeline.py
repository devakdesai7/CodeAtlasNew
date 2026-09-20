import os
import traceback
from backend.pipeline import IncidentPipeline
from backend.models.schemas import EmergencyCallPayload, Location

try:
    print("Initializing Pipeline...")
    pipeline = IncidentPipeline(model_dir=".")
    
    print("\nCreating mock payload...")
    payload = EmergencyCallPayload(
        stream_type="EMERGENCY_CALL",
        timestamp="2026-09-20T10:00:00Z",
        caller_id="NEW_USER_999",
        location=Location(lat=80.0, lng=80.0), # Random coordinates to force INSERT
        transcript="Help there is a huge fire!",
        ai_keywords=[]
    )
    
    print("\nProcessing payload...")
    incident = pipeline.process(payload)
    print("\nSUCCESS! Returned Incident:")
    print(incident)

except Exception as e:
    print("\n[CRASH DETECTED]")
    traceback.print_exc()
