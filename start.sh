#!/bin/bash

cd ./frontend && npm run dev &

cd ./backend && python3 tm_server.py &

chromium-browser --noerrdialogs --disable-infobars --incognito --kiosk http://localhost:3000/wpifsae &
