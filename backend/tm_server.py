import websockets
import asyncio
import json
import random
from parser import Parser
import can

can.rc['interface'] = 'socketcan'
can.rc['channel'] = 'can1'

from can.interface import Bus

bus = Bus()

parser = Parser()

speed = 0
inv_voltage = 0
avg_cell = 0
min_cell = 0
dc_amps = 0

async def handler(websocket):
    async for message in websocket:
        print(f'RECEIVED: {message}')

        if message == 'START':
            while True:
                #await asyncio.sleep(0)
                await websocket.send(f'{await get_tm()}')

async def get_tm():
    global speed, inv_voltage, avg_cell, min_cell, dc_amps

    msg = bus.recv(.01)
    if msg != None:
        msgdef = parser.getMsg(msg.arbitration_id)
        if hasattr(msgdef, 'name') and msgdef.name == 'DTI_TelemetryA':
            msg = parser.parse(msg)
            speed = round(msg.ERPM * 0.00118223248, 1) # erpm to mph
            inv_voltage = msg.inputVoltage
        elif hasattr(msgdef, 'name') and msgdef.name == 'DTI_TelemetryB':
            msg = parser.parse(msg)
            dc_amps = round(msg.DCDeciAmps / 10.0, 1)
        elif hasattr(msgdef, 'name') and msgdef.name == 'BMS_Information':
            msg = parser.parse(msg)
            avg_cell = (msg.AvgCellVoltage * 0.01) + 2
            min_cell = (msg.MinCellVoltage * 0.01) + 2


    return json.dumps({'speed': speed, 'avg_cell': avg_cell, 'min_cell': min_cell, 'inv_volts': inv_voltage, 'dc_amps': dc_amps})

async def main():
    async with websockets.serve(handler, "localhost", 8000):
        await asyncio.Future()

asyncio.run(main())
