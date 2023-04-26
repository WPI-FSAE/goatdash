# WPI FSAE Vehicle Interface
# Ted Clifford (c) 2023
#
# This module provides a collection of methods to interface with the vehicle's CAN

import asyncio
from datetime import datetime
import time
import random
import can
from can.interface import Bus
import parser
import websockets
import json

CAN_FILTER = [{'can_id': 6, 'can_mask': 0xFFFF, 'extended': True},      # DTI A
              {'can_id': 262, 'can_mask': 0xFFFF, 'extended': True},    # DTI B
              {'can_id': 518, 'can_mask': 0xFFFF, 'extended': True},    # DTI C
              {'can_id': 35, 'can_mask': 0xFFFF, 'extended': True},     # BMS
              {'can_id': 21, 'can_mask': 0xFFFF, 'extended': True},     # GPS
              {'can_id': 22, 'can_mask': 0xFFFF, 'extended': True},     # IMU
              {'can_id': 82, 'can_mask': 0xFFFF, 'extended': True},     # Battery Pct
              {'can_id': 31, 'can_mask': 0xFFFF, 'extended': True},     # FrontIO
              #{'can_id': 32, 'can_mask': 0xFFFF, 'extended': True},     # RearIO
              ]

# Generic vehicle interface
class VehicleInterface:

    def __init__(self, vehicle, logger, race, refresh=60):
        self.vic = vehicle
        self.dbg = logger
        self.race = race
        self.refresh = refresh

    async def start_tm(self):
        while True:
            await self.get_tm()
            await asyncio.sleep(1 / self.refresh)   # backend tm refresh rate
        


# CAN Interface
class CANVehicleInterface(VehicleInterface):
    
    def __init__(self, vehicle, logger, race, interface="socketcan", channel="can0", refresh=60):

        super().__init__(vehicle, logger, race, refresh)

        can.rc['interface'] = interface
        # can.rc['channel'] = channel

        self.bus0 = Bus('can0', receive_own_messages=True, can_filters=CAN_FILTER)
        self.bus1 = Bus('can1', receive_own_messages=True, can_filters=CAN_FILTER)

        self.parser = parser.Parser()

        self.last_time = datetime.utcnow()
        self.start_time = self.last_time


    def handle_msg(self, msg):
        
        if msg != None:
            msgdef = self.parser.getMsg(msg.arbitration_id)
            
            if hasattr(msgdef, 'name') and msgdef.name == 'DTI_TelemetryA':
                msg = self.parser.parse(msg)
                erpm = msg.ERPM
                self.vic.rpm = erpm // 10;
                speed = erpm * 0.0015763099 # erpm to mph
                
                self.vic.inv_voltage = msg.inputVoltage

                nowtime = datetime.utcnow()
                dt = nowtime - self.last_time
                dx = speed * (dt.total_seconds() / 3600)
                self.vic.odometer += dx
                self.vic.trip += dx

                self.last_time = nowtime
                
                self.vic.speed = round(speed, 1)
                
                # Check for movement if lapping armed
                if (self.race.is_ready()):
                    if (self.vic.speed > .1):
                        if (self.race.waiting()):
                            self.race.start_race()


            elif hasattr(msgdef, 'name') and msgdef.name == 'DTI_TelemetryB':
                msg = self.parser.parse(msg)
                self.vic.amps = round(msg.DCDeciAmps / 10.0, 1)

                self.vic.amps_max["draw"] = max(self.vic.amps, self.vic.amps_max["draw"])
                self.vic.amps_max["regen"] = min(self.vic.amps, self.vic.amps_max["regen"])

        
            elif hasattr(msgdef, 'name') and msgdef.name == 'DTI_TelemetryC':
                msg = self.parser.parse(msg)

                self.vic.temps["inv"] = round(msg.controllerTempDeciCelcius / 10.0, 1)
                self.vic.temps["mtr"] = round(msg.motorTempDeciCelcius / 10.0, 1)

            elif hasattr(msgdef, 'name') and msgdef.name == 'BMS_Information' and msgdef.schema.length == len(msg.data):
                msg = self.parser.parse(msg)
                
                self.vic.cell_voltages["avg"] = round((msg.AvgCellVoltage * 0.01) + 2, 2)
                self.vic.cell_voltages["min"] = round((msg.MinCellVoltage * 0.01) + 2, 2)
                self.vic.cell_voltages["max"] = round((msg.MaxCellVoltage * 0.01) + 2, 2)

                self.vic.temps["acc"] = msg.MaxCellTemperature

            elif hasattr(msgdef, 'name') and msgdef.name == 'GPSFix':
                msg = self.parser.parse(msg)

                self.vic.long = msg.Longitude
                self.vic.lat = msg.Latitude

            elif hasattr(msgdef, 'name') and msgdef.name == 'IMUAccel':
                msg = self.parser.parse(msg)

                self.vic.accel_x = msg.AccelX / 9.8
                self.vic.accel_y = msg.AccelY / 9.8
                self.vic.accel_max["rt"] = max(self.vic.accel_x, self.vic.accel_max["rt"])
                self.vic.accel_max["lt"] = abs(min(self.vic.accel_x, -1 * self.vic.accel_max["lt"]))
                self.vic.accel_max["fr"] = max(self.vic.accel_y, self.vic.accel_max["fr"])
                self.vic.accel_max["rr"] = abs(min(self.vic.accel_y, -1 * self.vic.accel_max["rr"]))

            elif hasattr(msgdef, 'name') and msgdef.name == "FrontIO_Heartbeat":
                msg = self.parser.parseBitfield(msg, "FrontIO_StatusFlags")

                self.vic.rtd = bool(msg.ReadyToDrive)
            
            elif hasattr(msgdef, 'name' and msgdef.name == 'Battery_Percent'):
                msg = self.parser.parse(msg)

                self.vic.batt_pct = msg.Percent

    # Read message from can bus, update internal state,
    async def get_tm(self):
    
        msg0 = self.bus0.recv(0)
        msg1 = self.bus1.recv(0) 
        self.handle_msg(msg0)
        self.handle_msg(msg1)
        

