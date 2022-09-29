"""
A Python representation of a message schema.
This can be either inline-declared in a message or separately in the schema section of the JSON config

"""

from operator import attrgetter
from can_config.validation_helper import validator

class MessageSchema:

    def __init__(self, name, length, body):
        """Message schema constructor"""
        # Schema name
        self.name = name
        # Schema length
        self.length = length
        # Schema structure, a list of one or more MessageFields
        self.body = body

    def __str__(self):
        out = 'Message Schema "%s" (%d bytes):\n' % (self.name, self.length)
        for field in sorted(self.body, key=attrgetter('start_index')):
            out += str(field) + '\n'
        return out

    @validator("Name must exist and not be an empty string")
    def __validate_name__(self):
        is_valid = (
            # Check if name exists
            self.name is not None and len(self.name) > 0
            # more checks related to name added here...
        )
        return is_valid

    @validator("Length of fields must not exceed the length of the message; length must be at most 8 bytes")
    def __validate_length__(self):
        is_valid = (
            # Ensure Message length is greater than or equal to sum of field lengths
            self.length >= sum(field.lengthBytes() for field in self.body) and
            # more checks related to length added here...
            self.length <= 8
        )
        return is_valid

    @validator("There must not be any overlapping message fields within the message, and all fields must be valid!")
    def __validate_body__(self):
        # Ensure that each message field is valid and not overlapping one another
        next_index = 0
        for msgfield in sorted(self.body, key=attrgetter('start_index')):
            if (not msgfield.validate() or msgfield.start_index < next_index):
                return False
            else:
                next_index = msgfield.start_index + msgfield.lengthBytes()

        is_valid = (
            # Ensure Message body is not empty
            self.body
            # more checks related to body added here...
        )
        return is_valid

    def validate(self):
        is_valid = (
            self.__validate_name__() and
            self.__validate_length__() and
            self.__validate_body__()            
        )
        return is_valid