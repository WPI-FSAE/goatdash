import websockets
import asyncio
import json
import configparser
from parser import Parser
import can
from datetime import datetime

#########
# Setup #
#########

CLIENT_REFRESH = 0
CAN_REFRESH = 0
STATE_REFRESH = 0

# Load config
config = configparser.ConfigParser()
config.read('config.ini')
PORT = int(config['WS']['Port'])

can.rc['interface'] = config['CAN']['Interface']
can.rc['channel'] = config['CAN']['Channel']

from can.interface import Bus

bus = Bus()
parser = Parser()

# TM Values
rpm, speed, inv_voltage, avg_cell, min_cell, dc_amps = [0] * 6
acc_temp, inv_temp, mtr_temp = [0] * 3
rtd, fault = [False] * 2

odometer, trip = [0] * 2

# SoC values
batt_pct = 0
mi_est, lap_est, time_est = [0] * 3

# Lap Values
lap_timer = False
timer_start = 0

# Force Values
f_x, f_y = [0] * 2
max_fr, max_rr, max_lt, max_rt = [0] * 4

# Derived values
peak_amps = 0
peak_regen = 0
top_speed = 0

last_time = datetime.utcnow()
start_time = last_time

# Load persistant car data
try:
    with open('car_state.json', 'r') as f:
        car_state = json.load(f)
        
        odometer = car_state['odometer']
except:
    print("[ERR] State file not found.")


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

async def send_tm(websocket):
    """
    Maintain telemetry connection with client
    """
    global rpm, speed, inv_voltage, avg_cell, min_cell, max_cell, dc_amps, \
    odometer, trip, acc_temp, inv_temp, mtr_temp, rtd, fault, time_start, lap_timer, \
    peak_amps, peak_regen, top_speed, mi_est, lap_est, time_est, batt_pct, \
    f_x, f_y, max_fr, max_rr, max_lt, max_rt

    i = 0

    while True:
        pkt = {}

        # Packet type switching (allows for some values to updated faster than others)
        if (i % 2 == 0):
            pkt = {**pkt, **{'rpm': rpm, 
                             'speed': speed, 
                             'inv_volts': inv_voltage,
                             'dc_amps': dc_amps}}
        if (i % 2 == 1):
            pkt = {**pkt, **{'race_time': round(time.time() * 1000 - timer_start) if lap_timer else 0,
                             'f_x': f_x,
                             'f_y': f_y}}
        if (i == 1):
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
                             'top_speed': top_speed,
                             'mi_est': mi_est,
                             'lap_est': lap_est,
                             'time_est': time_est,
                             'batt_pct': batt_pct,
                             'max_fr': round(max_fr, 1),
                             'max_rr': round(max_rr, 1),
                             'max_lt': round(max_lt, 1),
                             'max_rt': round(max_rt, 1)}}

        if (i >= 99):
            i = 0
        else:
            i += 1
        
        await websocket.send(json.dumps(pkt))
        await asyncio.sleep(.05)    # Define frontend refresh rate


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
    odometer, trip, last_time, acc_temp, inv_temp, mtr_temp, rtd, fault, \
    lat, long, peak_amps, peak_regen, \
    f_x, f_y, max_fr, max_rr, max_lt, max_rt

    msg = bus.recv(.01)

    if msg != None:

        msgdef = parser.getMsg(msg.arbitration_id)

        if hasattr(msgdef, 'name') and msgdef.name == 'DTI_TelemetryA':
            msg = parser.parse(msg)
            erpm = msg.ERPM
            rpm = erpm // 10;
            speed = erpm * 0.0015763099 # erpm to mph
            
            inv_voltage = msg.inputVoltage

            nowtime = datetime.utcnow()
            dt = nowtime - last_time
            dx = speed * (dt.total_seconds() / 3600)
            odometer += dx
            trip += dx

            last_time = nowtime
            speed = round(speed, 1)

        elif hasattr(msgdef, 'name') and msgdef.name == 'DTI_TelemetryB':
            msg = parser.parse(msg)
            dc_amps = round(msg.DCDeciAmps / 10.0, 1)

            peak_amps = max(dc_amps, peak_amps)
            peak_regen = min(dc_amps, peak_regen)

    
        elif hasattr(msgdef, 'name') and msgdef.name == 'DTI_TelemetryC':
            msg = parser.parse(msg)

            inv_temp = round(msg.controllerTempDeciCelcius / 10.0, 1)
            mtr_temp = round(msg.motorTempDeciCelcius / 10.0, 1)

        elif hasattr(msgdef, 'name') and msgdef.name == 'BMS_Information' and msgdef.schema.length == len(msg.data):
            msg = parser.parse(msg)
            
            avg_cell = round((msg.AvgCellVoltage * 0.01) + 2, 2)
            min_cell = round((msg.MinCellVoltage * 0.01) + 2, 2)
            max_cell = round((msg.MaxCellVoltage * 0.01) + 2, 2)

            acc_temp = msg.MaxCellTemperature

        elif hasattr(msgdef, 'name') and msgdef.name == 'GPSFix':
            msg = parser.parse(msg)

            long = msg.Longitude
            lat = msg.Latitude

        elif hasattr(msgdef, 'name') and msgdef.name == 'IMUAccel':
            msg = parser.parse(msg)

            f_x = msg.AccelX
            f_y = msg.AccelY

            max_rt = max(f_x, max_rt)
            max_lt = abs(min(f_x, -1 * max_lt))
            max_fr = max(f_y, max_fr)
            max_rr = abs(min(f_y, -1 * max_rr))

        elif hasattr(msgdef, 'name') and msgdef.name == "FrontIO_Heartbeat":
            msg = parser.parseBitfield(msg, "FrontIO_StatusFlags")

            rtd = bool(msg.ReadyToDrive)

        

#########
# STATE #
#########
async def store_tm():
    while True:
        await write_state()
        await asyncio.sleep(10) # state update refresh

async def write_state():
    global odometer, trip

    with open('car_state.json', 'w') as f:
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
