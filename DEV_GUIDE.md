# WPI FSAE GoatDash Development Guide

#### Updated 2/21/2023

## Project Structure

### Backend

The purpose of the backend is to consume and parse CAN messages to track the state of the vehicle. All data processing, derivation, and state management processes should occur on the backend. This allows the frontend to be near stateless, reducing the processing burden of the single threaded GUI process.

The backend is a Python script that manages multiple asyncronous tasks:

* Reading CAN messages from vehicle
* Updating frontend
* Processing commands from frontend
* Saving vehicle state to disk
* Additional data processing (i.e. lap tracking)

