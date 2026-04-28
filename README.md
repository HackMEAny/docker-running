# Docker Containers UI

A **single-container** solution that displays all running Docker containers on your system along with their exposed ports. Clicking on a container card opens its port in a new tab at `http://ani.local:<port>/`.

Built with **React + Vite** frontend and **Flask** backend, combined into one efficient Docker image using multi-stage builds.

## Features

- 🐳 Displays all running Docker containers
- 🔍 Shows container names, IDs, and status
- 🔗 Displays exposed ports for each container
- 🚀 Click on any container to open `http://ani.local:<port>/` in a new tab
- 🔄 Auto-refreshes every 30 seconds
- 🎨 Modern dark theme UI
- 📦 **Single Docker container** - no multi-service setup needed!

## Architecture

This is a **single-service application** using a multi-stage Docker build:

1. **Stage 1 (Build)**: Node.js builds the React/Vite frontend
2. **Stage 2 (Runtime)**: Python Flask serves the static files AND provides the API
   - Serves the built React app as static files
   - Provides `/api/containers` endpoint to query Docker socket
   - Everything runs in one container on port 5000

## Quick Start

### Prerequisites

- Docker and Docker Compose installed on your system
- Access to Docker socket (`/var/run/docker.sock`)

### Running the Application

```bash
# Build and start the single container
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

Once started, access the UI at: **http://localhost:5000**

### Stopping the Application

```bash
docker-compose down
```

### Alternative: Run with Docker directly

```bash
# Build the image
docker build -t docker-containers-ui .

# Run the container
docker run -d \
  --name docker-containers-ui \
  -p 5000:5000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  docker-containers-ui
```

## Portability & Compatibility

**Yes, this is fully portable!** You can build the Docker image on one machine and run it on any other device:

### How to Deploy on Different Systems

**Option 1: Build on target machine (Recommended)**
```bash
# Copy the source code to the new machine
# Then run:
docker-compose up --build -d
```

**Option 2: Transfer pre-built image**
```bash
# On source machine
docker save docker-containers-ui > docker-containers-ui.tar

# Transfer the file to target machine (scp, rsync, etc.)
scp docker-containers-ui.tar user@target-machine:

# On target machine
docker load < docker-containers-ui.tar
docker run -d \
  --name docker-containers-ui \
  -p 5000:5000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  docker-containers-ui
```

### Requirements on Target Machine

1. **Docker Engine** installed and running
2. **Docker socket access** (the container needs to communicate with host Docker)
3. **Same CPU architecture** (x86_64, ARM, etc.) - or build on the target device
4. **Port 5000 available** (or modify in docker-compose.yml)

### Cross-Architecture Support

If moving between different architectures (e.g., Intel → Apple Silicon):
- Build the image directly on the target device (recommended)
- Or use Docker's multi-arch build features

## Configuration

### Change the Port

Edit `docker-compose.yml`:
```yaml
ports:
  - "8080:5000"  # Access on port 8080 instead of 5000
```

### Change the Hostname

By default, clicking a container opens `http://ani.local:<port>/`. To change this:

Edit `src/src/App.jsx`, find the `openContainer` function:
```javascript
const url = `http://ani.local:${port}/`
// Change 'ani.local' to your hostname or IP
```

## File Structure

```
/workspace
├── Dockerfile              # Multi-stage build (React + Flask in one)
├── docker-compose.yml      # Single service configuration
├── app.py                  # Flask backend API
├── README.md               # This file
└── src/                    # React frontend source
    ├── package.json        # Node.js dependencies
    ├── vite.config.js      # Vite configuration
    ├── index.html          # HTML entry point
    └── src/
        ├── main.jsx        # React entry point
        ├── App.jsx         # Main React component
        └── App.css         # Styles
```

## Development

### Running Locally (without Docker)

```bash
# Install frontend dependencies
cd src
npm install

# Start frontend dev server
npm run dev

# In another terminal, start Flask backend
cd ..
pip install flask docker
python app.py
```

Note: The backend still needs Docker socket access to list containers.

## Troubleshooting

### Permission Denied Error

If you get permission errors accessing the Docker socket:

```bash
sudo chmod 666 /var/run/docker.sock
```

Or add your user to the docker group:

```bash
sudo usermod -aG docker $USER
# Then logout and login again
```

### No Containers Showing

- Ensure you have running containers with exposed ports on the host
- Check if the Docker socket is properly mounted
- View container logs: `docker logs docker-containers-ui`

### Cannot Access UI

- Verify port 5000 is not in use by another service
- Check if the container is running: `docker ps | grep docker-containers-ui`
- View logs: `docker-compose logs`

### Container Ports Not Accessible

- Ensure the containers have their ports published/exposed
- The hostname `ani.local` should resolve to your Docker host
- For remote access, configure your DNS or use the host's IP address

## License

MIT
