import '../Styles/BatteryStatus.css';
function BatteryStatus({avgCell, minCell, invVolts, dcAmps}) {

    const color = ['var(--red)', 'var(--yellow)', 'var(--white)', 'var(--gray)', 'var(--green)'];

    return (
        <div id="battery">
            <p>
                <span className="label">Min: </span><b style={{'backgroundColor': minCell < 2.5 ? color[0] : minCell < 3 ? color[1] : color[2]}}>{minCell}V</b>
            </p>
            <p>
                <span className="label">Accum: </span><b>{invVolts}V</b>
            </p>
            <p>
                <span className="label">Avg: </span><b style={{'backgroundColor': avgCell < 3 ? color[0] : avgCell < 3.2 ? color[1] : color[2]}}>{avgCell}V</b>
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
    )
}

export default BatteryStatus;
