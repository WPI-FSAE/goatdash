import websockets
import asyncio
import json
import configparser
from parser import Parser
import can
from datetime import datetime

# Load config
config = configparser.ConfigParser()
config.read('config.ini')
PORT = int(config['WS']['Port'])

can.rc['interface'] = config['CAN']['Interface']
can.rc['channel'] = config['CAN']['Channel']

from can.interface import Bus

bus = Bus()
parser = Parser()

speed = 0
inv_voltage = 0
avg_cell = 0
min_cell = 0
max_cell = 0
dc_amps = 0
odometer = 0
last_time = datetime.utcnow()

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
    global speed, inv_voltage, avg_cell, min_cell, max_cell, dc_amps, odometer, last_time

    msg = bus.recv(.01)

    if msg != None:

        msgdef = parser.getMsg(msg.arbitration_id)

        if hasattr(msgdef, 'name') and msgdef.name == 'DTI_TelemetryA':
            msg = parser.parse(msg)

            speed = msg.ERPM * 0.0015763099 # erpm to mph
            inv_voltage = msg.inputVoltage
            nowtime = datetime.utcnow()
            dt = nowtime - last_time
            odometer += speed * (dt.total_seconds() / 3600)
            last_time = nowtime
            speed = round(speed, 1)
        elif hasattr(msgdef, 'name') and msgdef.name == 'DTI_TelemetryB':
            msg = parser.parse(msg)

            dc_amps = round(msg.DCDeciAmps / 10.0, 1)
        elif hasattr(msgdef, 'name') and msgdef.name == 'BMS_Information' and msgdef.schema.length == len(msg.data):
            msg = parser.parse(msg)
            
            avg_cell = round((msg.AvgCellVoltage * 0.01) + 2, 2)
            min_cell = round((msg.MinCellVoltage * 0.01) + 2, 2)
            max_cell = round((msg.MaxCellVoltage * 0.01) + 2, 2)


    return json.dumps({'speed': speed, 'avg_cell': avg_cell, 'min_cell': min_cell, 'max_cell': max_cell, 'inv_volts': inv_voltage, 'dc_amps': dc_amps, 'odometer': round(odometer, 3)})

async def main():
    async with websockets.serve(handler, "localhost", 8000):
        await asyncio.Future()

asyncio.run(main())
