import '../Styles/VehicleStatus.css';

function VehicleStatus({isConnected, odometer, ip}){
    return (
        <>
            <div className="panel" id="status">
                <p>
                Status: <b>{isConnected ? 'Connected' : 'Disconnected'}</b> <br />
                Odometer: <b>{odometer}</b> <br />
                IP: {ip}
                </p>
            </div>
        </>
    );
}

export default VehicleStatus;