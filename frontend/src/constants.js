// import dotenv from 'dotenv';
// dotenv.config();

export const DASH_STATE = 0;
export const GPS_STATE = 1;
export const CHARGE_STATE = 2;
export const DEBUG_STATE= 3;

// Values below threshold[0] displayed red, between [1] and [2] displayed yellow, above [2] displayed green by default
export const CELL_THRESHOLDS = [2.02, 2.04];
export const INV_TEMP_THRESHOLDS = [120, 90];
export const ACC_TEMP_THRESHOLDS = [100, 90];
export const MTR_TEMP_THRESHOLDS = [100, 90];
export const BATT_PCT_THRESHOLD = 0;

// Graph timeslicing
export const AMP_TIME_SLICE = [60, 30, 15, 5];  // Avail timeslices (s)
export const AMP_REFRESH = 4;   // Hz

export const DBG_BUF_SIZE = 256;
export const DBG_MSG_CNT = 15;