#!/bin/bash

cd ./frontend && npm run dev &

cd ./backend && python3 tm_server.py
