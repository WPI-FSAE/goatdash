# WPI FSAE Race Tracking Algorithm
# Ted Clifford (c) 2023
#
# This class serves to track time and voltage deltas, and distance for
# single or multi-lap race scenarios.
# 
# Instantiate the class with the number of laps, or 0 to run infinitely
#
# Provide updates prior to and after starting the race using the update() function
# Once you are ready to start a race (i.e. the vehicle has begun motion),
# call start_race() to record starting values, then establish a starting line
# to automatically track laps.
#
# Throughout the race, use the getters for time and voltage deltas for real-time values
# To check if a lap has completed, use lap_avail() -> (bool: new lap info) then get_lap() -> (time, volt dif, lap num)
# to get the last lap's data
#
# At the end of a race, use race_complete() -> (bool: all laps completed) and get_race() -> (time, distance)
# for information about the race
# 
# You can reset the race usingin reset_race()
#
# Usage example:
#
# race_man = Race(12) # Create 12 lap race manager
# race_man.update((current_lat, current_long), current_voltage) # Provide at least one update before starting a race to establish base position and voltage
# race_man.start_race() # Begin recording positions and timing values
#
# while(!race_man.race_complete()): # Loop until all laps are recorded
#   race_man.update((current_lat, current_long), current_voltage)   # Continuously provide positional and voltage data for higher accuracy
#                                                                   # If positional data is too infrequent, the lap manager may not be able to detect laps
#   if (race_man.lap_avail()):
#       lap_time, lap_volt, lap = race_man.get_lap()    # Get data from the last lap if it is complete
#       print(lap_time, lap_volt, lap)
#
# race_time, race_distance = lap_man.get_race() # Get data from the race when it is complete
# print(race_time, race_distance)
#
# Distance measurements are in meters, time in seconds
# A test program is provided in the test_lap_man() function below
# 
# This module also includes utilities for finding a line of best fit, creating a start line,
# testing if segments intersect, and finding the distance between two GPS points

import math
import time

WAITING = 0
ACTIVE = 1
ARMED = 2
DONE = 3

START_LINE_R = .00027 # ~ 50 meter wide starting line

