# WPI FSAE Dashboard Backend
# Ted Clifford (c) 2023
#
# Runner for GOATDash backend.

import asyncio
import argparse
import backend

# Arg parse configuration
parser = argparse.ArgumentParser(
    prog = 'GOATDashTMServer',
    description = 'EV22 Dashboard Telemetry Server')
parser.add_argument('-c', '--config', default='./config.ini')
parser.add_argument('-s', '--state', default='./car_state.json')
parser.add_argument('-t', '--test', action='store_true')
args = parser.parse_args()

# Start dashboard in eventloop
db = backend.DashboardBackend(is_test=args.test, cfg_file=args.config, state_file=args.state)
asyncio.run(db.start())