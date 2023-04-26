# WPI FSAE Backend Dashboard Interface
# Ted Clifford (c) 2023
#
# This module provides a collection of methods to interface with a Dashboard frontend over a websocket

import asyncio
import json
import can
import struct

# Frontend state
DASH = 0
GPS = 1
CHARGE = 2
DEBUG = 3

class DashboardInterface:

    def __init__(self, vehicle, interface, logger, race, remote, refresh=60):
        self.vic = vehicle
        self.vi = interface
        self.dbg = logger
        self.race = race
        self.remote = remote
        self.refresh = refresh
        self.state = DASH


    async def message_handler(self, websocket):
        """
        Handle incoming websocket messages from dashboard
        """

        async for message in websocket:
            self.dbg.put_msg(f'[BACKEND] RECEIVED: {message}')
            if message == 'START_DASH':
                # Create new coroutine serving tm data to ws
                asyncio.create_task(self.send_tm(websocket))
            
            elif message == 'START_REMOTE':
                # Attempt to connect to remote server
                asyncio.create_task(self.remote.connect())

            else:
                # Handle incoming command
                try:
                    data = json.loads(message)
                except:
                    self.dbg.put_msg(f'[BACKEND] ERR Ill formatted message: {message}')
                    return

                # Handle message
                if (data['opt'] == "RESET_ODO"):
                    self.vic.odometer = 0

                elif (data['opt'] == "RESET_TRIP"):
                    self.vic.trip = 0

                elif (data['opt'] == "RESET_DRAW"):
                    self.vic.amps_max["draw"] = 0

                elif (data['opt'] == "RESET_REGEN"):
                    self.vic.amps_max["regen"] = 0

                elif (data['opt'] == "RESET_FORCE"):
                    self.vic.accel_max = {'fr': 0, 'rr': 0, 'lt': 0, 'rt':0}

                elif (data['opt'] == "SET_LAP"):
                    await websocket.send(json.dumps({"lap_total": data["laps"]}))
                    self.race.set_lap_n(data["laps"])

                elif (data['opt'] == 'SET_TCS'):
                    bus = 0
                    data = struct.pack('<B', data['strength'])
                    msg = can.Message(arbitration_id=81, data=data, is_extended_id=True)
                    self.vi.send_can_msg(bus, msg)

                elif (data['opt'] == "SET_LAP_WP"):
                    self.race.update((self.vic.lat, self.vic.long), self.vic.inv_voltage)

                elif (data['opt'] == 'ARM_LAP'):
                    self.race.set_ready(True)

                elif (data['opt'] == 'RESET_LAP'):
                    self.race.reset_race()

                elif (data['opt'] == 'SET_STATE'):
                    self.state = data['state']


    async def animate(self, websocket):
        inc = 4
        tick = 1

        while tick > 0:
            await websocket.send(json.dumps({'speed': tick * .6}))
            await asyncio.sleep(.01)

            if tick > 100:
                inc = -4

            tick += inc
        
    async def send_tm(self, websocket):
        """
        Maintain telemetry connection with client
        """

        i = 0

        await self.animate(websocket)

        while True:
            pkt = {}

            # Packet type switching (allows for some values to updated faster than others)
            if (i % 2 == 0):
                
                pkt = {**pkt, **{'rpm': self.vic.erpm // 2, 
                                'speed': round(self.vic.speed, 1), 
                                'inv_volts': self.vic.inv_voltage,
                                'dc_amps': self.vic.amps}}

            if (self.state == DASH):
                if (i % 2 == 1):
                    pkt = {**pkt, **{'race_time': round(self.race.get_race_time() * 1000),
                                     'lap_time': round(self.race.get_lap_time() * 1000),
                                     'lap_use': round(self.race.get_lap_volt(), 2),
                                     'f_x': self.vic.accel_x,
                                     'f_y': self.vic.accel_y}}
                if (i == 1):
                    pkt = {**pkt, **{'avg_cell': self.vic.cell_voltages["avg"],
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
                                    'remote': self.vic.remote}}

            elif (self.state == GPS):
                if (i == 1):
                    pkt = {**pkt, **{'lat': self.vic.lat,
                                     'long': self.vic.long,
                                     'lap_armed': self.race.is_ready()}}

            elif (self.state == DEBUG):
                if (self.dbg.msg_avail()):
                    pkt = {**pkt, **{'dbg_msgs': self.dbg.get_msg()}}

            if (i >= 9):
                i = 0
            else:
                i += 1
            
            await websocket.send(json.dumps(pkt))
            await asyncio.sleep(1 / self.refresh)    # Define frontend refresh rate
