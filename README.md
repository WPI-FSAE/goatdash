# FSAE 2022-23 Vehicle Dashboard

## Frontend

The frontend is an Electron application using React as the GUI framework.

### Setup

1. Install Node.js
2. Run ```npm i``` to install necessary packages
3. Run ```npm run dev``` to start development server

## Backend

The backend is a python websocket server that reads telemetry off the can bus and mirrors it to the frontend.

### Setup

1. Install Python 3
2. Install CAN Configuration ```git submodule init && git submodule update```
2. Run ```pip install -r requirements.txt```
3. Run ```python tm_server.py``` to start server