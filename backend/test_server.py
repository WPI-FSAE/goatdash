import websockets
import asyncio
import json
import configparser
from datetime import datetime
import time

# Testing only
import random

#########
# Setup #
#########

CLIENT_REFRESH = 0
CAN_REFRESH = 0
STATE_REFRESH = 0

# Load config
config = configparser.ConfigParser()
config.read('./config.ini')
PORT = int(config['TEST']['Port'])

# TM Values
rpm, speed, inv_voltage, avg_cell, min_cell, dc_amps = [0] * 6
acc_temp, inv_temp, mtr_temp = [0] * 3
rtd, fault = [False] * 2

odometer, trip = [0] * 2

# Lap Values
lap_timer = False
timer_start = 0

# Derived values
peak_amps = 0
peak_regen = 0
top_speed = 0

last_time = datetime.utcnow()
start_time = last_time

# Load persistant car data
try:
    with open('car_state_test.json', 'r') as f:
        car_state = json.load(f)
        
        odometer = car_state['odometer']
except:
    print("[ERR] State file not found.")

# Testing only
dc_amps_dir = 1
spd_dir = 1

######
# WS #
######
async def message_handler(websocket):
    """
    Handle incoming websocket messages
    """
    global odometer, trip, lap_timer, timer_start, peak_amps, peak_regen, top_speed 

    async for message in websocket:
        print(f'RECEIVED: {message}')

        if message == 'START_DASH':
            # Create new coroutine serving tm data to ws
            asyncio.create_task(send_tm(websocket))
        else:
            # Handle incoming command
            try:
                data = json.loads(message)
            except:
                print("[ERR] Ill formatted message: ", message)
                return

            # Handle message
            if (data['opt'] == "RESET_ODO"):
                odometer = 0
            elif (data['opt'] == "RESET_TRIP"):
                trip = 0
            elif (data['opt'] == "RESET_DRAW"):
                peak_amps = 0
            elif (data['opt'] == "RESET_REGEN"):
                peak_regen = 0
            elif (data['opt'] == "RESET_TOP_SPEED"):
                top_speed = 0
            elif (data['opt'] == "SET_LAP"):
                await websocket.send(json.dumps({"lap_total": data["laps"]}))
            elif (data['opt'] == "START_TIME"):
                lap_timer = True
                timer_start = round(time.time() * 1000.0)

async def animate(websocket):
    inc = 1
    tick = 1

    while tick > 0:
        await websocket.send(json.dumps({'speed': tick * .6}))
        await asyncio.sleep(.01)

        if tick > 100:
            inc = -1

        tick += inc
    
async def send_tm(websocket):
    """
    Maintain telemetry connection with client
    """
    global rpm, speed, inv_voltage, avg_cell, min_cell, max_cell, dc_amps, \
    odometer, trip, acc_temp, inv_temp, mtr_temp, rtd, fault, time_start, lap_timer, \
    peak_amps, peak_regen, top_speed

    i = 0

    # await animate(websocket)

    while True:
        pkt = {}

        # Packet type switching (allows for some values to updated faster than others)
        if (i % 2 == 0):
            pkt = {**pkt, **{'rpm': rpm, 
                             'speed': round(speed, 1), 
                             'inv_volts': inv_voltage,
                             'dc_amps': dc_amps,
                             'race_time': round(time.time() * 1000 - timer_start) if lap_timer else 0
                             }}
        elif (i == 1):
            pkt = {**pkt, **{'avg_cell': avg_cell,
                             'min_cell': min_cell, 
                             'max_cell': max_cell,
                             'acc_temp': acc_temp, 
                             'inv_temp': inv_temp,
                             'mtr_temp': mtr_temp,
                             'odometer': round(odometer, 1), 
                             'trip': round(trip, 3), 
                             'rtd': rtd, 
                             'fault': fault,
                             'peak_amps': peak_amps,
                             'peak_regen': peak_regen,
                             'top_speed': top_speed
                             }}

        if (i >= 99):
            i = 0
        else:
            i += 1
        
        await websocket.send(json.dumps(pkt))
        await asyncio.sleep(.005)    # Define frontend refresh rate


#######
# CAN #
#######
async def poll_tm():
    while True:
        await get_tm()
        await asyncio.sleep(.005)   # backend tm refresh rate

# Read message from can bus, update internal state,
async def get_tm():
    global rpm, speed, inv_voltage, avg_cell, min_cell, max_cell, dc_amps, \
    odometer, trip, last_time, dc_amps_dir, spd_dir, acc_temp, inv_temp, mtr_temp, \
    rtd, fault, peak_amps, peak_regen, top_speed

    # Simulate waiting for message
    # Each message type 'read' every .1s avg
    time.sleep(.01) # simulate can reading (blocking)

    rand_msg_type = random.randint(0, 3)

    speed = speed + (.3 * spd_dir)

    if speed > 80:
        spd_dir = -1

    if speed < 0:
        spd_dir = 1

    if speed > top_speed:
        top_speed = speed

    # DTI_TelemetryA
    if rand_msg_type == 0:
        rpm = random.randint(0, 100000)
        rpm = rpm // 10;
        # speed = rpm * 0.0015763099 # erpm to mph
        
        inv_voltage = random.randint(0, 100)
        nowtime = datetime.utcnow()
        dt = nowtime - last_time

        dx = speed * (dt.total_seconds() / 3600)
        odometer += dx
        trip += dx

        last_time = nowtime
        
    # DTI_TelemetryB
    elif rand_msg_type == 1:
        dc_amps += dc_amps_dir

        if dc_amps > 150:
            dc_amps_dir = -1
        
        if dc_amps < -50:
            dc_amps_dir = 1

        if dc_amps > peak_amps:
            peak_amps = dc_amps
        
        if dc_amps < peak_regen:
            peak_regen = dc_amps

        acc_temp = 90
        inv_temp = 110
        mtr_temp = 74

        rtd = True
        fault = False

    # BMS_Information
    elif rand_msg_type == 2:
        avg_cell = round(((random.randint(0, 10)) * 0.01) + 2, 2)
        min_cell = round(((random.randint(0, 10)) * 0.01) + 2, 2)
        max_cell = round(((random.randint(0, 10)) * 0.01) + 2, 2)

#########
# STATE #
#########
async def store_tm():
    while True:
        await write_state()
        await asyncio.sleep(10) # state update refresh

async def write_state():
    global odometer, trip

    with open('car_state_test.json', 'w') as f:
            f.write(json.dumps({'odometer': round(odometer, 3), 'trip': round(trip, 3)}))


#########
# START #
#########
async def main():
    
    # Start polling CAN
    asyncio.create_task(poll_tm())

    # Start writing state
    asyncio.create_task(store_tm())

    # Start listening for connections
    async with websockets.serve(message_handler, "localhost", 8000):
        await asyncio.Future()

asyncio.run(main())
