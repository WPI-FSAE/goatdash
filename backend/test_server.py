import websockets
import asyncio
import json
import configparser
from datetime import datetime

# Testing only
import random

# Load config
config = configparser.ConfigParser()
config.read('./config.ini')
PORT = int(config['TEST']['Port'])

rpm = 0
speed = 0
inv_voltage = 0
avg_cell = 0
min_cell = 0
max_cell = 0
dc_amps = 0
odometer = 0
last_time = datetime.utcnow()

# Load persistant car data
with open('car_state.json', 'r') as f:
    car_state = json.load(f)
    
    odometer = car_state['odometer']

# Testing only
dc_amps_dir = 1

# Handle incoming connection from dashboard
async def handler(websocket):
    async for message in websocket:
        print(f'RECEIVED: {message}')

        # Only dashboard connections allowed
        if message == 'START_DASH':

            # Telemetry send loop
            while True:
                await websocket.send(f'{await get_tm()}')

# Read message from can bus, update internal state, return full state
async def get_tm():
    global rpm, speed, inv_voltage, avg_cell, min_cell, max_cell, dc_amps, odometer, last_time, dc_amps_dir
    pkt = json.dumps({})

    # Simulate waiting for message
    await asyncio.sleep(.025)

    rand_msg_type = random.randint(0, 3)

    # DTI_TelemetryA
    if rand_msg_type == 0:
        rpm = random.randint(0, 100000)
        rpm = rpm // 10;
        # speed = rpm * 0.0015763099 # erpm to mph
        speed = speed + 1

        if speed > 80:
            speed = 0
        
        inv_voltage = random.randint(0, 100)
        nowtime = datetime.utcnow()
        dt = nowtime - last_time
        odometer += 0
        last_time = nowtime
        speed = round(speed, 1)
        
        with open('car_state.json', 'w') as f:
            f.write(json.dumps({'odometer': odometer}))

        pkt = json.dumps({'rpm': rpm, 'speed': speed, 'inv_volts': inv_voltage, 'odometer': round(odometer, 3)})

    # DTI_TelemetryB
    elif rand_msg_type == 1:
        dc_amps += dc_amps_dir

        if dc_amps > 150:
            dc_amps_dir = -1
        
        if dc_amps < -50:
            dc_amps_dir = 1

        pkt = json.dumps({'dc_amps': dc_amps})

    # BMS_Information
    elif rand_msg_type == 2:
        avg_cell = round(((random.randint(0, 10)) * 0.01) + 2, 2)
        min_cell = round(((random.randint(0, 10)) * 0.01) + 2, 2)
        max_cell = round(((random.randint(0, 10)) * 0.01) + 2, 2)

        pkt = json.dumps({'avg_cell': avg_cell, 'min_cell': min_cell, 'max_cell': max_cell})

    print(pkt)
    return pkt

async def main():
    async with websockets.serve(handler, "localhost", 8000):
        await asyncio.Future()

asyncio.run(main())