# Provides an interface for remote server.
class RemoteVehicleInterface(VehicleInterface):

    def __init__(self, vehicle, logger, race, uri, refresh=60):
        super().__init__(vehicle, logger, race, refresh)
        self.uri = uri
        self.websocket = None
 
    async def start_tm(self):
        try:
            async with websockets.connect(self.uri) as websocket:
                self.websocket = websocket
                await self.websocket.send("START_GROUND_STATION")
                self.dbg.put_msg("[BACKEND] Connected to Remote TM Server.")
                self.vic.remote = True
                while(True):
                    await self.get_tm()
                    await asyncio.sleep(1 / self.refresh)

        except Exception as e:
            self.dbg.put_msg("[BACKEND] Unable to connect to remote:\n" + str(e))
            self.vic.remote = False
            return False
 
    # Read message from can bus, update internal state,
    async def get_tm(self):
        print("Get remote tm...")

        async for msg in self.websocket:
            tm = json.loads(msg)

            self.vic.speed = tm['speed']
            self.vic.inv_voltage = tm['inv_volts']
            self.vic.amps = tm['dc_amps']
            self.vic.accel_x = tm['f_x']
            self.vic.accel_y = tm['f_y']
            self.vic.cell_voltages = {'avg': tm['avg_cell'], 'min': tm['min_cell'], 'max': tm['max_cell']}
            self.vic.temps = {'acc': tm['acc_temp'], 'inv': tm['inv_temp'], 'mtr': tm['mtr_temp']}
            self.vic.odometer = tm['odometer']
            self.vic.trip = tm['trip']
            self.vic.rtd = tm['rtd']
            self.vic.fault = tm['fault']
            self.vic.amps_max = {'draw': tm['peak_amps'], 'regen': tm['peak_regen']}
            self.vic.range_est = {'mi': tm['mi_est'], 'lap': tm['lap_est'], 'time': tm['time_est']}
            self.vic.batt_pct = tm['batt_pct']
            self.vic.accel_max = {'fr': tm['max_fr'], 'rr': tm['max_rr'], 'lt': tm['max_lt'], 'rt': tm['max_rt']}
    
            await asyncio.sleep(1 / self.refresh)
                    

# Provide a virtual vehicle interface for testing.
# Random values are generated for demonstration purposes.
# Time delays between messages are emulated.
class VirtualVehicleInterface(VehicleInterface):

    def __init__(self, vehicle, logger, race, refresh=60):
        super().__init__(vehicle, logger, race, refresh)

        self.last_time = datetime.utcnow()
        self.start_time = self.last_time

        # Testing only
        self.dc_amps_dir = 1
        self.spd_dir = 1


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
