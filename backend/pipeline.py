from backend.models.schemas import EmergencyCallPayload, CitizenAppPayload, IotSensorPayload
from backend.services.ml_service import MLEngine
from backend.services.db_service import SupabaseDB

class IncidentPipeline:
    def __init__(self, model_dir="."):
        self.ml = MLEngine(model_dir)
        self.db = SupabaseDB()

    def process(self, payload):
        category = None
        severity = None
        payload_id = "unknown"
        
        # ==========================================
        # PHASE 1: TRIAGE (Category & Severity)
        # ==========================================
        if isinstance(payload, EmergencyCallPayload):
            payload_id = payload.caller_id
            # Extract keywords with YAKE
            payload.ai_keywords = self.ml.extract_keywords(payload.transcript)
            print(f"  [AI] Extracted Keywords: {payload.ai_keywords}")
            
            # Combine text and keywords for XGBoost
            combined = payload.transcript + " " + " ".join(payload.ai_keywords)
            category, severity = self.ml.predict_triage(combined)
            
        elif isinstance(payload, CitizenAppPayload):
            payload_id = payload.user_id
            category, severity = self.ml.predict_triage(payload.description)
            
        elif isinstance(payload, IotSensorPayload):
            payload_id = payload.sensor_id
            # Hardcoded Logic for Sensors (No ML Required)
            if payload.sensor_type in ["SMOKE_DETECTOR", "FLAME_DETECTOR", "SMOKE", "HEAT"]:
                category = "FIRE"
            elif payload.sensor_type in ["GAS_SENSOR", "GAS"]:
                category = "HAZMAT"
            elif payload.sensor_type in ["WATER", "FLOOD"]:
                category = "FLOOD"
            else:
                category = "CRASH"
                
            if payload.reading > 400: severity = 5
            elif payload.reading > 100: severity = 3
            else: severity = 1

        print(f"  [Triage] Predicted: {category} (Severity {severity})")

        # ==========================================
        # PHASE 2: DEDUPLICATION (Spatio-Temporal)
        # ==========================================
        incident = self.db.find_nearby_incident(payload.location.lat, payload.location.lng, payload.timestamp)
        
        if incident:
            print(f"  [Dedupe] Match Found! Merging into {incident['id']}")
            incident = self.db.update_incident(incident['id'], payload_id, severity)
        else:
            print(f"  [Dedupe] No nearby match. Creating New Incident.")
            incident = self.db.create_incident(payload_id, category, severity, payload.location.lat, payload.location.lng)
            
        return incident
