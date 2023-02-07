import can
import configparser
import struct

# Load config
config = configparser.ConfigParser()
config.read('/home/pi/EV22-Dashboard/backend/config.ini')

can.rc['interface'] = config['CAN']['Interface']
can.rc['channel'] = 'can1' 
can.rc['receive_own_messages'] = True


def main():
    filters = [{"can_id": 0x6, "can_mask": 0xFF, "extended": True}]
    with can.Bus(can_filters=filters) as bus:
        print_listener = can.Printer()
        can.Notifier(bus, [print_listener])

        while (1):
            pass

def loop():
    with can.Bus() as bus:
        while(1):

            print(bus.recv())

if __name__ == "__main__":
    main()
