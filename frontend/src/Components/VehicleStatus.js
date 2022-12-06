import '../Styles/VehicleStatus.css';
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

const VehicleStatus = forwardRef(({ip, setShowConf, setHalo}, ref) =>{
    const[isConnected, setIsConnected] = useState(0);
    const[odometer, setOdometer] = useState(0);
    const[trip, setTrip] = useState(0);

    useImperativeHandle(ref, () => ({
        updateStatus(tm, conn) {
            if (tm['odometer'] !== undefined && tm['odometer'] !== odometer) setOdometer(tm['odometer']);
            if (tm['trip'] !== undefined && tm['trip'] !== trip) setTrip(tm['trip']);

            if (conn != isConnected) {
                setIsConnected(conn);
            }
        }
      }));

    function clickHandler(e) {
        e.preventDefault();
        setShowConf(true);
    }

    return (
        <div id="status" onClick={clickHandler}>
            
            <div id="network">
                <span className="label" id="tm-status">
                    TM <b>{isConnected ? 'Connected' : 'Disconnected'} </b>
                </span>

                <span className="label" id="lte-status">
                    LTE <b>{isConnected ? 'Connected' : 'Disconnected'}</b>
                </span>
            </div>

            <div className="panel" id="fault-status" style={{'backgroundColor': 'var(--positive)'}}>
                <b>FAULTS:</b> NONE
            </div>

            <div className="panel" id="rtd-status" style={{'backgroundColor': 'var(--negative)'}}>
                <b>NOT READY TO DRIVE</b>
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
                        {ip} v0.2.1
                    </span>
                </p>
            </div>
        </div>
    );
});

export default VehicleStatus;