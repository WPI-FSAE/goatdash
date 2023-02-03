import '../Styles/BatteryStatus.css';
import * as Constants from '../constants';
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
            if (tm['dc_amps'] !== undefined && tm['dc_amps'] !== dcAmps) setDcAmps(tm['dc_amps']);
            if (tm['inv_volts'] !== undefined && tm['inv_volts'] !== invVolts) setInvVolts(tm['inv_volts']);

            if (tm['avg_cell'] !== undefined && tm['avg_cell'] !== avgCell) setAvgCell(tm['avg_cell']);
            if (tm['min_cell'] !== undefined && tm['min_cell'] !== minCell) setMinCell(tm['min_cell']);
            
            if (tm['acc_temp'] !== undefined && tm['acc_temp'] !== accTemp) setAccTemp(tm['acc_temp']);
            if (tm['inv_temp'] !== undefined && tm['inv_temp'] !== invTemp) setInvTemp(tm['inv_temp']);
            if (tm['mtr_temp'] !== undefined && tm['mtr_temp'] !== mtrTemp) setMtrTemp(tm['mtr_temp']);
        }
    }));

    const color = ['var(--negative)', 'var(--caution)', 'var(--positive)', 'var(--bg)', 'var(--text)'];

    // Power bar
    const power_segments = (amps, maxAccel, maxRegen) => {
        // Define bins 0-198
        let bins = Array.from(Array(199).keys());
        
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
  
          return <div className="segment" key={key} style={{left: `${key * .5}%`, backgroundColor: color}}></div>
        });
      }

    return (
        <div id="battery">

            <div id="power">
                {power_segments(dcAmps, 200, 50)}
            </div>

            <img className="icon" id="accel" src="rabbit1.png" style={{filter: `invert(${props.darkMode ? 1 : 0}) opacity(80%)`}}></img>
            <img className="icon" id="regen" src="regen.png" style={{filter: `invert(${props.darkMode ? 1 : 0}) opacity(90%)`}}></img>

            <div id="voltages">
                <p>
                    <b>ACCUM</b>
                </p>
                <p>
                    <span className="label">Min </span>
                    <span className="value" style={{'backgroundColor': minCell < Constants.CELL_THRESHOLDS[0] ? color[0] : minCell < Constants.CELL_THRESHOLDS[1] ? color[1] : color[2]}}>
                        <b>{padDecimal(minCell)}V</b>
                    </span>
                </p>
                <p>
                    <span className="label">Total </span><b>{invVolts}V</b>
                </p>
                <p>
                    <span className="label">Avg </span>
                    <span className="value" style={{'backgroundColor': avgCell < Constants.CELL_THRESHOLDS[0] ? color[0] : avgCell < Constants.CELL_THRESHOLDS[1] ? color[1] : color[2]}}>
                        <b>{padDecimal(avgCell)}V</b>
                    </span>
                </p>
            </div>

            <div id="temps">
                <p>
                    <b>TEMP</b>
                </p>
                <p>
                    <span className="value" style={{'backgroundColor': invTemp > Constants.INV_TEMP_THRESHOLDS[0] ? color[0] : invTemp > Constants.INV_TEMP_THRESHOLDS[1] ? color[1] : color[2]}}>
                        <b>{invTemp}F</b>
                    </span>
                    <span className="label"> Inv</span>
                </p>
                <p>
                    <span className="value" style={{'backgroundColor': accTemp > Constants.ACC_TEMP_THRESHOLDS[0] ? color[0] : accTemp > Constants.ACC_TEMP_THRESHOLDS[1] ? color[1] : color[2]}}>
                        <b>{accTemp}F</b>
                    </span>
                    <span className="label"> Accum</span>
                </p>
                <p>
                    <span className="value" style={{'backgroundColor': mtrTemp > Constants.MTR_TEMP_THRESHOLDS[0] ? color[0] : mtrTemp > Constants.MTR_TEMP_THRESHOLDS[1] ? color[1] : color[2]}}>
                        <b>{mtrTemp}F</b>
                    </span>
                    <span className="label"> Mtr</span>
                </p>
            </div>
        </div>
    )
});

export default BatteryStatus;
