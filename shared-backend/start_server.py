"""
Start Django with Daphne ASGI server for WebSocket support
"""
import subprocess
import sys

if __name__ == '__main__':
    print("Starting Django with Daphne (ASGI) for WebSocket support...")
    print("WebSocket endpoint: ws://localhost:8000/ws/video-call/<user_id>/")
    print("Press Ctrl+C to stop\n")
    
    try:
        subprocess.run([
            sys.executable, '-m', 'daphne',
            '-b', '0.0.0.0',
            '-p', '8000',
            'crmAdmin.asgi:application'
        ])
    except KeyboardInterrupt:
        print("\nShutting down server...")
