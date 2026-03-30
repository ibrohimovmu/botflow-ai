import os
import sys
import time
import threading
import socket
import subprocess
import webbrowser
import uvicorn
from app import app

# Global flag to check if server is ready
server_ready = threading.Event()

import urllib.request
import urllib.error

def wait_for_server(url, timeout=60):
    """Wait until the FastAPI /health endpoint responds successfully."""
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            req = urllib.request.Request(f"{url}/health")
            with urllib.request.urlopen(req) as response:
                if response.getcode() == 200:
                    return True
        except (urllib.error.URLError, ConnectionResetError):
            pass
        time.sleep(1)
    return False

def run_server(port):
    """Run uvicorn server in a separate thread."""
    try:
        config = uvicorn.Config(app, host="127.0.0.1", port=port, log_level="error", loop="asyncio")
        server = uvicorn.Server(config)
        server.run()
    except Exception as e:
        print(f"Server Error: {e}")

def find_chrome_edge():
    """Definitive check for Google Chrome or Microsoft Edge paths on Windows."""
    paths = [
        # Chrome paths
        os.path.expandvars(r"%ProgramFiles%\Google\Chrome\Application\chrome.exe"),
        os.path.expandvars(r"%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"),
        os.path.expandvars(r"%LocalAppData%\Google\Chrome\Application\chrome.exe"),
        # Edge paths
        os.path.expandvars(r"%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"),
        os.path.expandvars(r"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe")
    ]
    for p in paths:
        if os.path.exists(p):
            return p
    return None

def main():
    port = 7860
    url = f"http://127.0.0.1:{port}"

    # 1. Start Server in Thread (Safe for PyInstaller)
    print(f"🚀 Initializing AI Engine...", flush=True)
    server_thread = threading.Thread(target=run_server, args=(port,), daemon=True)
    server_thread.start()
    
    # 2. Wait for server (Max 60s)
    if not wait_for_server(url, timeout=60):
        print("❌ Error: Server failed to start.", flush=True)
        return

    # 3. Launch UI
    browser_path = find_chrome_edge()
    if browser_path:
        # --app flag opens in a standalone window, --ash-no-nub-address-bar etc is implied
        subprocess.Popen([browser_path, f"--app={url}"])
    else:
        webbrowser.open(url)

    # 4. Keep main process alive until user closes the app window
    # In 'app' mode, once the window is closed, we want to exit.
    # Since we can't easily 'detect' the browser closure without a wrapper, 
    # we'll use a simple approach: wait until the app is closed manually or via keyboard.
    print(f"✅ BotFlow AI is now running at {url}", flush=True)
    
    try:
        while True:
            time.sleep(5)
            # If for some reason the server thread dies, we should exit
            if not server_thread.is_alive():
                break
    except (KeyboardInterrupt, SystemExit):
        pass

if __name__ == "__main__":
    # Fix for freezing on Windows (Mandatory for PyInstaller)
    import multiprocessing
    multiprocessing.freeze_support()
    
    # Fix for console output in windowed apps
    import io
    if sys.stdout is not None:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    if sys.stderr is not None:
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
        
    main()
