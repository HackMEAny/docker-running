from flask import Flask, jsonify, send_from_directory
import docker
import os

app = Flask(__name__, static_folder='static', static_url_path='')

# Initialize Docker client
client = docker.from_env()

@app.route('/')
def serve_frontend():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/assets/<path:path>')
def serve_assets(path):
    return send_from_directory(os.path.join(app.static_folder, 'assets'), path)

@app.route('/api/containers')
def get_containers():
    try:
        # Get all running containers
        containers = client.containers.list()
        
        container_list = []
        for container in containers:
            container_info = {
                'Id': container.id,
                'Names': container.name,
                'Status': container.status,
                'Ports': container.ports
            }
            container_list.append(container_info)
        
        return jsonify(container_list)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
