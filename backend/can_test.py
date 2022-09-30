import can
from parser import Parser

can.rc['interface'] = 'socketcan'
can.rc['channel'] = 'can1'

from can.interface import Bus

bus = Bus()

parser = Parser()

for msg in bus:
    msgdef = parser.getMsg(msg.arbitration_id)
    if hasattr(msgdef, 'name') and msgdef.name == 'DTI_TelemetryA':
        msg = parser.parse(msg)
        print(msg)
