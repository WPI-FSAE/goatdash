import asyncio
import websockets
import json
import configparser
from datetime import datetime
import time
import Race
import Vehicle
import Debug
import Dashboard
import VehicleInterface
import VehicleState

CLIENT_REFRESH = 60
CAN_REFRESH = 60
STATE_REFRESH = 0

# Load config
config = configparser.ConfigParser()
config.read('./config.ini')
PORT = int(config['TEST']['Port'])

# Start debug logging
dbg = Debug.Debug(0)

# TM Values
vic = Vehicle.Vehicle()

# Lapping
race = Race.Race(0)

# Dashboard Interface
dash = Dashboard.Dashboard(vic, dbg, race)

# CAN Interface
vi = VehicleInterface.VirtualVehicleInterface(vic, dbg, race)

# State Persistance
state = VehicleState.VehicleState(vic, dbg, "car_state_test.json")
state.load_tm()

async def start(vi, state, dash):
    
    # Start polling CAN
    asyncio.create_task(vi.start_tm())

    # Start writing state
    asyncio.create_task(state.store_tm())

    # Start listening for connections
    async with websockets.serve(dash.message_handler, "localhost", PORT):
        await asyncio.Future()


asyncio.run(start(vi, state, dash))