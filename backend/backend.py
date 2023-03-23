# WPI FSAE Dashboard Backend
# Ted Clifford (c) 2023
#
# This module provides a fully functional telemetry backend to serve a dashboard frontend

import asyncio
import websockets
import configparser
import race
import vehicletelemetry
import messagebuffer
import dashboardinterface
import vehicleinterface
import vehiclestate

class DashboardBackend:

    def __init__(self, is_test=False, cfg_file='./config.ini', state_file='./car_state.json', debug=False):
        cfg = configparser.ConfigParser()
        cfg.read(cfg_file)

        # Instantiate logging, telemetry
        self.dbg = messagebuffer.MessageBuffer(int(cfg['DEFAULT']['DebugBufferSize']), debug=debug)
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
        async with websockets.serve(self.dash.message_handler, port=self.PORT):
            self.dbg.put_msg("[BACKEND] Server started.")
            await asyncio.Future()


if __name__ == '__main__':
    import argparse

    # Arg parse configuration
    parser = argparse.ArgumentParser(
        prog = 'py backend.py',
        description = 'EV22 Dashboard Telemetry Server')
    parser.add_argument('-c', '--config', default='./config.ini', help='Location of config file for backend (i.e. config.ini)')
    parser.add_argument('-s', '--state', default='./car_state.json', help="Location of vehicle state persistance file (i.e. car_state.json)")
    parser.add_argument('-t', '--test', action='store_true', help='Enable test interface (no CAN interaction, simulated telemetry)')
    parser.add_argument('-d', '--debug', action='store_true', help='Enable debug messages over debug interface')
    args = parser.parse_args()

    # Start dashboard in eventloop
    db = DashboardBackend(is_test=args.test, cfg_file=args.config, state_file=args.state, debug=args.debug)
    asyncio.run(db.start())
