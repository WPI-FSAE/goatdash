# WPI FSAE Dashboard Backend
# Ted Clifford (c) 2023
#
# This module provides a fully functional telemetry backend to serve a dashboard frontend

import asyncio
import websockets
import configparser
import race
import vehicletelemetry
import debuglogger
import dashboardinterface
import vehicleinterface
import vehiclestate

class DashboardBackend:

    def __init__(self, is_test=False, cfg_file='./config.ini', state_file='./car_state.json', debug=False):
        cfg = configparser.ConfigParser()
        cfg.read(cfg_file)

        # Instantiate logging, telemetry
        self.dbg = debuglogger.DebugLogger(int(cfg['DEFAULT']['DebugBufferSize']), debug=debug)
        self.vic = vehicletelemetry.VehicleTelemetry()
        self.race = race.Race()

        self.dbg.put_msg("[BACKEND] Initializing server...")

        # Establish mode, production or test. Interface is dependant
        if (is_test):
            cfg_str = 'TEST'
            self.vi = vehicleinterface.VirtualVehicleInterface(self.vic, self.dbg, self.race,
                                                               refresh=int(cfg['DEFAULT']['CANRefresh']))                                           
        else:
            cfg_str = 'PROD'
            self.vi = vehicleinterface.CANVehicleInterface(self.vic, self.dbg, self.race,
                                                           interface=cfg['PROD']['Interface'],
                                                           channel=cfg['PROD']['Channel'],
                                                           refresh=int(cfg['DEFAULT']['CANRefresh']))

        self.PORT = int(cfg[cfg_str]['Port'])

        # Dashboard Interface
        self.dash = dashboardinterface.DashboardInterface(self.vic, self.dbg, self.race,
                                                          refresh=int(cfg['DEFAULT']['ClientRefresh']))

        # State Persistance
        self.state = vehiclestate.VehicleState(self.vic, self.dbg, state_file, period=int(cfg['DEFAULT']['StateSavePeriod']))
        self.state.load_tm()


    async def start(self):
        
        # Start polling vehicle interface for telemetry
        asyncio.create_task(self.vi.start_tm())

        # Start saving vehicle state to disk
        asyncio.create_task(self.state.store_tm())

        # Start listening for connections from dashboard
        async with websockets.serve(self.dash.message_handler, "localhost", self.PORT):
            self.dbg.put_msg("[BACKEND] Server started.")
            await asyncio.Future()