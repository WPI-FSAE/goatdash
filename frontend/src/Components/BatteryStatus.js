import '../Styles/BatteryStatus.css';
function BatteryStatus({avgCell, minCell, invVolts, dcAmps}) {
    return (
        <div id="battery">
            <p id="avg">
                Avg Cell: <b>{avgCell}V</b> <meter max="100" value={avgCell}/>
            </p>
            <p>
                Min Cell: <b>{minCell}V</b> <meter max="100" value={minCell}/>
            </p>
        
            <div id="power">
                <p>
                Sys Voltage: <b>{invVolts}V</b>
                </p>
                <p>
                Sys Amps: <b>{dcAmps}A</b>
                </p>

                    <div id="temps">
                    <p>
                        Segment temps (F)
                    </p>
                    <p>
                        1: <meter max="100"/>
                    </p>
                    <p>
                        2: <meter max="100"/>
                    </p>
                    <p>
                        3: <meter max="100"/>
                    </p>
                    <p>
                        4: <meter max="100"/>
                    </p>
                </div>
            </div>


        
    
        </div>
    )
}

export default BatteryStatus;
