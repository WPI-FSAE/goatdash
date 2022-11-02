# Dashboard Display Telemetry Server

Provides a websocket interface for the Dashboard frontend to communicate with the car and read telemetry from the CAN bus.

## Installing Packages

Make sure that the ```can_config``` library is installed using:

```
git submodule init && git submodule update
```

This will pull down the CAN tools necessary for interfacing with the car

Install necessary python packages with:

```
pip install -r requirements.txt
```

## Run the Server

```
python tm_server.py
```

## Configuring Server to Run on Start

This can be done multiple ways, see this StackExchange question for more details: [How to Start an Application Automatically on Boot](https://unix.stackexchange.com/questions/56957/how-to-start-an-application-automatically-on-boot)
