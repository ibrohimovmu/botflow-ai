import http.server
import json
import os
import subprocess
import platform
import psutil # psutil o'rnatilgan bo'lishi kerak: pip install psutil

# JARVIS BRIDGE PRO v2.0 - STARK EDITION
PORT = 8888

class JarvisProHandler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))

        action = data.get('action')
        params = data.get('params', {})
        
        response = {"status": "error", "message": "Noma'lum buyruq"}

        try:
            if action == "sys_info":
                info = {
                    "os": platform.system(),
                    "node": platform.node(),
                    "release": platform.release(),
                    "cpu": f"{psutil.cpu_percent()}%",
                    "ram": f"{psutil.virtual_memory().percent}%",
                    "disk": f"{psutil.disk_usage('/').percent}%"
                }
                response = {"status": "success", "data": info}
            
            elif action == "open_app":
                app = params.get('app_name', '').lower()
                if "telegram" in app: os.startfile("shell:AppsFolder\TelegramDesktop_8wekyb3d8bbwe!Telegram")
                else: os.system(f"start {app}")
                response = {"status": "success", "message": f"{app} ishga tushirildi"}

            elif action == "file_write":
                path = params.get('path')
                content = params.get('content')
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
                response = {"status": "success", "message": f"Fayl yaratildi: {path}"}

            elif action == "run_command":
                cmd = params.get('command')
                result = subprocess.check_output(cmd, shell=True, stderr=subprocess.STDOUT)
                response = {"status": "success", "output": result.decode('utf-8')}

            elif action == "list_dir":
                path = params.get('path', '.')
                files = os.listdir(path)
                response = {"status": "success", "files": files}

        except Exception as e:
            response = {"status": "error", "message": str(e)}

        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode('utf-8'))

def run():
    print(f"--- JARVIS BRIDGE PRO (STARK EVOLUTION) ---")
    print(f"🚀 Port: {PORT}")
    print("Agent xizmatga tayyor.")
    server_address = ('localhost', PORT)
    httpd = http.server.HTTPServer(server_address, JarvisProHandler)
    httpd.serve_forever()

if __name__ == "__main__":
    run()
