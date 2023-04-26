import '../Styles/VehicleStatus.css';
import * as Constants from '../constants';
import { useState, forwardRef, useImperativeHandle } from 'react';

function padDecimal(val, decs) {
    let val_str = val.toString();

    if (!val_str.includes('.')) {
        val_str = val_str + ".";
    }

    while (val_str.length - val_str.indexOf('.') - 1 < decs) {
        val_str = val_str + "0";
    }

    return val_str;
}

const VehicleStatus = forwardRef(({ip, setShowConf}, ref) =>{
    const[isConnected, setIsConnected] = useState(0);
    const[remoteConnected, setRemoteConnected] = useState(0);
    const[odometer, setOdometer] = useState(0);
    const[trip, setTrip] = useState(0);
    const[rtd, setRtd] = useState(false);
    const[fault, setFault] = useState(false);
    const[warn, setWarn] = useState(false);
    const[motion, setMotion] = useState(false);
    
    useImperativeHandle(ref, () => ({
        updateStatus(tm, conn) {
            if (tm['odometer'] !== undefined && tm['odometer'] !== odometer) setOdometer(tm['odometer']);
            if (tm['trip'] !== undefined && tm['trip'] !== trip) setTrip(tm['trip']);
            if (tm['rtd'] !== undefined && tm['rtd'] !== rtd) setRtd(tm['rtd']);
            if (tm['fault'] !== undefined && tm['fault'] !== fault) setFault(tm['fault']);
            if (tm['remote'] !== undefined && tm['remote'] !== remoteConnected) setRemoteConnected(tm['remote']);

            // Check if vehicle is moving
            if (tm['speed'] !== undefined) {
                if (tm['speed'] !== 0) setMotion(true);
                else setMotion(false);
            }
  
            // Process warnings
            let warnFlag = false;
            let update = false

            if (tm['min_cell'] !== undefined) {
                warnFlag ||= (tm['min_cell'] < Constants.CELL_THRESHOLDS[0]);
                update ||= true;
            }

            if (tm['inv_temp'] !== undefined) {
                warnFlag ||= (tm['inv_temp'] > Constants.INV_TEMP_THRESHOLDS[0]);
                update ||= true;
            }

            if (tm['acc_temp'] !== undefined) {
                warnFlag ||= (tm['acc_temp'] > Constants.ACC_TEMP_THRESHOLDS[0]);
                update ||= true;
            }

            if (tm['mtr_temp'] !== undefined) {
                warnFlag ||= (tm['mtr_temp'] > Constants.MTR_TEMP_THRESHOLDS[0]);
                update ||= true;
            }

            if (update) setWarn(warnFlag);

            if (conn !== isConnected) {
                setIsConnected(conn);
                if (!conn) {
                    setRemoteConnected(false);
                }
            }
        }
    }));

    function clickHandler(e) {
        e.preventDefault();
        setShowConf(true);
    }

    // Set status halo
    let halo_color = 'prim';
    if (!rtd || fault || warn) halo_color = 'neg';
    else if (!motion) halo_color = 'pos';

    return (
        <div id="status">

            <div className={`halo ${halo_color === 'prim' ? 'active' : ''}`}/>
            <div className={`halo ${halo_color === 'neg' ? 'active' : ''}`} id="negative"/>
            <div className={`halo ${halo_color === 'pos' ? 'active' : ''}`} id="positive"/>

            <div id="status-box"  onClick={clickHandler}>
                <div id="network">
                    <span className="label" id="tm-status">
                        TM <b>{isConnected ? 'Connected' : 'Disconnected'} </b>
                    </span>

                    <span className="label" id="lte-status">
                        RMTE <b>{remoteConnected ? 'Connected' : 'Disconnected'}</b>
                    </span>
                </div>

                <div className="panel" id="fault-status" style={{'backgroundColor': fault ? 'var(--negative)' : 'var(--bg)'}}>
                    <b>FAULTS:</b> {fault ? "FAULT DETECTED" : "-"}
                </div>

                <div className="panel" id="rtd-status" style={{'backgroundColor': rtd ? 'var(--positive)' :'var(--negative)'}}>
                    <b>{rtd ? 'READY TO DRIVE' : 'NOT READY TO DRIVE'}</b>
                </div>

                <div>
                    <p>
                        <span id="odo"><b>{padDecimal(odometer, 1)}</b> mi </span>
                        <span id="trip">Trip: <b>{padDecimal(trip, 3)}</b> mi</span>
                    </p>
                </div>

                <div id="sysinfo">
                    <p>
                        <span className="label" id="title">
                            Goat Fast Racing
                        </span>

                        <span className="label" id="version">
                            {ip} v1.0.1
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
});

export default VehicleStatus;
