import math

def haversine(lat1, lon1, lat2, lon2):
    R = 6371000  # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi/2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

class ResourceRecommender:
    def __init__(self):
        # Rule Matrix for Emergency Types
        # Maps incident category → list of required resource types
        # Note: DB uses types: fire_truck, ambulance, rescue_team, equipment, police_unit
        self.type_mapping = {
            'fire': ['fire_truck', 'equipment'],
            'medical': ['ambulance'],
            'crash': ['ambulance', 'fire_truck', 'rescue_team'],
            'hazmat': ['equipment', 'fire_truck'],
            'rescue': ['rescue_team', 'ambulance'],
            'flood': ['rescue_team', 'equipment'],
            'other': ['police_unit', 'ambulance', 'fire_truck']
        }
        
        # Rule Matrix for Quantities based on Severity (1-5)
        self.quantity_mapping = {
            1: 1,
            2: 1,
            3: 2,
            4: 3,
            5: 4
        }

    def get_best_units(self, incident, telemetry_cache):
        """
        telemetry_cache: Dict of active units from RAM/Redis 
        Format: { "U-104": {"lat": 23.0, "lng": 72.5, "type": "fire_truck", "name": "Engine 4"} }
        """
        category = str(incident.get('incident_type', incident.get('category', 'other'))).lower()
        # Severity comes back from Supabase as a string ("LOW", "CRITICAL", etc.)
        sev_raw = incident.get('severity', 3)
        if isinstance(sev_raw, str):
            _sev_map = {"LOW": 2, "MEDIUM": 3, "HIGH": 4, "CRITICAL": 5}
            severity = _sev_map.get(sev_raw.upper(), 3)
        else:
            severity = int(sev_raw)
        inc_lat = incident['location']['lat']
        inc_lng = incident['location']['lng']
        
        required_types = self.type_mapping.get(category, self.type_mapping['other'])
        required_qty = self.quantity_mapping.get(severity, 2)
        
        # 1. Filter by required type
        eligible_units = []
        for unit_id, unit_data in telemetry_cache.items():
            if unit_data.get('type') in required_types:
                # 2. Calculate Distance (ETA)
                dist_m = haversine(inc_lat, inc_lng, unit_data['lat'], unit_data['lng'])
                eta_mins = max(1, int(dist_m / 1000)) # Approx 1km = 1 min
                
                eligible_units.append({
                    'id': unit_id,
                    'name': unit_data['name'],
                    'type': unit_data['type'],
                    'dist_m': dist_m,
                    'eta_mins': eta_mins
                })
                
        # 3. Sort by closest ETA
        eligible_units.sort(key=lambda x: x['dist_m'])
        
        # 4. Slice Top N
        recommended = eligible_units[:required_qty]
        return recommended

    def generate_reasoning(self, incident, recommended_units):
        if not recommended_units:
            return "No available units match the required criteria within response range."
            
        category = str(incident.get('incident_type', incident.get('category', 'Emergency'))).title()
        severity_labels = {1: "Low", 2: "Minor", 3: "Moderate", 4: "High", 5: "Critical"}
        sev_raw = incident.get('severity', 3)
        if isinstance(sev_raw, str):
            _sev_map = {"LOW": 2, "MEDIUM": 3, "HIGH": 4, "CRITICAL": 5}
            sev_int = _sev_map.get(sev_raw.upper(), 3)
        else:
            sev_int = int(sev_raw)
        sev_label = severity_labels.get(sev_int, "Moderate")
        
        unit_names = ", ".join([u['name'] for u in recommended_units])
        eta = recommended_units[0]['eta_mins'] if recommended_units else "N/A"
        
        return f"AI Recommendation: Suggesting dispatch of {unit_names} (ETA {eta} mins) due to {sev_label} severity {category}."
