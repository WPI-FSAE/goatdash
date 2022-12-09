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

rpm = 0
speed = 0
inv_voltage = 0
avg_cell = 0
min_cell = 0
max_cell = 0
dc_amps = 0

acc_temp = 0
inv_temp = 0
mtr_temp = 0

rtd = False
fault = False

odometer = 0
trip = 0

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


######
# WS #
######
async def message_handler(websocket):
    """
    Handle incoming websocket messages
    """
    global odometer, trip

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

async def send_tm(websocket):
    """
    Maintain telemetry connection with client
    """
    global rpm, speed, inv_voltage, avg_cell, min_cell, max_cell, dc_amps, \
    odometer, trip, acc_temp, inv_temp, mtr_temp, rtd, fault

    i = 0

    while True:
        pkt = {}

        # Packet type switching (allows for some values to updated faster than others)
        if (i % 2 == 0):
            pkt = {**pkt, **{'rpm': rpm, 
                             'speed': speed, 
<<<<<<< HEAD
                             'inv_volts': inv_voltage, 
                             'odometer': round(odometer, 1), 
                             'trip': round(trip, 3),
                             'uptime': (datetime.utcnow() - start_time).total_seconds()}}
        elif (i % 2 == 1):
=======
                             'inv_volts': inv_voltage,
                             'dc_amps': dc_amps
                             }}
        elif (i == 1):
>>>>>>> main
            pkt = {**pkt, **{'avg_cell': avg_cell,
                             'min_cell': min_cell, 
                             'max_cell': max_cell,
                             'acc_temp': acc_temp, 
                             'inv_temp': inv_temp,
                             'mtr_temp': mtr_temp,
                             'odometer': round(odometer, 1), 
                             'trip': round(trip, 3), 
                             'rtd': rtd, 
                             'fault': fault}}

        if (i >= 99):
            i = 0
        else:
            i += 1
        
        await websocket.send(json.dumps(pkt))
        await asyncio.sleep(.01)    # Define frontend refresh rate


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
    odometer, trip, last_time, dc_amps_dir, acc_temp, inv_temp, mtr_temp, \
    rtd, fault

    # Simulate waiting for message
    # Each message type 'read' every .1s avg
    time.sleep(.01) # simulate can reading (blocking)

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

        dx = speed * (dt.total_seconds() / 3600)
        odometer += dx
        trip += dx

        last_time = nowtime
        speed = round(speed, 1)
        
    # DTI_TelemetryB
    elif rand_msg_type == 1:
        dc_amps += dc_amps_dir

        if dc_amps > 150:
            dc_amps_dir = -1
        
        if dc_amps < -50:
            dc_amps_dir = 1

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
