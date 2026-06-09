import http.server
import socketserver
import sys

PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler

print("==================================================")
print("     WINDOWS 93 REPLICA LOCAL SERVER PREVIEW")
print("==================================================")
print(f"[*] Starting retro OS at http://localhost:{PORT}")
print("[*] Press Ctrl+C to shut down the operating system.")
print("==================================================")

# Allow port reuse to prevent address already in use errors
socketserver.TCPServer.allow_reuse_address = True

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[!] Shutting down Windows 93... Goodbye!")
        sys.exit(0)
