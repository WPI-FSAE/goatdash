"""
A Python representation of a field in a Message

"""

from can_config.validation_helper import validator

class MessageField:

    def __init__(self, field_type, name, start_index, bit_names=None):
        """MessageField constructor"""
        # MessageField data type (see FieldType)
        self.field_type = field_type
        # MessageField name
        self.name = name
        # MessageField start index (the byte in the Message body the field begins at)
        self.start_index = start_index
        # MessageField bit names (if field_type is a bitset, the names of the bits in the set)
        if bit_names is None:
            self.bit_names = []
        else:
            self.bit_names = bit_names

    def lengthBytes(self):
        return self.field_type.length

    def __str__(self):
        return ' -> [@%d]: %s (type name %s)' % (self.start_index, self.name, self.field_type.name)

    def __validate_field_type__(self):
        is_valid = (
            # Check if field_type exists
            self.field_type is not None
            # more checks related to field_type added here...
        )
        return is_valid

    def __validate_name__(self):
        is_valid = (
            # Check if name exists
            self.name is not None
            # more checks related to name added here...
        )
        return is_valid

    def __validate_start_index__(self):
        is_valid = (
            # Check if start_index is valid (between 0 and 7)
            0 <= self.start_index <= 7
            # more checks related to start_index added here...
        )
        return is_valid

    def __validate_bit_names__(self):
        is_valid = (
            # Ensure length of bit_names does not exceed 8 bits
            len(self.bit_names) <= 8
            # more checks related to bit_names added here...
        )
        return is_valid

    def validate(self):
        is_valid = (
            self.__validate_field_type__() and
            self.__validate_name__() and
            self.__validate_start_index__() and
            self.__validate_bit_names__()
        )
        return is_valid