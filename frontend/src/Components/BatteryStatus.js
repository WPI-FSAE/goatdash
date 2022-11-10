import '../Styles/BatteryStatus.css';

function padDecimal(val) {
    let val_str = val.toString();
    if (val_str.includes('.')) {
        if (val_str.indexOf('.') + 2 == val_str.length) val_str = val_str + '0';
    }
    else val_str = val_str + ".00";

    return val_str;
}

function BatteryStatus({avgCell, minCell, invVolts, dcAmps, accTemp, invTemp, mtrTemp}) {  
    /* temps: acc inv mot */
    const color = ['var(--red)', 'var(--yellow)', 'var(--green)', 'var(--white)', 'var(--bg)'];

    // Power bar
    const power_segments = (amps, maxAccel, maxRegen) => {
        // Define bins
        let bins = Array.from(Array(200).keys());
        
        // Determine if regen is active (neg amp val)
        let regen = (amps < 0);
        let color_sel = regen ? 'var(--green)' : 'var(--red)';

        return bins.map((key) => {
          let color = 'var(--bg)';

          if (regen) {
            // Jump to center bin and work backwards
            if ((99 - key) * (maxRegen/100) < Math.abs(amps) && key < 100) color = color_sel;
            // Jump to center bin and work forwards
          } else {
            if ((key - 99) * (maxAccel/100) < amps && key > 100) color = color_sel;
          }

          // Set color of center bin
          if (key == 100) color = 'var(--text)';
  
          return <div className="segment" key={key} style={{"left": `${key * .5}%`, "backgroundColor": color}}></div>
        });
      }

    return (
        <div id="battery">

            <div id="power">
                {power_segments(dcAmps, 200, 50)}
            </div>

            <img id="accel" src="accel.png"></img>
            <img id="regen" src="regen.png"></img>

            <div id="voltages">
                <p>
                    <b>BATT</b>
                </p>
                <p>
                    <span className="label">Min </span>
                    <span className="value" style={{'backgroundColor': minCell < 2.5 ? color[0] : minCell < 3 ? color[1] : color[2]}}>
                        <b>{padDecimal(minCell)}V</b>
                    </span>
                </p>
                <p>
                    <span className="label">Accum </span><b>{invVolts}V</b>
                </p>
                <p>
                    <span className="label">Avg </span>
                    <span className="value" style={{'backgroundColor': avgCell < 3 ? color[0] : avgCell < 3.2 ? color[1] : color[2]}}>
                        <b>{padDecimal(avgCell)}V</b>
                    </span>
                </p>
            </div>

            <div id="temps">
                <p>
                    <b>TEMP</b>
                </p>
                <p>
                    <span className="value" style={{'backgroundColor': invTemp > 100 ? color[0] : invTemp > 50 ? color[1] : color[2]}}>
                        <b>{invTemp}F</b>
                    </span>
                    <span className="label"> Inv</span>
                </p>
                <p>
                    <span className="value" style={{'backgroundColor': accTemp > 100 ? color[0] : accTemp > 50 ? color[1] : color[2]}}>
                        <b>{accTemp}F</b>
                    </span>
                    <span className="label"> Accum</span>
                </p>
                <p>
                    <span className="value" style={{'backgroundColor': mtrTemp > 100 ? color[0] : mtrTemp > 50 ? color[1] : color[2]}}>
                        <b>{mtrTemp}F</b>
                    </span>
                    <span className="label"> Mtr</span>
                </p>
            </div>
        </div>
    )
}

export default BatteryStatus;
