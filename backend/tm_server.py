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

lat = 0
long = 0

rtd = False
fault = False

odometer = 0
trip = 0
last_time = datetime.utcnow()

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
                             'inv_volts': inv_voltage,
                             'dc_amps': dc_amps}}
        elif (i % 2 == 1):
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

        if (i >= 9):
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
    lat, long

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
