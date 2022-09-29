import websockets
import asyncio
import time
import random

async def handler(websocket):
    async for message in websocket:
        print(message)
        while True:
            await asyncio.sleep(1)
            await websocket.send(f'{await get_tm()}')

async def get_tm():
    return random.randint(0, 10);

async def main():
    async with websockets.serve(handler, "localhost", 8000):
        await asyncio.Future()

asyncio.run(main())