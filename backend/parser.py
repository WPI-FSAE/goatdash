from can_config.main import getConfiguration
import bitstruct
from operator import attrgetter
from struct import unpack

class Parser:

    def __init__(self):
        self.model = getConfiguration()
    
    def parse(self, message):
        msgdef = self.getMsg(message.arbitration_id)
        if msgdef == 0: return
        format = '<'
        for field in sorted(msgdef.schema.body, key=attrgetter('start_index')):
            if (hasattr(field, 'field_type')):
                format += field.field_type.struct_format
            else:
                format += 'B'
        print(format)
        print(message.data)
        return unpack(format, message.data[-msgdef.schema.length:])

    def getMsg(self, i):
        for msg in self.model.messages:
            if msg.canID == i:
                return msg
        return 0

    def parseBitfield(self, field, msgdef):
        print('not implemented')