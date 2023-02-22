import websockets
import asyncio
import json
import configparser
from datetime import datetime
import time
from Race import Race
from Vehicle import Vehicle
from Debug import Debug

# Testing only
import random

CLIENT_REFRESH = 0
CAN_REFRESH = 0
STATE_REFRESH = 0

# Frontend state
DASH = 0
GPS = 1
CHARGE = 2
DEBUG = 3

class VehicleInterface:
    
    def __init__(self):

        # Load config
        config = configparser.ConfigParser()
        config.read('./config.ini')
        self.PORT = int(config['TEST']['Port'])

        # Start debug logging
        self.dbg = Debug(0)
    
        # TM Values
        self.vic = Vehicle()
        self.db_state = DASH

        self.last_time = datetime.utcnow()
        self.start_time = self.last_time

        # Load persistant car data
        try:
            with open('car_state_test.json', 'r') as f:
                car_state = json.load(f)
                
                self.vic.odometer = car_state['odometer']
        except:
            self.dbg.put_msg("[BACKEND] ERR State file not found.")

        # Lapping
        self.race = Race(0)

        # Testing only
        self.dc_amps_dir = 1
        self.spd_dir = 1

    ######
    # WS #
    ######
    async def db_message_handler(self, websocket):
        """
        Handle incoming websocket messages from dashboard
        """

        async for message in websocket:
            self.dbg.put_msg(f'[BACKEND] RECEIVED: {message}')

            if message == 'START_DASH':
                # Create new coroutine serving tm data to ws
                asyncio.create_task(self.send_tm(websocket))
            else:
                # Handle incoming command
                try:
                    data = json.loads(message)
                except:
                    self.dbg.put_msg("[BACKEND] ERR Ill formatted message: ", message)
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
                elif (data['opt'] == "SET_LAP"):
                    await websocket.send(json.dumps({"lap_total": data["laps"]}))
                    self.race.set_lap_n(data["laps"])
                elif (data['opt'] == "SET_LAP_WP"):
                    self.race.update((self.vic.lat, self.vic.long), self.vic.inv_voltage)
                elif (data['opt'] == 'ARM_LAP'):
                    self.race.set_ready(True)
                elif (data['opt'] == 'RESET_LAP'):
                    self.race.reset_race()
                elif (data['opt'] == 'SET_STATE'):
                    self.db_state = data['state']

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

            if (self.db_state == DASH):
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
                                    'max_rt': round(self.vic.accel_max["rt"], 1)}}

            elif (self.db_state == GPS):
                if (i == 1):
                    pkt = {**pkt, **{'lat': self.vic.lat,
                                     'long': self.vic.long,
                                     'lap_armed': self.race.is_ready()}}

            elif (self.db_state == DEBUG):
                if (self.dbg.msg_avail()):
                    pkt = {**pkt, **{'dbg_msgs': self.dbg.get_msgs(1)}}

            if (i >= 99):
                i = 0
            else:
                i += 1
            
            await websocket.send(json.dumps(pkt))
            await asyncio.sleep(.005)    # Define frontend refresh rate


    #######
    # CAN #
    #######
    async def poll_tm(self):
        while True:
            await self.get_tm()
            await asyncio.sleep(.005)   # backend tm refresh rate

    # Read message from can bus, update internal state,
    async def get_tm(self):
        
        # Simulate waiting for message
        # Each message type 'read' every .1s avg
        time.sleep(.01) # simulate can reading (blocking)

        rand_msg_type = random.randint(0, 3)

        self.vic.speed = self.vic.speed + (.3 * self.spd_dir)

        if self.vic.speed > 80:
            self.spd_dir = -1

        if self.vic.speed < 0:
            self.spd_dir = 1

        # Simulate force readings
        rand_move = random.randint(-1, 1)
        self.vic.accel_x += rand_move * .01

        if (abs(self.vic.accel_x) > 1):
            self.vic.accel_x = 0

        if (self.vic.accel_x > self.vic.accel_max["rt"]):
            self.vic.accel_max["rt"] = self.vic.accel_x

        if (self.vic.accel_x < -1 * self.vic.accel_max["lt"]):
            self.vic.accel_max["lt"] = abs(self.vic.accel_x)

        rand_move = random.randint(-1, 1)
        self.vic.accel_y += rand_move * .01

        if (abs(self.vic.accel_y) > 1):
            self.vic.accel_y = 0

        if (self.vic.accel_y > self.vic.accel_max["fr"]):
            self.vic.accel_max["fr"] = self.vic.accel_y

        if (self.vic.accel_y < -1 * self.vic.accel_max["rr"]):
            self.vic.accel_max["rr"] = abs(self.vic.accel_y)

        # Simulate lat/long
        self.lat = 70
        self.long = -40
        
        # Check for movement if lapping armed
        if (self.race.is_ready()):
            if (self.vic.speed > .1):
                if (self.race.waiting()):
                    self.race.start_race()

        # DTI_TelemetryA
        if rand_msg_type == 0:
            self.vic.erpm = random.randint(0, 100000)
            # speed = rpm * 0.0015763099 # erpm to mph
            
            self.vic.inv_voltage = random.randint(0, 100)
            now_time = datetime.utcnow()
            dt = now_time - self.last_time

            dx = self.vic.speed * (dt.total_seconds() / 3600)
            self.vic.odometer += dx
            self.vic.trip += dx

            self.last_time = now_time
            
        # DTI_TelemetryB
        elif rand_msg_type == 1:

            rand_scalar = random.randint(-1, 2)
            self.vic.amps += self.dc_amps_dir * rand_scalar

            if self.vic.amps > 150:
                self.dc_amps_dir = -1
            
            if self.vic.amps < -50:
                self.dc_amps_dir = 1

            if self.vic.amps > self.vic.amps_max["draw"]:
                self.vic.amps_max["draw"] = self.vic.amps
            
            if self.vic.amps < self.vic.amps_max["regen"]:
                self.vic.amps_max["regen"] = self.vic.amps

            self.vic.temps["acc"] = 90
            self.vic.temps["inv"] = 110
            self.vic.temps["mtr"] = 74

            self.vic.rtd = True
            self.vic.fault = False

        # BMS_Information
        elif rand_msg_type == 2:
            self.vic.cell_voltages["avg"] = round(((random.randint(0, 10)) * 0.01) + 2, 2)
            self.vic.cell_voltages["min"] = round(((random.randint(5, 10)) * 0.01) + 2, 2)
            self.vic.cell_voltages["max"] = round(((random.randint(0, 10)) * 0.01) + 2, 2)

    #########
    # STATE #
    #########
    async def store_tm(self):
        while True:
            await self.write_state()
            await asyncio.sleep(10) # state update refresh

    async def write_state(self):
        with open('car_state_test.json', 'w') as f:
            f.write(json.dumps({'odometer': round(self.vic.odometer, 3), 'trip': round(self.vic.trip, 3)}))
        
        self.dbg.put_msg("[BACKEND] Writing vehicle state.")


    #########
    # START #
    #########
    async def start(self):
        
        # Start polling CAN
        asyncio.create_task(self.poll_tm())

        # Start writing state
        asyncio.create_task(self.store_tm())

        # Start listening for connections
        async with websockets.serve(self.db_message_handler, "localhost", 8000):
            await asyncio.Future()


vi = VehicleInterface()
asyncio.run(vi.start())