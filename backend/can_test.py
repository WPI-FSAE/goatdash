import can
from parser import Parser

can.rc['interface'] = 'socketcan'
can.rc['channel'] = 'can1'

from can.interface import Bus

bus = Bus()

parser = Parser()

for msg in bus:
    # print(msg.arbitration_id)
    msgdef = parser.getMsg(msg.arbitration_id)
    print(msgdef)
    msg = parser.parse(msg)
    print(msg)
