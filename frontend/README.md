# Dashboard

This is the 2022 FSAE Dashboard front end.

The dashboard is an [Electron](https://www.electronjs.org/) application built in [React](https://reactjs.org/).

## Project Structure

* Source for the Dashboard display is located in ```src```
* Electron entry point is located at ```public/electron.js```. This is where configuration of the window should be done.
* The ```.env``` file is used by Node to set environment variables, these are useful for development. 

## Development

1. Install necessary [npm](https://www.npmjs.com/) packages with 

```
npm i
```

You will need to install [Node.js](https://nodejs.org/en/) on your system in order to run a development build. It is recommended to install Node in order to run all scripts in this project.

2. Start the ```react-scripts``` development server with

```
npm run dev
```

This creates a build that will update as source files are changed. The electron application will refresh as you continue to develop. You can pop out a Chrome like development tools window from the Electron window View tab, or Ctrl+Shift+I

### Developing on the car

Some situations may call for writing software directly on the car. In this case, you will have to run a ```react-scripts``` server to support hot recompilation.

Start Node:

```
npm run start
```

(In a new terminal window after Node finishes compiling) Start Electron as dev:

```
npx electron .
```

This opens an Electron application on the display with a developer window. This developer window can be disabled in ```electron.js```. Any updates to source files should be reflected in this window.

## Building

Since this project is written in React, it will need to be compiled into CommonJS. This is done using ```react-scripts```, which is installed with ```npm i```.

1. Install necessary [npm](https://www.npmjs.com/) packages with 

```
npm i
```
    
2. Build the project with

```
npm run build
```

This creates a build directory that has CommonJS files. You can serve this build folder with a webserver, or package it as an Electron application

## Packaging as Electron Application

Packaging for Electron is currently done using the ```electron-build``` tools. Packaging for an ARM device, such as the vehicle's dashboard driver Raspberry Pi, must be done on an ARM device or on an emulated system.

### Packaging on Windows for ARM

In order to create the ```.deb``` file on a Windows system, you can use Docker. 

1. Build the application if you have not already

```
npm run build
```
    
2. Build the Docker container

```
docker build -t electron-builder .
```
    
3. Run the ```electron-builder``` tool inside this container

```
docker run --rm -it --workdir /workspace -v "<current directory>:/workspace" electron-builder --linux deb --armv7l
```

You will need to subsitute your project directory into the above command in order to map it to the workspace.

This will create a ```dist/``` directory that will have the ```.deb``` package that can run on the Pi.

### Packaging on Windows for Windows

Creating a production build for Windows is not necessary, but can be done with:

```
npm run electron:package:win
```

### Packaging on ARM for ARM
   
This method is not currently supported on the Pi. It is reccommended to package the application on Windows using Docker and copy the ```.deb``` to the Pi for installation.

```
npm run electron:package:linux
``` 

## Running the Packaged Application

Once the package has been built as a ```.deb```, it can be installed as a package on the Linux system.

1. Copy the ```FSAE-Dashboard_x.x.x_armv7l.deb``` to the Pi using SSH or another file share method.

2. Install the package with:

```
sudo apt install ./FSAE-Dashboard_x.x.x_armv7l.deb
```

This will install or upgrade the package ```fsae-dashboard```

3. Run the dashboard

```
fsae-dashboard
```

You may need to set the ```$DISPLAY``` environment variable to ```:0``` to allow Electron to identify the default display.

## Changelog

Notable changes will be recorded here. Major version changes should be tagged and released.

### [0.3.0]

* Added option element for numerical input values
* Lap tracking UI
    * Ability to set total lap number
    * Race timer
* Tracking max and min amp draw
    * Ability to reset these from 'Trip Settings'
    
### [0.2.2]

* Fixed menu bug during WS activity by refactoring WS updates
    * Each component handles it's own state, instead of the application handling total TM state
* New UI element: Halo
    * Used to notify the driver that a fault has occurred, or that a reading is beyond a threshold.
    * For example, if the min_cell voltage drops too low, screen will glow red.

### [0.2.1]

* Added menu options

### [0.2.0]

* Graphical Improvements
* Power/regen gauge
* Vehicle status panel
* Fields user input
* Data transmission optimizations
* Project restructuring

### [0.1.0]

Initial version with basic display functionality:

* Speedometer & Odometer
* Battery and power levels
* Device IP
