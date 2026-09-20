import subprocess
import time
import sys
import os

def main():
    print("==================================================")
    print("  STARTING CODEATLAS EMERGENCY RESPONSE PLATFORM")
    print("==================================================")
    
    # 1. Start Backend API
    print("\n[1/2] Starting FastAPI Server (Port 8000)...")
    print("      (Please wait ~8 seconds for Machine Learning models to load into memory)")
    
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.main:app", "--port", "8000"]
    )
    
    # Wait for models to load
    time.sleep(10) 
    
    # 2. Start Simulator
    print("\n[2/2] Starting Data Simulator Engine...")
    simulator_proc = subprocess.Popen(
        ["npm", "start"], 
        cwd=os.path.join(os.getcwd(), "simulator"), 
        shell=True
    )
    
    try:
        # Keep main thread alive
        backend_proc.wait()
    except KeyboardInterrupt:
        print("\n[INFO] Shutting down platform...")
        backend_proc.terminate()
        simulator_proc.terminate()
        sys.exit(0)

if __name__ == "__main__":
    main()
