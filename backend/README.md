# Dashboard Display Telemetry Server

Provides a websocket interface for the Dashboard frontend to communicate with the car and read telemetry from the CAN bus.

Configuration should be done from ```config.ini```

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

Currently, the ```../start.sh``` script is configured to run on boot, and starts a TM server in the background.

## Test Server

```test_server.py``` emulates a live telemetry server without an active CAN bus. This is useful for testing the frontend with dummy values on a Windows machine, for example. The interface is the same as ```tm_server.py```.

```
python test_server.py
```
