from flask import Flask, jsonify, send_from_directory, request, send_file
import docker
import os

# Get the base directory where the app is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_FOLDER = os.path.join(BASE_DIR, 'static')

app = Flask(__name__, static_folder=STATIC_FOLDER, static_url_path='')

# Initialize Docker client
try:
    client = docker.from_env()
except Exception as e:
    print(f"Warning: Could not connect to Docker daemon: {e}")
    client = None

@app.route('/api/containers')
def get_containers():
    if client is None:
        return jsonify({'error': 'Docker daemon not available'}), 500
    
    try:
        # Get all running containers
        containers = client.containers.list()
        
        container_list = []
        for container in containers:
            # Get port mappings
            ports = []
            container_ports = container.ports or {}
            for private_port, public_hosts in container_ports.items():
                if public_hosts:
                    for host in public_hosts:
                        if host.get('HostIp') != '0.0.0.0' or True:  # Include all bindings
                            ports.append({
                                'PublicPort': host.get('HostPort'),
                                'PrivatePort': private_port.split('/')[0],
                                'Type': private_port.split('/')[1] if '/' in private_port else 'tcp',
                                'IP': host.get('HostIp', '0.0.0.0')
                            })
            
            container_info = {
                'Id': container.id,
                'Names': [container.name],
                'Status': container.status,
                'Ports': ports
            }
            container_list.append(container_info)
        
        return jsonify(container_list)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Serve React app for all other routes (SPA support)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_spa(path):
    # Don't interfere with API routes
    if path.startswith('api/'):
        return jsonify({'error': 'API endpoint not found'}), 404
    
    # If a specific file is requested, try to serve it
    if path:
        file_path = os.path.join(STATIC_FOLDER, path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return send_file(file_path)
    
    # For SPA routing or root, return index.html
    index_path = os.path.join(STATIC_FOLDER, 'index.html')
    if os.path.exists(index_path):
        return send_file(index_path)
    else:
        return jsonify({'error': 'Frontend not built. Please build the React app first.'}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
