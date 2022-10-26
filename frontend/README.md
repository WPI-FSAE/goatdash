# Dashboard

This is the 2022 FSAE Dashboard front end.

The dashboard is an [Electron](https://www.electronjs.org/) application built in [React](https://reactjs.org/).

## Project Structure

* Source for the Dashboard display is located in ```src```
* Electron entry point is located at ```public/electron.js```. This is where configuration of the window should be done.
* The ```.env``` file is used by Node to set environment variables, these are useful for development. 

## Development

1. Install necessary [npm](https://www.npmjs.com/) packages with 
    ```> npm i```

You will need to install [Node.js](https://nodejs.org/en/) on your system in order to run a development build. It is recommended to install Node in order to run all scripts in this project.

2. Start the ```react-scripts``` development server with
    ```> npm run dev```

This creates a build that will update as source files are changed. The electron application will refresh as you continue to develop. You can pop out a Chrome like development tools window from the Electron window View tab, or Ctrl+Shift+I

## Building

Since this project is written in React, it will need to be compiled into CommonJS. This is done using ```react-scripts```, which is installed with ```npm i```.

1. Install necessary [npm](https://www.npmjs.com/) packages with 
    ```> npm i```
2. Build the project with
    ```> npm run build```

This creates a build directory that has CommonJS files. You can serve this build folder with a webserver, or package it as an Electron application

## Packaging as Electron Application

Packaging for Electron is currently done using the ```electron-build``` tools. Packaging for an ARM device, such as the vehicle's dashboard driver Raspberry Pi, must be done on an ARM device or on an emulated system.

### Packaging on Windows for ARM

In order to create the ```.deb``` file on a Windows system, you can use Docker. 

1. Build the application if you have not already
    ```> npm run build```
2. Build the Docker container
    ```> docker build -t electron-builder .```
3. Run the ```electron-builder``` tool inside this container
    ```docker run --rm -it --workdir /workspace -v "<current directory>:/workspace" electron-builder --linux deb --armv7l```

You will need to subsitute your project directory into the above command in order to map it to the workspace.

This will create a ```dist/``` directory that will have the ```.deb``` package that can run on the Pi

### Packaging on Windows for Windows

Not currently supported

### Packaging on ARM for ARM

```npm run electron:package:linux``` (untested)