from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated, Union, Dict, Any
from pydantic import Field
from backend.models.schemas import EmergencyCallPayload, CitizenAppPayload, IotSensorPayload
from backend.pipeline import IncidentPipeline
from backend.services.recommendation_service import ResourceRecommender
import traceback

app = FastAPI(title="Emergency Response ML Pipeline API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("[API] Initializing ML Pipeline...")
pipeline = IncidentPipeline(model_dir=".")
recommender = ResourceRecommender()

# [Production Note: Replace this dict with Redis (e.g., redis_client.geoadd)]
# We use a fast Python dictionary for the hackathon to eliminate DB IO bottlenecks.
TELEMETRY_CACHE = {} 
# Load registered units from DB to validate incoming telemetry
registered_units = pipeline.db.load_registered_units()

class UnitTelemetryPayload(EmergencyCallPayload):
    # Hack for Pydantic discriminated union to accept the telemetry payload
    stream_type: str = "UNIT_TELEMETRY"
    unit_id: str
    unit_type: str
    status: str

SimulationPayload = Annotated[
    Union[EmergencyCallPayload, CitizenAppPayload, IotSensorPayload],
    Field(discriminator="stream_type")
]

# We accept a raw dict to bypass strict typing for UnitTelemetryPayload just for this demo
@app.post("/ingest")
def ingest_payload(payload: dict):
    try:
        stream_type = payload.get("stream_type")
        
        # 1. Telemetry Ingestion
        if stream_type == "UNIT_TELEMETRY":
            unit_id = payload.get("unit_id")
            if unit_id not in registered_units:
                return {"status": "rejected", "reason": f"Unregistered Unit {unit_id}"}
                
            lat = payload["location"]["lat"]
            lng = payload["location"]["lng"]
            status = payload.get("status", "AVAILABLE")
            
            # Cache in RAM for fast recommendation lookups
            TELEMETRY_CACHE[unit_id] = {
                "lat": lat,
                "lng": lng,
                "type": registered_units[unit_id]["type"],
                "name": registered_units[unit_id]["name"]
            }
            
            # Push to Supabase so Realtime streams it to the frontend map
            pipeline.db.update_resource_location(unit_id, lat, lng, status)
            
            return {"status": "cached", "unit": unit_id}
            
        # 2. Emergency Ingestion & Triage
        # Re-parse into Pydantic models for the pipeline
        if stream_type == "EMERGENCY_CALL":
            parsed = EmergencyCallPayload(**payload)
        elif stream_type == "CITIZEN_APP":
            parsed = CitizenAppPayload(**payload)
        else:
            parsed = IotSensorPayload(**payload)
            
        incident = pipeline.process(parsed)
        
        # 3. Recommendation Engine
        recommended_units = recommender.get_best_units(incident, TELEMETRY_CACHE)
        ai_text = recommender.generate_reasoning(incident, recommended_units)
        
        # 4. Attach to Incident Card (Human in the Loop - No assignments made yet!)
        unit_names = [u['name'] for u in recommended_units]
        try:
            # Attempt to save to DB (will fail if columns missing, handled gracefully)
            pipeline.db.save_recommendations(incident['id'], unit_names, ai_text)
        except Exception:
            pass # Fails gracefully if user hasn't added columns yet
            
        incident['recommended_units'] = unit_names
        incident['ai_recommendation'] = ai_text
        
        return {
            "status": "success",
            "incident": incident
        }
    except Exception as e:
        error_msg = f"Pipeline Error: {str(e)}"
        print(f"[ERROR] {error_msg}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_msg)

if __name__ == "__main__":
    import uvicorn
    # Run the API locally for testing
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
