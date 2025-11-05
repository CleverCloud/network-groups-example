from flask import Flask, request, jsonify
import time
import socket
import threading

public_app = Flask(__name__)
private_app = Flask(__name__)

# Public route only
@public_app.route('/', methods=['GET'])
def home():
    return "OK", 200

# Private routes only
@private_app.route('/health', methods=['GET'])
def health():
    hostname = socket.gethostname()
    private_ip = socket.gethostbyname(hostname)
    return jsonify({
        "status": "ok",
        "service": "private-service",
        "hostname": hostname,
        "private_ip": private_ip,
        "timestamp": time.time()
    })

@private_app.route('/transform', methods=['POST'])
def transform():
    try:
        data = request.json
        message = data.get('message', '')

        # We invert the message
        transformed_message = message[::-1]

        hostname = socket.gethostname()
        response = {
            "original": message,
            "transformed": transformed_message,
            "processed_by": hostname,
            "timestamp": time.time()
        }

        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def run_public_port():
    from waitress import serve
    print("Starting public monitoring endpoint on port 9000...")
    serve(public_app, host='0.0.0.0', port=9000)

def run_private_port():
    from waitress import serve
    print("Starting private service endpoint on port 4242...")
    serve(private_app, host='0.0.0.0', port=4242)

if __name__ == '__main__':
    public_thread = threading.Thread(target=run_public_port)
    private_thread = threading.Thread(target=run_private_port)

    public_thread.start()
    private_thread.start()

    public_thread.join()
    private_thread.join()
