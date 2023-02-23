# WPI FSAE GoatDash Development Guide

#### Updated 2/21/2023

## Project Structure

### Backend

The purpose of the backend is to consume and parse CAN messages to track the state of the vehicle. All data processing, derivation, and state management processes should occur on the backend. This allows the frontend to be near stateless, reducing the processing burden of the single threaded GUI process.

The backend is a Python script that manages multiple asyncronous tasks:

* Reading and parsing CAN messages from vehicle
* Updating frontend
* Processing commands from frontend
* Saving vehicle state to disk
* Additional data processing (i.e. lap tracking)

Each of these tasks are handled by a Python module, all managed by the Backend module.

#### Backend Module

Instantiates task objects, then creates and manages asyncronous coroutines to run these tasks. Processes that function independent of eachother, but need to share data (i.e. telemetry data) should be initialized in backend's `__init__()`. Then, the tasks can be started in backend's `start()`, either lone standing or in a coroutine.

#### Vehicle Telemetry

This module serves to track vehicle state and telemetry.

#### Vehicle Interface Module

These modules update the vehicle state datastructure from an interface with the vehicle.

#### Dashboard Interface

Serves to interact with a frontend, either sending telemetry or processed data and options, or by receiving commands.

#### Debug Messages

A logger used to track messages from the car and from the backend server. Limited buffer size.

#### Race Manager

This module is used to track lapping by providing vehicle position updates and state updates.





