import '../Styles/LapStatus.css';
import * as Constants from '../constants';
import { useState, forwardRef, useImperativeHandle } from 'react';

function msToTime(ms) {
    let mins = String(Math.trunc((ms / 1000) / 60) % 60);
    let secs = ((ms / 1000) % 60).toFixed(2);

    if (mins < 10) mins = "0" + mins;
    if (secs < 10) secs = "0" + secs;

    if (secs.includes('.')) {
        if (secs.indexOf('.') + 2 === secs.length) secs = secs + '0';
    }
    else secs = secs + ".00";

    return "" + String(mins) + ":" + String(secs);
}

const LapStatus = forwardRef((props, ref) => {
    const [time, setTime] = useState(0);
    const [use, setUse] = useState(0);
    const [total, setTotal] = useState(0);
    const [lapNum, setLapNum] = useState(0);
    const [lapTotal, setLapTotal] = useState(0);
    const [timeDelta, setTimeDelta] = useState(0);
    const [voltDelta, setVoltDelta] = useState(0);

    useImperativeHandle(ref, () => ({
        updateBattery(tm) {
            if (tm['lap_time'] !== undefined && tm['lap_time'] !== time) setTime(tm['lap_time']);
            if (tm['lap_use'] !== undefined && tm['lap_use'] !== use) setUse(tm['lap_use']);

            if (tm['race_time'] !== undefined && tm['race_time'] !== total) setTotal(tm['race_time']);
            if (tm['lap_num'] !== undefined && tm['lap_num'] !== lapNum) setLapNum(tm['lap_num']);
            if (tm['lap_total'] !== undefined && tm['lap_total'] !== lapTotal) setLapTotal(tm['lap_total']);

            if (tm['lap_time_delta'] !== undefined && tm['lap_time_delta'] !== timeDelta) setTimeDelta(tm['lap_time_delta']);
            if (tm['lap_volt_delta'] !== undefined && tm['lap_volt_data'] !== voltDelta) setVoltDelta(tm['lap_volt_delta']);
        }
    }));

    return (
        <div id="lap-status">
            <div id="lap">
                <div className="time" style={{display: "none"}}>+/- {msToTime(timeDelta)} <span className="label">Change</span></div>
                <div className="time"><span className="label">Time</span> {msToTime(time)}</div>

                <div className="time" style={{display: "none"}}>+/- {voltDelta}V <span className="label">Change</span></div>
                <div className="time"><span className="label">Use</span> {use}V</div>
            </div>
            
            <div id="total">
                <div className="time">{msToTime(total)} <span className="label">Total</span></div>
                <div className="time">{lapNum}/{lapTotal} <span className="label">Lap</span></div>
            </div>
        </div>
    );
});

export default LapStatus;