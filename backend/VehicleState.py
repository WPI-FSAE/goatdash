# WPI FSAE Vehicle State Persistance
# Ted Clifford (c) 2023
#
# This module provides a collection of methods to write vehicle state to disk (i.e. odometer)

import asyncio
import json

class VehicleState:

    def __init__(self, vehicle, logger, state_file, period=10):
        self.vic = vehicle
        self.dbg = logger
        self.state_file = state_file
        self.period = period


    async def store_tm(self):
        while True:
            await self.write_state()
            await asyncio.sleep(self.period) # state update refresh


    async def write_state(self):
        with open(self.state_file, 'w') as f:
            f.write(json.dumps({'odometer': round(self.vic.odometer, 3), 'trip': round(self.vic.trip, 3)}))
        
        self.dbg.put_msg("[BACKEND] Writing vehicle state.")

    
    def load_tm(self):
        try:
            with open(self.state_file, 'r') as f:
                car_state = json.load(f)
                
                self.vic.odometer = car_state['odometer']
        except:
            self.dbg.put_msg("[BACKEND] ERR State file not found: " + self.state_file)