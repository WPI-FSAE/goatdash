import sys, os
sys.path.append(os.path.dirname(os.path.realpath(__file__)) + "/can_config")
from can_config.main import getConfiguration
import bitstruct
from operator import attrgetter
from collections import namedtuple
from struct import unpack

class Parser:

    def __init__(self):
        self.model = getConfiguration()
        self.msgdefs = {}

        for msg in self.model.messages:
            self.msgdefs[msg.canID] = msg
    
    def parse(self, message):
        msgdef = self.getMsg(message.arbitration_id)
        if msgdef == 0: return

        if msgdef.bigendian:
            format = '>'
        else:
            format = '<'

        for field in sorted(msgdef.schema.body, key=attrgetter('start_index')):
            if (hasattr(field, 'field_type')):
                format += field.field_type.struct_format
            else:
                format += 'B'
        M = namedtuple(msgdef.name, [f.name for f in sorted(msgdef.schema.body, key=attrgetter('start_index'))])
        return M(*unpack(format, message.data))

    def getMsg(self, i):
        return self.msgdefs[i]

    def parseBitfield(self, msg, name):
        """
        msg: can message type
        name: name of bitfield
        """
        msgDef = self.getMsg(msg.arbitration_id)

        for field in msgDef.schema.body:
            if (hasattr(field, 'name') and field.name == name):
                M = namedtuple(field.name, [f.name for f in sorted(field.field_entries, key=attrgetter('start_bit'))])
                
                data = unpack('<' + 'x' * field.start_index + \
                                    'B' * field.length_bytes + \
                                    'x' * (len(msg.data) - (field.start_index + field.length_bytes)), \
                                    msg.data)[0]

                fields = [((data >> f.start_bit) & (0xFF >> (8 - f.entry_type.length))) for f in field.field_entries]
                return M(*fields)