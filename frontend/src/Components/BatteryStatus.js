import '../Styles/BatteryStatus.css';

function padDecimal(val) {
    let val_str = val.toString();
    if (val_str.includes('.')) {
        if (val_str.indexOf('.') + 2 == val_str.length) {
            val_str = val_str + '0';
        }
    }
    else {
        val_str = val_str + ".00";
    }

    return val_str;
}

function BatteryStatus({avgCell, minCell, invVolts, dcAmps}) {  
    /* temps: acc inv mot */
    const color = ['var(--red)', 'var(--yellow)', 'var(--green)', 'var(--white)', 'var(--bg)'];

    const power_segments = (amps) => {
        let keys = Array.from(Array(200).keys());
        
        let regen = (amps < 0);
        let color_sel = regen ? 'var(--red)' : 'var(--green)';

        return keys.map((key) => {
          let color = 'var(--bg)';

          if (regen) {
            if ((199 - key) < Math.abs(amps)) {
                color = color_sel
            }
          } else {
            if (key*2 < amps) {
                color = color_sel;
            }
          }
  
          return <div className="segment" key={key} style={{"left": `${key * .5}%`, "backgroundColor": color}}></div>
        });
      }

    return (
        <div id="battery">

            <div id="power">
                {power_segments(dcAmps)}
            </div>

            <img id="accel" src="accel_light.png"></img>
            <img id="regen" src="regen_light.png"></img>

            <div id="voltages">
                <p>
                    <span className="label">Min: </span>
                    <div className="value" style={{'backgroundColor': minCell < 2.5 ? color[0] : minCell < 3 ? color[1] : color[2]}}>
                        <b>{padDecimal(minCell)}V</b>
                    </div>
                </p>
                <p>
                    <span className="label">Accum: </span><b>{invVolts}V</b>
                </p>
                <p>
                    <span className="label">Avg: </span>
                    <div className="value" style={{'backgroundColor': avgCell < 3 ? color[0] : avgCell < 3.2 ? color[1] : color[2]}}>
                        <b>{padDecimal(avgCell)}V</b>
                    </div>
                </p>
            </div>

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
