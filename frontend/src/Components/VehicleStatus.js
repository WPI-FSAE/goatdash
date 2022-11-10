import '../Styles/VehicleStatus.css';
import { useEffect } from 'react';

function VehicleStatus({isConnected, odometer, ip, setShowConf}){

    function clickHandler(e) {
        e.preventDefault();
        setShowConf(true);
    }

    return (
        <div id="status" style={{'backgroundColor': 'var(--gray)'}} onClick={clickHandler}>

            <div id="network">
                <span className="label" id="tm-status">
                    TM <b>{isConnected ? 'Connected' : 'Disconnected'} </b>
                </span>

                <span className="label" id="lte-status">
                    LTE <b>{isConnected ? 'Connected' : 'Disconnected'}</b>
                </span>
            </div>

            <div className="panel" id="fault-status" style={{'backgroundColor': 'var(--green)'}}>
                <b>FAULTS:</b> NONE
            </div>

            <div className="panel" id="rtd-status" style={{'backgroundColor': 'var(--red)'}}>
                <b>NOT READY TO DRIVE</b>
            </div>

            <div>
                <p id="odo">
                    <b>{odometer}</b> mi
                </p>
            </div>

            <div id="sysinfo">
                <p>
                    <span className="label" id="title">
                        Goat Fast Racing
                    </span>

                    <span className="label" id="version">
                        {ip} v0.1.0
                    </span>
                </p>
            </div>
        </div>
    );
}

export default VehicleStatus;