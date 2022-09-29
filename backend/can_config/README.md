# CAN-Config-Parsing
Contains the configuration and configuration parsing code for the 2020-2021 FSAE vehicle CAN networks. At a high level, the `config.json` file defines all of the messages, and the `main.py` parses the config file, validates it, and makes it accessible to other Python scripts that wish to interpret the data (such as [UniCAN](https://github.com/WPI-FSAE/uni-can) or the [Data Logger](https://github.com/WPI-FSAE/EV21-Datalogger)).

## The structure of the `config.json`
An annotated example:
```js
{
    "Messages": [
        /* This block is where all messages should be listed */
        {
            "canID": 1, // CAN Message ID
            "extendedID": true, // true = 29 bit address
                                // false = 11 bit address
            "name": "TestMessage", // Message name (in software)
            "length": 3, // # of bytes in message payload
            "byteordering": "LE", // LE = little-endian byte ordering
                                  // BE = big-endian byte ordering

            "body": [
                /* The order of fields in the message */
                {
                    // This is a normal, 2 byte field named 'test'
                    "type": "uint16",
                    "name": "test",
                    "start": 0
                },
                {
                    "type": "bitfield", // this sets the type to a bit field. 
                    "start": 2, // starting index is 2, since it 
                                // starts after the uint16 which 
                                // is 2 bytes
                    "length": 1,
                    "name": "testflags",
                    "bits": [
                        /* Definition of every bit in the field */
                        {"start": 0, "type": "bool", "name": "A"},
                        {"start": 1, "type": "bool", "name": "B"},
                        {"start": 2, "type": "bool", "name": "C"},
                        {"start": 3, "type": "bool", "name": "D"},
                        {"start": 4, "type": "bool", "name": "E"},
                        {"start": 5, "type": "bool", "name": "F"},
                        {"start": 6, "type": "bool", "name": "G"},
                        {"start": 7, "type": "bool", "name": "H"}
                    ]
                },
                {
                    "canID": 2,
                    "extendedID": true,
                    "name": "DTI_SetMaxCurrentAC",
                    /* This message uses a schema instead of an inline body and length */
                    "schema": "DTI_CurrentLimit",
                    "byteordering": "BE"
                }
            ]
        },
        
    ],
    "Schemas": {
        /* Allows you to re-use body structures in multiple messages */
        "DTI_CurrentLimit": {
            "length": 2,
            "body": [
                {
                    "type": "int16",
                    "name": "deciAmps",
                    "start": 0
                }
            ]
        }
    },
    "Types": {
        /* This block defines all data types */
        "uint16": {
            "length": 2,
            "ctype": "uint16_t", // in c, substitute "uint16" for "uint16_t"
            "pythonStructType": "H" // in Python `struct` library, 'H'
                                    // is the code for 16-bit unsigned
        }
        
    },
    "BitFieldTypes": {
        /* This block defines all bitfield data types */
        "bool": {
            "length": 1,
            "ctype": "unsigned char", // in c bitstructs, use this as the type
            "pythonBitStructType": "b1" // in Python `bitstruct` library, 'b1'
                                        // is the code for 1-bit bool
        },
    }
}
```

## Validating the config file
Once you've made changes to the config file, you can check that its valid by running `python3 main.py`. If it is valid, it will print out a textual representation of the config and add `[OK]: Validation Passed` on the last line.