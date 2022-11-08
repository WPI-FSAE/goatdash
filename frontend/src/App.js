import './Styles/App.css';
import { useEffect, useState } from 'react';
import { internalIpV4 } from 'internal-ip';
import Speedometer from './Components/Speedometer';
import BatteryStatus from './Components/BatteryStatus';
import VehicleStatus from './Components/VehicleStatus';


function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [rpm, setRpm] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [avgCell, setAvgCell] = useState(0);
  const [maxCell, setMaxCell] = useState(0);
  const [minCell, setMinCell] = useState(0);
  const [invVolts, setInvVolts] = useState(0);
  const [dcAmps, setDcAmps] = useState(0);
  const [odometer, setOdometer] = useState(0);
  const [ip, setIp] = useState("");

  function handle_tm_update(tm) {

    // DTI_TelemetryA
    if (tm['rpm']) setRpm(tm['rpm']);
    if (tm['speed']) setSpeed(Math.abs(tm['speed']));
    if (tm['inv_volts']) setInvVolts(tm['inv_volts']);
    if (tm['odometer']) setOdometer(tm['odometer']);

    // DTI_TelemetryB
    if (tm['dc_amps']) setDcAmps(tm['dc_amps']);

    // BMS_Information
    if (tm['avg_cell']) setAvgCell(tm['avg_cell']);
    if (tm['max_cell']) setMaxCell(tm['max_cell']);
    if (tm['min_cell']) setMinCell(tm['min_cell']);

    setIsConnected(true);
  }

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000');

    internalIpV4().then(ip => {
      setIp(ip)
    });

    ws.addEventListener('open', (event) => {
      console.log("opening conn...");
      ws.send('START_DASH');
      setIsConnected(true);
    });

    ws.addEventListener('message', (event) => {
      let tm = JSON.parse(event.data);
      handle_tm_update(tm)
    });

    ws.addEventListener('close', (event) => {
      console.log(event);
      setIsConnected(false);
      // setTimeout(function() {
      //   window.location.reload()
      // }, 3000);
    });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
      </header>

      <VehicleStatus isConnected={isConnected} odometer={odometer} ip={ip}/>
      <Speedometer rpm={rpm} speed={speed}/>
      <BatteryStatus avgCell={avgCell} minCell={minCell} invVolts={invVolts} dcAmps={dcAmps}/>


      {/*<div class ="outer">
                    
          <div class ="inner">
          
          </div>
          <div class ="bar-top">

          </div>
          <div class ="bar">
             speed bar goes here, also this ^^ is a placeholder color
            </div>
      </div>*/}

      {/* <div id="power">
        <p>
          Sys Voltage: <b>{invVolts}V</b>
        </p>
        <p>
          Sys Amps: <b>{dcAmps}A</b>
        </p>
      </div> */}
    </div>
  );
}

export default App;
