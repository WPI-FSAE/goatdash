#!/usr/bin/env python

import can
import configparser
import struct
import time

# Load config
config = configparser.ConfigParser()
config.read('/home/pi/EV22-Dashboard/backend/config.ini')

can.rc['interface'] = config['CAN']['Interface']
can.rc['channel'] = config['CAN']['Channel'] 

def send_dti_a(bus, spd, v):

    spd = int(spd / 0.0015763099)
    data = struct.pack('>IHH', spd, 0, v)
    msg = can.Message(
        arbitration_id=6, data=data, is_extended_id=True
    )
    try:
        bus.send(msg)
    except can.CanError:
        print("msg not sent")

def send_dti_b(bus, dc):
    
    dc = dc * 10
    data = struct.pack('>HHI', 0, dc, 0)
    msg = can.Message(
        arbitration_id=262, data=data, is_extended_id=True
    )
    try:
        bus.send(msg)
    except can.CanError:
        print("msg not sent")
        
if __name__ == "__main__":
    with can.Bus() as bus:
        spd = 0
        spd_d = 1

        dc = 0
        dc_d = 1

        while True:
        
            if spd >= 100:
                spd_d = -1
            elif spd <= 0:
                spd_d = 1

            if dc >= 150:
                dc_d = -1
            elif dc <= 0:
                dc_d = 1

            spd += spd_d
            dc += dc_d

            send_dti_a(bus, spd, 100)
            send_dti_b(bus, dc)
            time.sleep(.1)
    
