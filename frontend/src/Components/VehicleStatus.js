import '../Styles/VehicleStatus.css';

function VehicleStatus({isConnected, odometer, ip}){
    /*
    faults
    rtd
    vehicle conn
    odo
    external conn
    */
    return (
        <div className="panel" id="status" style={{'backgroundColor': 'var(--red)'}}>

            <p id="network">
                <span className="label">
                    Telemetry <b>{isConnected ? 'Connected' : 'Disconnected'}</b>
                </span>

                <span className="label">
                    LTE <b>{isConnected ? 'Connected' : 'Disconnected'}</b>
                </span>
            </p>

            <p>
                Odometer: <b>{odometer}</b>
            </p>

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