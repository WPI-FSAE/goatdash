# FSAE 2022-23 Vehicle Dashboard

## Graphical Operations and Telemetry Dashboard (GOaTDash)

Repository for the live telemetry server and dashboard interface for the 2022-2023 FSAE EV.

This software runs on the Pi to consume CAN telemetry data and drive the dashboard display.

## Frontend

The frontend is an Electron application using React as the GUI framework. This interface is driven by the Pi and displays information on the EV dashboard display. It connects to an internal telemetry server to fetch information.

### Setup

See Frontend [README](./frontend/README.md)

## Backend

The backend is a Python websocket server that parses telemetry from the CAN network. This server should only support one client: the onboard dashboard. For additional live telemetry, a seperate process should be used. This is to prioritize serving TM to the dashboard.

### Setup

See Backend [README](./backend/README.md)

## Developer Guide

Check out the developer guide for a walkthrough of the Dashboard structure and tips for expanding [here](./DEV_GUIDE.md).
