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
python main.py
```

Options:

* `-t`: Test mode (uses virtual car data, not CAN interface)
* `-c <config.ini>`: Use a specific config folder (defaults to `./config.ini`)
* `-s <save_file.json>`: Use a specific car state save file (defaults to `./car_state.json`)

## Configuring Server to Run on Start

This can be done multiple ways, see this StackExchange question for more details: [How to Start an Application Automatically on Boot](https://unix.stackexchange.com/questions/56957/how-to-start-an-application-automatically-on-boot)

Currently, the ```../start.sh``` script is configured to run on boot, and starts a TM server in the background.

## Test Server

 Emulates a live telemetry server without an active CAN bus. This is useful for testing the frontend with dummy values on a Windows machine, for example.

```
python main.py -t -s ./car_state_test.json
```
