#!/bin/bash

#cd ./frontend && npm run dev &

#cd ./backend && python tm_server.py &

export DISPLAY=:0
fsae-dashboard &

#chromium-browser --noerrdialogs --disable-infobars --incognito --kiosk http://localhost:3000/wpifsae &
