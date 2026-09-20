import subprocess
import time
import sys
import os
import socket

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def free_port(port):
    """Attempt to kill any process occupying the given port (Windows)."""
    try:
        result = subprocess.run(
            ["powershell", "-Command",
             f"Get-NetTCPConnection -LocalPort {port} -ErrorAction SilentlyContinue | "
             f"ForEach-Object {{ Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }}"],
            capture_output=True, timeout=5
        )
    except Exception:
        pass

def wait_for_server(port, timeout=30):
    """Block until the server is accepting connections or timeout expires."""
    start = time.time()
    while time.time() - start < timeout:
        if is_port_in_use(port):
            return True
        time.sleep(1)
    return False

def main():
    print("==================================================")
    print("  STARTING CODEATLAS EMERGENCY RESPONSE PLATFORM")
    print("==================================================")
    
    port = 8000

    # Pre-flight: free port if occupied by a stale process
    if is_port_in_use(port):
        print(f"\n[WARN] Port {port} is already in use. Attempting to free it...")
        free_port(port)
        time.sleep(2)
        if is_port_in_use(port):
            print(f"[ERROR] Could not free port {port}. Please close the other application and retry.")
            sys.exit(1)
        print(f"[OK] Port {port} freed successfully.")

    # 1. Start Backend API
    print(f"\n[1/2] Starting FastAPI Server (Port {port})...")
    print("      (Please wait for Machine Learning models to load into memory)")
    
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.main:app", "--port", str(port)]
    )
    
    # Wait for server to actually be ready instead of blind sleep
    if not wait_for_server(port, timeout=30):
        print("[ERROR] FastAPI server failed to start within 30 seconds.")
        backend_proc.terminate()
        sys.exit(1)
    
    print(f"[OK] FastAPI server is live on port {port}.")
    
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
