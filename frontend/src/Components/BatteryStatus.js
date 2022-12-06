import '../Styles/BatteryStatus.css';
import { useState, forwardRef, useImperativeHandle } from 'react';

function padDecimal(val) {
    let val_str = val.toString();
    if (val_str.includes('.')) {
        if (val_str.indexOf('.') + 2 === val_str.length) val_str = val_str + '0';
    }
    else val_str = val_str + ".00";

    return val_str;
}

const BatteryStatus = forwardRef((props, ref) => {  
    const [avgCell, setAvgCell] = useState(0);
    const [minCell, setMinCell] = useState(0);
    const [invVolts, setInvVolts] = useState(0);
    const [dcAmps, setDcAmps] = useState(0);
    const [accTemp, setAccTemp] = useState(0);
    const [invTemp, setInvTemp] = useState(0);
    const [mtrTemp, setMtrTemp] = useState(0);

    useImperativeHandle(ref, () => ({
        updateBattery(tm) {
            if (tm['inv_volts'] !== undefined && tm['inv_volts'] !== invVolts) setInvVolts(tm['inv_volts']);
            if (tm['avg_cell'] !== undefined && tm['avg_cell'] !== avgCell) setAvgCell(tm['avg_cell']);
            if (tm['min_cell'] !== undefined && tm['min_cell'] !== minCell) setMinCell(tm['min_cell']);
        }
    }));

    const color = ['var(--negative)', 'var(--caution)', 'var(--positive)', 'var(--bg)', 'var(--text)'];
    const cell_thresholds = [3.2, 3.4];
    const inv_temp_thresholds = [100, 90];
    const acc_temp_thresholds = [100, 90];
    const mtr_temp_thresholds = [100, 90];

    // Power bar
    const power_segments = (amps, maxAccel, maxRegen) => {
        // Define bins
        let bins = Array.from(Array(200).keys());
        
        // Determine if regen is active (neg amp val)
        let regen = (amps < 0);
        let color_sel = regen ? 'var(--positive)' : 'var(--negative)';

        return bins.map((key) => {
          let color = 'var(--bg)';

          if (regen) {
            // Jump to center bin and work backwards
            if ((99 - key) * (maxRegen/100) < Math.abs(amps) && key < 100) color = color_sel;
          } else {
            // Jump to center bin and work forwards
            if ((key - 99) * (maxAccel/100) < amps && key > 100) color = color_sel;
          }

          // Set color of center bin
          if (key === 99) color = 'var(--positive)';
          if (key === 100) color = 'var(--negative)';
  
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
                    <span className="value" style={{'backgroundColor': minCell < cell_thresholds[0] ? color[0] : minCell < cell_thresholds[1] ? color[1] : color[2]}}>
                        <b>{padDecimal(minCell)}V</b>
                    </span>
                </p>
                <p>
                    <span className="label">Accum </span><b>{invVolts}V</b>
                </p>
                <p>
                    <span className="label">Avg </span>
                    <span className="value" style={{'backgroundColor': avgCell < cell_thresholds[0] ? color[0] : avgCell < cell_thresholds[1] ? color[1] : color[2]}}>
                        <b>{padDecimal(avgCell)}V</b>
                    </span>
                </p>
            </div>

            <div id="temps">
                <p>
                    <b>TEMP</b>
                </p>
                <p>
                    <span className="value" style={{'backgroundColor': invTemp > inv_temp_thresholds[0] ? color[0] : invTemp > inv_temp_thresholds[1] ? color[1] : color[2]}}>
                        <b>{invTemp}F</b>
                    </span>
                    <span className="label"> Inv</span>
                </p>
                <p>
                    <span className="value" style={{'backgroundColor': accTemp > acc_temp_thresholds[0] ? color[0] : accTemp > acc_temp_thresholds[1] ? color[1] : color[2]}}>
                        <b>{accTemp}F</b>
                    </span>
                    <span className="label"> Accum</span>
                </p>
                <p>
                    <span className="value" style={{'backgroundColor': mtrTemp > mtr_temp_thresholds[0] ? color[0] : mtrTemp > mtr_temp_thresholds[1] ? color[1] : color[2]}}>
                        <b>{mtrTemp}F</b>
                    </span>
                    <span className="label"> Mtr</span>
                </p>
            </div>
        </div>
    )
});

export default BatteryStatus;
