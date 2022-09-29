from can_config.message import Message
from can_config.message_field import MessageField
from can_config.field_type import FieldType
from can_config.model import Model
import os

def getConfiguration():
    with open(os.path.dirname(os.path.abspath(__file__)) + '/config.json') as f:
        m = Model()
        m.loadJSON(f.read())
        m.validate()
        return m

if __name__ == '__main__':
    print(getConfiguration())
    print("[OK]: Validation Passed")