class Race:

    def __init__(self, lap_n):
        self.lap_n = lap_n
        self.current_lap = 1

        self.race_time_start = 0
        self.race_time_end = 0
        self.lap_time_start = 0
        self.lap_time = 0

        self.race_volt_start = 0
        self.lap_volt_start = 0
        self.lap_volt = 0
        self.current_volt = 0
    
        self.race_distance = 0
        self.lap_distance = 0

        self.start_pos = (0, 0)
        self.current_pos = (0, 0)
        self.last_pos = (0, 0)
        self.pos_buffer = []

        self.start_line_a = (0, 0)
        self.start_line_b = (0, 0)

        self.state = WAITING
        self.ready = False

        self.lap_flag = 0

    # Returns time elapsed since race start
    def get_race_time(self):
        if (self.state == ACTIVE or self.state == ARMED):
            return time.time() - self.race_time_start
        else:
            return 0

    # Returns time elapsed since lap start
    def get_lap_time(self):
        if (self.state == ACTIVE or self.state == ARMED):
            return time.time() - self.lap_time_start
        else:
            return 0

    # Returns voltage differential since last lap
    def get_lap_volt(self):
        return self.current_volt - self.lap_volt_start

    # Returns voltage differential since start of race
    def get_race_volt(self):
        return self.current_volt - self.race_volt_start

    def set_lap_n(self, lap_n):
        self.lap_n = lap_n

    def update(self, pos, voltage):
        if (self.state != DONE):
            self.update_pos(pos)
            self.update_volt(voltage)

    def update_pos(self, pos):

        # State used before race start, update internal position
        if (self.state == WAITING):
            self.current_pos = pos
            self.start_pos = self.current_pos
            self.last_pos = self.current_pos

        # Active state used to record initial points in order to establish starting line
        elif (self.state == ACTIVE):
            self.last_pos = self.current_pos
            self.current_pos = pos
            self.pos_buffer.append(pos)
            
            # Fill buffer to create best fit line normal to start line
            if (len(self.pos_buffer) == 8):
                self.state = ARMED

                _, drive_m = best_fit([x[0] for x in self.pos_buffer], [x[1] for x in self.pos_buffer]) # drive line slope (normal to starting line)
                start_line_m = -1 / drive_m # Slope for starting line (normal to drive line)

                self.start_line_a, self.start_line_b = endpoints(self.start_pos, START_LINE_R, start_line_m)    # derive starting line segment
                self.pos_buffer = []

            self.update_distance()

        # Armed state used to update positional values and check if a new position triggers a lap
        elif (self.state == ARMED):
            self.last_pos = self.current_pos
            self.current_pos = pos

            # Test if lap occurs by checking if segment lastpos <-> currentpos intesects with starting line
            if (intersect(self.start_line_a, self.start_line_b, self.last_pos, self.current_pos)):
                self.lap()
                self.lap_flag = 1
                self.current_lap += 1

                # Check if final lap or inifinite mode (n = 0)
                if (self.current_lap > self.lap_n and self.lap_n != 0):
                    self.state = DONE
                    self.race_time_end = time.time()

            self.update_distance()


    def update_distance(self):
        self.race_distance += measure(self.last_pos[0], self.last_pos[1], self.current_pos[0], self.current_pos[1])

    def update_volt(self, voltage):
        self.current_volt = voltage

    def set_ready(self, readyness):
        self.ready = readyness

    def is_ready(self):
        return self.ready

    # Set initial values
    def start_race(self):
        self.state = ACTIVE
        self.race_time_start = time.time()
        self.lap_time_start = self.race_time_start
        self.race_volt_start = self.current_volt
        self.lap_volt_start = self.race_volt_start

    def waiting(self):
        return self.state == WAITING
    
    def started(self):
        return self.state == ACTIVE or self.state == ARMED

    def reset_race(self):
        self.__init__(self.lap_n)

    # Record a lap
    def lap(self):
        self.lap_volt = self.current_volt - self.lap_volt_start
        self.lap_volt_start = self.current_volt
        self.lap_distance = self.race_distance
        curr_time = time.time()
        self.lap_time = curr_time - self.lap_time_start 
        self.lap_time_start = curr_time

        self.state = ACTIVE

    def lap_avail(self):
        return self.lap_flag

    def get_lap(self):
        self.lap_flag = 0
        return (self.lap_time, self.lap_volt, self.current_lap - 1)

    def race_complete(self):
        return self.state == DONE

    def get_race(self):
        if (self.lap_n == 0 or self.state != DONE):
            return (time.time() - self.race_time_start, self.race_distance)
        else:
            return (self.race_time_end - self.race_time_start, self.race_distance)


def best_fit(X, Y):

    xbar = sum(X)/len(X)
    ybar = sum(Y)/len(Y)
    n = len(X)

    numer = sum([xi*yi for xi,yi in zip(X, Y)]) - n * xbar * ybar
    denum = sum([xi**2 for xi in X]) - n * xbar**2

    b = numer / denum
    a = ybar - b * xbar

    return a, b


# Returns a set of 2 points along the line that are r units apart from the given (x, y) midpoint
def endpoints(pos, r, m):
    x1 = math.sqrt(r**2 / (1 + m**2))
    x2 = -1 * x1
    
    y1 = m * x1
    y2 = m * x2

    return (x1 + pos[0], y1 + pos[1]), (x2 + pos[0], y2 + pos[1])


# Tests whether the segment AB crosses the segment CD
def intersect(point_a, point_b, point_c, point_d):
    a1 = point_b[1] - point_a[1]
    b1 = point_a[0] - point_b[0]
    c1 = a1 * point_a[0] + b1 * point_a[1]

    a2 = point_d[1] - point_c[1]
    b2 = point_c[0] - point_d[0]
    c2 = a2 * point_c[0] + b2 * point_c[1]

    det = a1 * b2 - a2 * b1

    if (det == 0):
        return False

    x = (b2 * c1 - b1 * c2) / det
    y = (a1 * c2 - a2 * c1) / det

    return ((x <= max(point_a[0], point_b[0]) and x >= min(point_a[0], point_b[0])) and
            (y <= max(point_a[1], point_b[1]) and y >= min(point_a[1], point_b[1])) and
            (x <= max(point_c[0], point_d[0]) and x >= min(point_c[0], point_d[0])) and
            (y <= max(point_c[1], point_d[1]) and y >= min(point_c[1], point_d[1])))


