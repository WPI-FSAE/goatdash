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

### Frontend

The frontend is an Electron app written using the ReactJS UI Framework. It consists of a primary application, and a series of components used to reflect telemetry data received from the backend to a user. In many ways it is stateless, i.e. the dashboard should only display the current telemetry information that it is receiving, but there are some components, like graphs, that need to store and update a state of previous values.

The primary application initializes all components, and routes incoming telemetry data to those components to be processed. This is done by creating forwardRefs for these components, and calling a telemetry data handler function within the specific component using it's ref. 

The dashboard is styled using CSS, with primary styles affecting layout for the components in App.css, and internal styling defined withing the specific component's CSS. Some inline CSS is used, but this is just to provide style interaction for the component, i.e. a change in value affecting the color of the rendered text.

Constants can be defined in the constants.js file. This should be used for configurable thresholds or max values.

#### Creating a new Component

Any standard React component or HTML object can be added to the Dashboard. However, for a component that can interact with incoming telemetry data, it must be specifically defined and integrated in to App.js. A template component, `FuelGauge` has been created and integrated, but left empty, as an example. Use this template to further develop components.




