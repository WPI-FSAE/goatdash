"""
A Python representation of a CAN message

"""

from operator import attrgetter
from can_config.validation_helper import validator

class Message:

    def __init__(self, canID, extID, name, schema, byteOrder=None):
        """Message constructor"""
        # Message sender canID
        self.canID = canID
        # Message extended id?
        self.extendedID = extID
        # Message name
        self.name = name
        # Message schema
        self.schema = schema
        # Message byte ordering
        self.bigendian = (byteOrder == "BE")

    def __str__(self):
        out = 'Message "%s" (CAN ID %s, ext=%s, %s):\n' % (self.name, hex(self.canID), 'YES' if self.extendedID else 'NO', 'BIG-ENDIAN' if self.bigendian else 'LITTLE-ENDIAN')
        out += str(self.schema)
        return out

    @validator("CAN ID must be nonnegative")
    def __validate_canID__(self):
        is_valid = (
            # Check for valid canID (not negative)
            self.canID >= 0
            # more checks related to canID added here...
        )
        return is_valid
    
    @validator("Name must exist and not be an empty string")
    def __validate_name__(self):
        is_valid = (
            # Check if name exists
            self.name is not None and len(self.name) > 0
            # more checks related to name added here...
        )
        return is_valid

    def validate(self):
        is_valid = (
            self.__validate_canID__() and
            self.__validate_name__() and
            self.schema.validate()           
        )
        return is_valid
