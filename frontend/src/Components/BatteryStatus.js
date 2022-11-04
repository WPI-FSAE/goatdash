
function BatteryStatus({avgCell, minCell}) {
    return (
        <div id="battery">
            <p id="avg">
                Avg Cell: <b>{avgCell}V</b> <meter max="100" value={avgCell}/>
            </p>
            <p>
                Min Cell: <b>{minCell}V</b> <meter max="100" value={minCell}/>
            </p>
        </div>
    )
}

export default BatteryStatus;
