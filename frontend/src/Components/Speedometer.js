import "../Styles/Speedometer.css"
import { useState, forwardRef, useImperativeHandle } from 'react';

function padSpeedo(val) {
    let str = "";

    if (val.toString().includes('.')) str = val.toString();
    else str = val.toString() + ".0";

    if (val < 10) str = "0" + str;

    return str;
}

function padAmps(val) {
  if (val <= -10) return "-" + Math.abs(val).toString();
  else if (val < 0) return "-0" + Math.abs(val).toString();
  else if (val === 0) return "000";
  else if (val < 10) return "00" + val.toString();
  else if (val < 100) return "0" + val.toString();
  else return val.toString();
}

const Speedometer = forwardRef((props, ref) => {
    const [dcAmps, setDcAmps] = useState(0);
    const [speed, setSpeed] = useState(0);
    const [peakAmps, setPeakAmps] = useState(0);
    const [peakRegen, setPeakRegen] = useState(0);
    
    useImperativeHandle(ref, () => ({
      updateSpeedo(tm) {
        if (tm['dc_amps'] !== undefined && tm['dc_amps'] !== dcAmps) setDcAmps(tm['dc_amps']);
        if (tm['speed'] !== undefined && tm['speed'] !== speed) setSpeed(Math.abs(tm['speed']));

        if (tm['peak_amps'] !== undefined && tm['peak_amps'] !== peakAmps) setPeakAmps(Math.abs(tm['peak_amps']));
        if (tm['peak_regen'] !== undefined && tm['peak_regen'] !== peakRegen) setPeakRegen(Math.abs(tm['peak_regen']));

      }
    }));

    // Controls segments in left edge
    const speedo_left_segments = (speed) => {
      let keys = Array.from(Array(9).keys());
      
      // Illuminate segments at 5mph intervals
      return keys.map((key) => {
        let color = 'inherit';
        if ((8 - key) * 5 < speed) {
          
          if (speed <= 70) color = 'var(--positive)';
          else color = 'var(--negative)'

          // color = 'var(--positive)';
        }

        return <div className="left-segment" key={key} style={{top: `${key * 12}%`, 
                                                               backgroundColor: color,
                                                               boxShadow: color === 'inherit' ? "none" : `0px 0px 50px ${color}`,
                                                               borderBottomColor: color === 'inherit' ? "" : color}}/>
      });
    }

    // Controls segments in top segment
    const speedo_top_segments = (speed) => {
      let keys = Array.from(Array(7).keys());

      // Illumincate segments at 5mph intervals
      return keys.map((key) => {
        let color = 'inherit';
        if ((key * 5) + 45 < speed) {

          if (speed <= 70) color = 'var(--positive)';
          else color = 'var(--negative)'

          // if (key >= 4) {
          //   color = 'var(--negative)'
          // } else {
          //   color = 'var(--positive)';
          // }

        }

        return <div className="top-segment" key={key} style={{left: `${key * 14}%`, 
                                                              backgroundColor: color,
                                                              boxShadow: color === 'inherit' ? "none" : `0px 0px 50px ${color}`,
                                                              borderBottomColor: color === 'inherit' ? "" : color}}/>
    });
    }

    return (
        <div id="speedo">

          <div id="speed">
            <h1 id="speed-text"><i>{padSpeedo(speed)}</i></h1>
            <span id="label"><i>MPH</i></span>
          </div> 
          
          <div id="amps">
            <h2 id="amp-text"><i>{padAmps(dcAmps)}</i></h2> 
            <span id="label"><i> AMPS</i></span>    
          </div>

          <div id="peaks">
            <div style={{float: "right"}}><i>
            {peakAmps}A<span style={{color: 'var(--negative)'}}> ⇝</span>
              </i></div>
            <div style={{float: "left"}}><i>
              <span style={{color: 'var(--positive)'}}>⇜ </span>{peakRegen}A
            </i></div>
          </div>

          <div id="gauge">
            <div className="progress left-edge">
              {speedo_left_segments(speed)}
            </div>
            <div className="progress top-edge">
              {speedo_top_segments(speed)}
            </div>
          </div>
        </div>
    )
});

export default Speedometer;