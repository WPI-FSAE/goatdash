# WPI FSAE Backend Dashboard Interface
# Emily Kelley(c) 2023
#
# This module provides a collection of methods to interface with a remote telemetry frontend over a websocket and modem

import websockets
import asyncio
import json

class RemoteInterface:

    def __init__(self, vehicle, logger, race, uri, refresh=60, is_remote=False):
        self.vic = vehicle
        self.dbg = logger
        self.race = race
        self.refresh = refresh
        self.websocket = None
        self.uri = uri
        self.is_remote = is_remote 

    async def connect(self):
        if not self.is_remote:
            try:
                async with websockets.connect(self.uri) as websocket:
                    self.websocket = websocket
                    self.dbg.put_msg("[BACKEND] Connected to Remote TM Server.")
                    self.vic.remote = True
                    await self.send_tm(websocket)
                    await asyncio.Future()
            except Exception as e:
                self.dbg.put_msg("[BACKEND] Unable to connect to remote:\n" + str(e))
                return False
        
        
    async def send_tm(self, websocket):
        """
        Maintain telemetry connection with remote telemetry server
        """

        while True:
            pkt = {}

            # Packet type switching (allows for some values to updated faster than others)
            pkt = {**pkt, **{'rpm': self.vic.erpm // 2, 
                            'speed': round(self.vic.speed, 1), 
                            'inv_volts': self.vic.inv_voltage,
                            'dc_amps': self.vic.amps,
                            'race_time': round(self.race.get_race_time() * 1000),
                            'lap_time': round(self.race.get_lap_time() * 1000),
                            'lap_use': round(self.race.get_lap_volt(), 2),
                            'f_x': self.vic.accel_x,
                            'f_y': self.vic.accel_y,
                            'avg_cell': self.vic.cell_voltages["avg"],
                            'min_cell': self.vic.cell_voltages["min"], 
                            'max_cell': self.vic.cell_voltages["max"],
                            'acc_temp': self.vic.temps["acc"], 
                            'inv_temp': self.vic.temps["inv"],
                            'mtr_temp': self.vic.temps["mtr"],
                            'odometer': round(self.vic.odometer, 1), 
                            'trip': round(self.vic.trip, 3), 
                            'rtd': self.vic.rtd, 
                            'fault': self.vic.fault,
                            'peak_amps': self.vic.amps_max["draw"],
                            'peak_regen': self.vic.amps_max["regen"],
                            'mi_est': self.vic.range_est["mi"],
                            'lap_est': self.vic.range_est["lap"],
                            'time_est': self.vic.range_est["time"],
                            'batt_pct': self.vic.batt_pct,
                            'max_fr': round(self.vic.accel_max["fr"], 1),
                            'max_rr': round(self.vic.accel_max["rr"], 1),
                            'max_lt': round(self.vic.accel_max["lt"], 1),
                            'max_rt': round(self.vic.accel_max["rt"], 1),
                            'lat': self.vic.lat,
                            'long': self.vic.long,
                            'lap_armed': self.race.is_ready(),
                            'dbg_msgs': ""}}

            await websocket.send(json.dumps(pkt))
            await asyncio.sleep(1 / self.refresh)    # Define frontend refresh rate

    def close(self):
         self.websocket = None
         self.vic.remote = False
