# Multi-stage build: Build React frontend and serve with Python Flask
# Stage 1: Build the React Frontend
FROM node:20-alpine as frontend-builder

WORKDIR /app/src

# Copy package files and install dependencies
COPY src/package*.json ./
RUN npm install

# Copy source code and build
COPY src/ ./
RUN npm run build

# Stage 2: Python Backend with Static Files
FROM python:3.11-slim

WORKDIR /app

# Install Flask and Docker SDK
RUN pip install flask docker

# Copy the built frontend from Stage 1
# Vite builds to 'dist' by default
COPY --from=frontend-builder /app/src/dist ./static

# Copy the Python application
COPY app.py .

# Expose the port
EXPOSE 5000

# Run the application
CMD ["python", "app.py"]
