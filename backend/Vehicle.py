
class Vehicle:

    def __init__(self):
        self.erpm = 0

        self.speed = 0

        self.amps = 0
        self.amps_max = {"draw": 0, "regen": 0}

        self.inv_voltage = 0
        self.cell_voltages = {"min": 0, "avg": 0, "max": 0}

        self.rtd = False
        self.fault = False
 
        self.accel_x = 0
        self.accel_y = 0
        self.accel_max = {"fr": 0, "rr": 0, "lt": 0, "rt": 0}

        self.batt_pct = 0
        self.range_est = {"mi": 0, "lap": 0, "time": 0}

        self.trip = 0
        self.odometer = 0

        self.temps = {"acc": 0, "inv": 0, "mtr": 0}

        self.lat = 0
        self.long = 0

