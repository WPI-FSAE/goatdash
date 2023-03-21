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
        can.rc['channel'] = channel

        self.bus = Bus(receive_own_messages=True)
        self.parser = parser.Parser()

        self.last_time = datetime.utcnow()
        self.start_time = self.last_time


    # Read message from can bus, update internal state,
    async def get_tm(self):
    
        msg = self.bus.recv(.01)

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

            elif hasattr(msgdef, 'name') and msgdef.name == 'DTI_TelemetryB':
                msg = self.parser.parse(msg)
                self.vic.amps = round(msg.DCDeciAmps / 10.0, 1)

                self.vic.amps_max["draw"] = max(self.vic.amps, self.vic.amps_max["draw"])
                self.vic.amps_max["regen"] = min(self.vic.amps, self.vic.amps_max["regen"])

        
            elif hasattr(msgdef, 'name') and msgdef.name == 'DTI_TelemetryC':
                msg = self.parser.parse(msg)

                self.temps["inv"] = round(msg.controllerTempDeciCelcius / 10.0, 1)
                self.temps["mtr"] = round(msg.motorTempDeciCelcius / 10.0, 1)

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

                self.vic.accel_x = msg.AccelX
                self.vic.accel_y = msg.AccelY

                self.vic.accel_max["rt"] = max(self.vic.accel_x, self.vic.accel_max["rt"])
                self.vic.accel_max["lt"] = abs(min(self.vic.accel_x, -1 * self.vic.accel_max["lt"]))
                self.vic.accel_max["fr"] = max(self.vic.accel_y, self.vic.accel_max["fr"])
                self.vic.accel_max["rr"] = abs(min(self.vic.accel_y, -1 * self.vic.accel_max["rr"]))

            elif hasattr(msgdef, 'name') and msgdef.name == "FrontIO_Heartbeat":
                msg = self.parser.parseBitfield(msg, "FrontIO_StatusFlags")

                self.vic.rtd = bool(msg.ReadyToDrive)



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
