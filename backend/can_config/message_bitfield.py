"""
Python objects for representing bitfield message field types
"""

from operator import attrgetter
from can_config.validation_helper import validator

class MessageBitField:
    """A Message field, but with names set for individual bits / bit ranges
    """

    def __init__(self, name, start_index, length_bytes, field_entries):
        self.name = name
        self.start_index = start_index
        self.length_bytes = length_bytes
        self.field_entries = field_entries

    def lengthBytes(self):
        return self.length_bytes

    @validator("Length must be 1-8 bytes")
    def __validate_len__(self):
        return self.length_bytes is not None and self.length_bytes <= 8 and self.length_bytes > 0

    @validator("Name must be nonzero lenght and not null")
    def __validate_name__(self):
        return self.name is not None and len(self.name) > 0

    @validator("Name must be nonnegative")
    def __validate_start__(self):
        return self.start_index is not None and self.start_index >= 0

    @validator("Bitfield bit ranges can't overlap, and all field entries must also be valid!")
    def __validate_overlap__(self):
        next_index = 0
        for bitfieldentry in sorted(self.field_entries, key=attrgetter('start_bit')):
            if (not bitfieldentry.validate() or bitfieldentry.start_bit < next_index):
                return False
            else:
                next_index = bitfieldentry.start_bit + bitfieldentry.entry_type.length

        return True

    @validator("Bitfield entries can't exceed length!")
    def __validate_exceed_bounds__(self):
        last = sorted(self.field_entries, key=attrgetter('start_bit'))[-1]

        return last.start_bit + last.entry_type.length <= self.length_bytes*8

    def validate(self):
        return (self.__validate_len__() and
            self.__validate_name__() and
            self.__validate_start__() and
            self.__validate_overlap__() and
            self.__validate_exceed_bounds__())

    def __str__(self):
        return (' -> [@%d]: %s (BIT FIELD)\n' % (self.start_index, self.name)) + '\n'.join([str(x) for x in self.field_entries])

class MessageBitFieldEntry:
    """An entry within a MessageBitField
    """

    def __init__(self, name, entry_type, start_bit):
        self.name = name
        self.entry_type = entry_type
        self.start_bit = start_bit

    @validator("Start bit must be greater than 0")
    def __validate_start__(self):
        return self.start_bit is not None and self.start_bit >= 0

    @validator("Name must be not null")
    def __validate_name__(self):
        return self.name is not None

    @validator("Entry type must be defined")
    def __validate_types__(self):
        return self.entry_type is not None

    def validate(self):
        return (self.__validate_types__() and
            self.__validate_name__() and
            self.__validate_start__())

    def __str__(self):
        return '       [%d]: %s %s' % (self.start_bit, self.entry_type.name, self.name)

class MessageBitFieldPadding(MessageBitFieldEntry):
    """An padding entry within a MessageBitField
    """

    def __init__(self, start_bit, length):
        self.length = length
        super().__init__('', MessageBitFieldEntryType('padding', length, 'unsigned char', 'p' + str(length)), start_bit)

    def __str__(self):
        return '       [%d]: %d-bit paddding' % (self.start_bit, self.length)

class MessageBitFieldEntryType:
    """An entry within a MessageBitField
    """

    def __init__(self, name, length, ctype, py_bitstruct_code):
        self.name = name
        self.py_bitstruct_code = py_bitstruct_code
        self.ctype = ctype
        self.length = length

    @validator("Length of a bitfield type must be 1-8 bits")
    def __validate_len__(self):
        return self.length is not None and self.length < 8 and self.length > 0

    @validator("Name must be nonzero length and not null")
    def __validate_name__(self):
        return self.name is not None and len(self.name) > 0

    @validator("Types (ctype and py_bitstruct_code) must be defined")
    def __validate_types__(self):
        return self.ctype is not None and self.py_bitstruct_code is not None

    def validate(self):
        return (self.__validate_len__() and
            self.__validate_name__() and
            self.__validate_types__())

    def __str__(self):
        return '%s(%s/%s) : %d' % (self.name, self.ctype, self.py_bitstruct_code, self.length)