# Return the distance in meters between two lat long points
def measure(lat1, lon1, lat2, lon2):
    R = 6378.137 # Radius of earth in KM
    dLat = lat2 * math.pi / 180 - lat1 * math.pi / 180;
    dLon = lon2 * math.pi / 180 - lon1 * math.pi / 180;
    a = math.sin(dLat/2) * math.sin(dLat/2) + math.cos(lat1 * math.pi / 180) * math.cos(lat2 * math.pi / 180) * math.sin(dLon/2) * math.sin(dLon/2);
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a));
    d = R * c
    return d * 1000 # meters
    

def test_lap_man():
    import numpy as np
    import matplotlib.pyplot as plt
    import random

    lap_lats = [42.23556085411675, 42.23564372097851, 42.23572639937239, 42.235797162458766, 42.23587586892326, 42.23596649045906, 42.23605711186474, 42.23615170485153, 42.23624232599125, 42.23633691870043, 42.2364235678803, 42.23652014616181, 42.23748353430751, 42.2387307017939, 42.2396506430571, 42.24024337240775, 42.239295280370555, 42.23868033164837, 42.236102082535396, 42.23827736939988, 42.23894150211235, 42.23800528909573, 42.236944125120345, 42.23516305088466, 42.23566657979207, 42.23387357014283, 42.23197341218783, 42.23239961894955, 42.23333155196803, 42.23417422652039, 42.23503473853451, 42.235264589829875, 42.2354765917052, 42.235748087925195]
    lap_lons = [-72.24545060643, -72.24539671032036, -72.24534172503556, -72.24527869312371, -72.24522102562989, -72.24516335813607, -72.24510569064225, -72.24505338756646, -72.2450064489087, -72.24496219245995, -72.2449179360112, -72.24488440839852, -72.24455301332853, -72.24416328264387, -72.2423753429051, -72.2415757923253, -72.24125034711442, -72.24303828685315, -72.24342801753771, -72.24241150348404, -72.2401253513237, -72.240466867903, -72.24216641511532, -72.24290168022132, -72.24427980006489, -72.2441552469595, -72.2456699734347, -72.24775523348956, -72.24842621312185, -72.2469838078045, -72.24588693690859, -72.24571416969788, -72.24550122406609, -72.24529631411849]
    
    lats = [*lap_lats]
    lons = [*lap_lons]

    # Create additional laps with random noise
    for i in range(9):
        lats = [*lats, *[lat + ((random.random() * .0002) - .0001) for lat in lap_lats]]
        lons = [*lons, *[lon + ((random.random() * .0002) - .0001) for lon in lap_lons]]

    plt.xlim(42.23, 42.2425)
    plt.ylim(-72.2375, -72.25)
    track, = plt.plot([], [])
    start, = plt.plot([], [])
    lap_txt = plt.text(42.2305, -72.238, 'Lap: -\nTime: -', fontsize=16)
    race_txt = plt.text(42.237, -72.238, 'Total: -\nDistance: -', fontsize=16)
    plt.ion()
    plt.show()

    lap_man = Race(10)
    lap_man.update((lats[0], lons[0]), 4)
    lap_man.start_race()

    for i, lat in enumerate(lats):
        lon = lons[i]

        lap_man.update((lat, lon), 3)

        # Update plotter
        track.set_xdata(np.append(track.get_xdata(), lat))
        track.set_ydata(np.append(track.get_ydata(), lon))
        start.set_xdata([lap_man.start_line_a[0], lap_man.start_line_b[0]])
        start.set_ydata([lap_man.start_line_a[1], lap_man.start_line_b[1]])
        race_txt.set_text(f'Total: {round(lap_man.get_race()[0],2)}s\nDistance: {round(lap_man.get_race()[1])}m')
        plt.draw()
        plt.pause(.001)

        if (lap_man.lap_avail()):
            print("\nLap complete: ", lap_man.get_lap())
            track, = plt.plot([], [])
            lap_txt.set_text(f'Lap: {lap_man.get_lap()[2]}\nTime: {round(lap_man.get_lap()[0], 2)}s')

        input()

    print("Race complete: ", lap_man.race_complete())

    race_time, race_distance = lap_man.get_race()
    print("Race: ", race_time, "s", race_distance, "m")

    print("Starting line width: ", measure(lap_man.start_line_a[0], lap_man.start_line_a[1], lap_man.start_line_b[0], lap_man.start_line_b[1]), "meters")
    
    plt.ioff()
    plt.show()

# test_lap_man()