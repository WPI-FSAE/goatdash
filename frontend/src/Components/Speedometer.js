import "../Styles/Speedometer.css"
import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';

function padSpeedo(val) {
    let str = "";

    if (val.toString().includes('.')) str = val.toString();
    else str = val.toString() + ".0";

    if (val < 10) str = "0" + str;

    return str;
}

function padAmps(val) {
  if (val <= -10) return "0" + Math.abs(val).toString();
  else if (val < 0) return "00" + Math.abs(val).toString();
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
      
      // Illuminate segments at 3mph intervals
      return keys.map((key) => {
        let color = 'inherit';
        let height = '15px';
      
        if ((8 - key) * 3 < speed) {
                
          if (speed <= 62) color = 'var(--positive)';
          else color = 'var(--negative)'

          // color = 'var(--positive)';

          if ((8 - key) * 3 + 1 > speed) height = '5px';
          else if ((8 - key) * 3 + 2 > speed) height = '10px';
        }

        return (
          <div className="left-segment" key={key} style={{top: `${key * 12}%`}}>
            <div style={{
              position: 'absolute',
              bottom: 0,
              backgroundColor: color,
              height: height,
              width: '100%',
              boxShadow: color === 'inherit' ? "none" : `0px 0px 50px ${color}`,
            }}/>
          </div>          
        );                                                  
      });
    }

    // Controls segments in top segment
    const speedo_top_segments = (speed) => {
      let keys = Array.from(Array(7).keys());

      // Illumincate segments at 5mph intervals
      return keys.map((key) => {
        let color = 'inherit';
        let width = '12%'
        if ((key * 5) + 27 < speed) {

          if (speed <= 62) color = 'var(--positive)';
          else color = 'var(--negative)'

          // if (key >= 4) {
          //   color = 'var(--negative)'
          // } else {
          //   color = 'var(--positive)';
          // }

          if ((key * 5) + 27 + 1 > speed) width ='2.4%';
          else if ((key * 5) + 27 + 2 > speed) width ='4.8%';
          else if ((key * 5) + 27 + 3 > speed) width ='7.2%';
          else if ((key * 5) + 27 + 4 > speed) width ='9.6%';
          else if ((key * 5) + 27 + 5 > speed) width ='12%';

        }

        return <div className="top-segment" key={key} style={{left: `${key * 14}%`, 
                                                              width: width,
                                                              backgroundColor: color,
                                                              boxShadow: color === 'inherit' ? "none" : `0px 0px 50px ${color}`,
                                                              borderBottomColor: color === 'inherit' ? "" : color}}/>
    });
    }

    let speedStr = padSpeedo(speed);
    let ampStr = padAmps(dcAmps);
    let maxAmpStr = padAmps(peakAmps);
    let minAmpStr = padAmps(peakRegen);

    return (
        <div id="speedo">

          <div id="speed">
            <h1 id="speed-text"><i>
              <font style={{color: speed < 10 ? 'var(--primary)' : 'var(--text)'}}>{speedStr[0]}</font>
              <font style={{color: speed < 1 ? 'var(--text)' : 'var(--text)'}}>{speedStr[1]}</font>
              <font style={{color: speed === 0 ? 'var(--text)' : 'var(--text)'}}>{speedStr[2]}</font>
              <font style={{color: speed === 0 ? 'var(--text)' : 'var(--text)'}}>{speedStr[3]}</font>
            </i></h1>
            <span id="label"><i>MPH</i></span>
          </div> 
          
          <div id="amps">
            <h2 id="amp-text"><i>
              <font style={{color: dcAmps >= 0 ? 'var(--primary)' : 'var(--text)'}}>-</font>
              <font style={{color: (dcAmps >= 0 && dcAmps < 100) || (dcAmps <= 0 && dcAmps > -100) ? 'var(--primary)' : 'var(--text)'}}>{ampStr[0]}</font>
              <font style={{color: (dcAmps >= 0 && dcAmps < 10) || (dcAmps <= 0 && dcAmps > -10) ? 'var(--primary)' : 'var(--text)'}}>{ampStr[1]}</font>
              <font style={{color: dcAmps === 0 ? 'var(--text)' : 'var(--text)'}}>{ampStr[2]}</font>
            </i></h2> 
            <span id="label"><i> A</i></span>    
          </div>

          <div id="peaks">
            <div style={{float: "right"}}><i>
              <span style={{fontFamily: 'var(--main-font)', fontSize: '1.5rem'}}>
                <font style={{color: peakAmps < 100 ? 'var(--primary)' : 'var(--text)'}}>{maxAmpStr[0]}</font>
                <font style={{color: peakAmps < 10 ? 'var(--primary)' : 'var(--text)'}}>{maxAmpStr[1]}</font>
                <font style={{color: peakAmps === 0 ? 'var(--primary)' : 'var(--text)'}}>{maxAmpStr[2]}</font>
              </span>
              <span style={{fontSize: '1rem'}}><font style={{color: peakAmps === 0 ? 'var(--primary)' : 'var(--text)'}}>A</font></span>
              <span style={{color: peakAmps === 0 ? 'var(--primary)' : 'var(--negative)'}}> ⇝</span>
              </i></div>
            <div style={{float: "left"}}><i>
              <span style={{color: peakRegen === 0 ? 'var(--primary)' : 'var(--positive)'}}>⇜ </span>
                <span style={{fontFamily: 'var(--main-font)', fontSize: '1.5rem'}}>
                <font style={{color: peakRegen < 100 ? 'var(--primary)' : 'var(--text)'}}>{minAmpStr[0]}</font>
                <font style={{color: peakRegen < 10 ? 'var(--primary)' : 'var(--text)'}}>{minAmpStr[1]}</font>
                <font style={{color: peakRegen === 0 ? 'var(--primary)' : 'var(--text)'}}>{minAmpStr[2]}</font>
                </span>
              <span style={{fontSize: '1rem'}}><font style={{color: peakRegen === 0 ? 'var(--primary)' : 'var(--text)'}}>A</font></span>
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