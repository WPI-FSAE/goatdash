import can

can.rc['interface'] = 'socketcan'
can.rc['channel'] = 'can0'

from can.interface import Bus

bus = Bus()

for msg in bus:
    print(msg.data)
