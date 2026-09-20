import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

def check_supabase():
    print("=========================================")
    print("  SUPABASE DIAGNOSTICS & VERIFICATION")
    print("=========================================")

    # 1. Check ENV Variables
    load_dotenv()
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")

    if not url or not key:
        print("[ERROR] SUPABASE_URL or SUPABASE_KEY is missing from the .env file.")
        sys.exit(1)
    
    print(f"[OK] Found Supabase Credentials (URL: {url[:20]}...)")

    try:
        client: Client = create_client(url, key)
    except Exception as e:
        print(f"[ERROR] Failed to initialize Supabase client: {e}")
        sys.exit(1)

    # 2. Check Data in 'incidents' table
    print("\n--- Checking 'incidents' Table ---")
    try:
        response = client.table("incidents").select("*").execute()
        data = response.data
        print(f"[OK] Successfully queried 'incidents' table. Found {len(data)} total records.")
        
        for i, row in enumerate(data[:3]): # Show up to 3 records
            print(f"  Record {i+1}: ID={row.get('id')} | Category={row.get('category')} | Severity={row.get('severity')}")
            print(f"            Sources: {row.get('source_events')} | Location: {row.get('location')}")
        
        if len(data) > 3:
            print(f"  ... and {len(data) - 3} more.")
    except Exception as e:
        print(f"[ERROR] Failed to query 'incidents' table. Did you run the SQL migration? Error: {e}")

    # 3. Check PostGIS RPC Function
    print("\n--- Checking PostGIS RPC Function (find_nearby_incident) ---")
    try:
        # Test coordinates (Los Angeles area, matching test_pipeline.py)
        test_lat = 34.050000
        test_lng = -118.240000
        
        rpc_response = client.rpc('find_nearby_incident', {
            'p_lat': test_lat,
            'p_lng': test_lng,
            'p_radius_meters': 50000 # Large radius to catch anything
        }).execute()
        
        print(f"[OK] Successfully called RPC function. Matches found in 50km radius: {len(rpc_response.data)}")
    except Exception as e:
        print(f"[ERROR] RPC Function failed. Did you copy the RPC function into the SQL Editor? Error: {e}")

    print("\n=========================================")
    print("  DIAGNOSTICS COMPLETE")
    print("=========================================")

if __name__ == "__main__":
    check_supabase()
