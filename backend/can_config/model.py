"""
A Python representation of the CAN configuration of the system,
containing all messages and types

"""

import json as j

from can_config.message import Message
from can_config.message_field import MessageField
from can_config.message_bitfield import MessageBitField, MessageBitFieldEntry, MessageBitFieldEntryType, MessageBitFieldPadding
from can_config.message_schema import MessageSchema
from can_config.field_type import FieldType
from operator import attrgetter


class Model:

    def __init__(self):
        """Model constructor"""
        # list of messages used by the system
        self.messages = list()
        # message field type definitions
        self.types = dict()
        # message schemas
        self.messageSchemas = dict()
        # bitfield types
        self.bitfield_types = dict()

    def loadJSON(self, json):
        data = j.loads(json)
        if 'Types' in data:
            self.buildTypes(data['Types'])
        else:
            raise Exception('Bad Config File: no "Types" field in config file')

        if 'BitFieldTypes' in data:
            self.buildBitfieldEntryTypes(data['BitFieldTypes'])

        if 'Schemas' in data:
            self.buildMessageSchemas(data['Schemas'])

        if 'Messages' in data:
            self.buildMessages(data['Messages'])
        else:
            raise Exception(
                'Bad Config File: no "Messages" field in config file')

    def validate(self):
        for message in self.messages:
            if message.validate() == False:
                raise Exception("Invalid Message! (%s)\n[ERROR!] CAN Config Validation Failed" % str(message))
        for typ in self.types.values():
            if typ.validate() == False:
                raise Exception("Invalid Field Type! (%s)\n[ERROR!] CAN Config Validation Failed" % str(typ))
        for btyp in self.bitfield_types.values():
            if btyp.validate() == False:
                raise Exception("Invalid Bitfield sub-type! (%s)\n[ERROR!] CAN Config Validation Failed" % str(btyp))

    def buildTypes(self, typesDict):
        for typeName, typeDef in typesDict.items():
            if typeName == 'bitfield':
                raise Exception('Bitfield type name is reserved for bit fields')

            if typeName in self.types:
                raise Exception('Duplicate type name "%s"' % typeName)

            self.types[typeName] = FieldType(
                typeName, typeDef['length'], typeDef['ctype'], typeDef['pythonStructType'])

    def buildMessages(self, messagesList):
        for msg in messagesList:
            self.messages.append(self.buildMessage(msg))

    def buildMessage(self, message):
        schema = None
        if ('schema' not in message):
            # on-the-fly construct a schema
            schema = self.buildMessageSchema(message['name'], message)
            if (schema.name in self.messageSchemas):
                raise Exception("Message name %s conflicts with predefined schema name %s" % (schema.name, schema.name))
            self.messageSchemas[schema.name] = schema
        elif (message['schema'] not in self.messageSchemas):
            raise Exception("Message %s referenced unknown schema %s" % (message['name'], message['schema']))
        else:
            schema = self.messageSchemas[message['schema']]

        byteOrdering = "LE"
        if ('byteordering' in message):
            byteOrdering = message['byteordering']
        
        return Message(message['canID'], message['extendedID'], message['name'], schema, byteOrder=byteOrdering)

    def buildMessageSchema(self, schemaName, schema):
        fields = []
        for field in schema['body']:
            fields.append(self.buildField(field))

        return MessageSchema(schemaName, schema['length'], fields)

    def buildMessageSchemas(self, schemaList):
        for schema in schemaList:
            builtSchema = self.buildMessageSchema(schema, schemaList[schema])
            self.messageSchemas[builtSchema.name] = builtSchema

    def buildField(self, field):
        if (field['type'] == 'bitfield'):
            return MessageBitField(field['name'], field['start'], field['length'], self.buildBitfieldEntries(field['bits']))
        elif field['type'] not in self.types:
            raise Exception('Unknown type name "%s"' % field['type'])
        else:
            return MessageField(self.types[field['type']], field['name'], field['start'], None)

    def buildBitfieldEntries(self, entries):
        fields = []
        for entry in entries:
            if (entry['type'] not in self.bitfield_types):
                raise Exception('Unknown bitfield type name "%s"' % entry['type'])
            fields.append(MessageBitFieldEntry(entry['name'], self.bitfield_types[entry['type']], entry['start']))
        fields = sorted(fields, key=attrgetter('start_bit'))
        
        # Calculate padding
        anticipatedIndex = 0
        for field in fields:
            if (field.start_bit > anticipatedIndex):
                fields.insert(0, MessageBitFieldPadding(anticipatedIndex, field.start_bit-anticipatedIndex))
            anticipatedIndex = field.start_bit + field.entry_type.length
        fields = sorted(fields, key=attrgetter('start_bit'))
        
        return fields

    def buildBitfieldEntryTypes(self, typesDict):
        for typeName, typeDef in typesDict.items():
            if typeName == 'bitfield':
                raise Exception('Bitfield cannot have nested bitfield')

            if typeName in self.bitfield_types:
                raise Exception('Duplicate bitfield type name "%s"' % typeName)

            self.bitfield_types[typeName] = MessageBitFieldEntryType(
                typeName, typeDef['length'], typeDef['ctype'], typeDef['pythonBitStructType'])

    def __str__(self):
        s = ""
        for m in self.messages:
            s += str(m).rstrip() + '\n'
        return s.rstrip()
