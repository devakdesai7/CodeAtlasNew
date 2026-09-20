from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class Location(BaseModel):
    lat: float
    lng: float
    accuracy_meters: Optional[float] = None

class EmergencyCallPayload(BaseModel):
    stream_type: Literal["EMERGENCY_CALL"] = "EMERGENCY_CALL"
    timestamp: str
    caller_id: str
    location: Location
    transcript: str
    ai_keywords: List[str] = Field(default_factory=list)

class CitizenAppPayload(BaseModel):
    stream_type: Literal["CITIZEN_APP"] = "CITIZEN_APP"
    timestamp: str
    user_id: str
    location: Location
    incident_category: str
    description: str

class IotSensorPayload(BaseModel):
    stream_type: Literal["IOT_SENSOR"] = "IOT_SENSOR"
    timestamp: str
    sensor_id: str
    sensor_type: str
    location: Location
    reading: float
    unit: str
    status: str
