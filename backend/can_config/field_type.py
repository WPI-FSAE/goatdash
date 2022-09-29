"""
Information regarding the data type of a MessageField

see https://docs.python.org/3/library/struct.html

"""

from can_config.validation_helper import validator

class FieldType:
    def __init__(self, name, length, ctype, struct_format):
        """FieldType constructor"""
        # Name of this type
        self.name = name
        # Length of this data type in bytes
        self.length = length
        # Keyword for this data type in C programming language
        self.ctype = ctype
        # The format string specifying the byte layout of this type
        self.struct_format = struct_format

    @validator("Length must be 1-8 bytes")
    def __validate_len__(self):
        return self.length is not None and self.length <= 8 and self.length > 0

    @validator("Name must be not null and not empty")
    def __validate_name__(self):
        return self.name is not None and len(self.name) > 0

    @validator("Underlying types should be defined (both ctype and struct_format)!")
    def __validate_types__(self):
        return self.ctype is not None and self.struct_format is not None

    def validate(self):
        return (self.__validate_len__() and
            self.__validate_name__() and
            self.__validate_types__())

    def __str__(self):
        return "Field Type w. name %s" % self.name