import os
from supabase import create_client, Client
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables (SUPABASE_URL, SUPABASE_KEY)
load_dotenv()

class SupabaseDB:
    def __init__(self):
        url: str = os.environ.get("SUPABASE_URL")
        key: str = os.environ.get("SUPABASE_KEY")
        
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in your .env file!")
            
        print("[DB Service] Connecting to Supabase...")
        self.client: Client = create_client(url, key)

    def find_nearby_incident(self, lat, lng, time_str, radius_m=500):
        '''
        Calls the PostgreSQL RPC function we created in the migration file.
        It uses PostGIS ST_DWithin to mathematically prove the emergency is happening in the same block.
        '''
        response = self.client.rpc('find_nearby_incident', {
            'p_lat': lat,
            'p_lng': lng,
            'p_radius_meters': radius_m
        }).execute()
        
        # If the RPC returns data, we found a match!
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None

    def create_incident(self, payload_id, category, severity, lat, lng):
        ''' Inserts a brand new Incident Card into Supabase '''
        inc = {
            "category": category,
            "severity": severity,
            "location": f"POINT({lng} {lat})", # PostGIS exact text format
            "status": "OPEN",
            "source_events": [payload_id],
        }
        response = self.client.table('incidents').insert(inc).execute()
        return response.data[0]

    def update_incident(self, incident_id, payload_id, new_severity):
        ''' Deduplication: Append the new payload ID and escalate severity if needed '''
        # 1. Fetch current incident state
        current = self.client.table('incidents').select('source_events, severity').eq('id', incident_id).execute().data[0]
        
        # 2. Append new event & escalate severity
        current['source_events'].append(payload_id)
        max_severity = max(current['severity'], new_severity)
        
        # 3. Save back to database
        response = self.client.table('incidents').update({
            "source_events": current['source_events'],
            "severity": max_severity,
            "updated_at": datetime.utcnow().isoformat()
        }).eq('id', incident_id).execute()
        
        return response.data[0]
