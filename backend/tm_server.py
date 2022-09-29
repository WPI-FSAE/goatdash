import websockets
import asyncio
import json
from can_config.main import getConfiguration
import random

async def handler(websocket):
    async for message in websocket:
        print(f'RECEIVED: {message}')

        if message == 'START':
            while True:
                await asyncio.sleep(.1)
                await websocket.send(f'{await get_tm()}')

async def get_tm():
    speed = random.randint(0, 10)
    batt = random.randint(0, 10)
    power = random.randint(0, 10)

    return json.dumps({'speed': speed, 'batt': batt, 'power': power})

async def main():
    async with websockets.serve(handler, "localhost", 8000):
        await asyncio.Future()

asyncio.run(main())