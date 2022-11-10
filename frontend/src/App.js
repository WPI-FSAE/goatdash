import './Styles/App.css';
import { useEffect, useState } from 'react';
import { internalIpV4 } from 'internal-ip';
import Speedometer from './Components/Speedometer';
import BatteryStatus from './Components/BatteryStatus';
import VehicleStatus from './Components/VehicleStatus';
import ConfigPane from './Components/ConfigPane';


function App() {

  // Dashboard values
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

  // Connections
  const [sock, setSock] = useState("");

  // Dashboard state
  const [showConf, setShowConf] = useState(false);

  // Update dashboard values from tm frame
  function handle_tm_update(tm) {

    // DTI_TelemetryA
    if (tm['rpm'] !== undefined) setRpm(tm['rpm']);
    if (tm['speed'] !== undefined) setSpeed(Math.abs(tm['speed']));
    if (tm['inv_volts'] !== undefined) setInvVolts(tm['inv_volts']);
    if (tm['odometer'] !== undefined) setOdometer(tm['odometer']);

    // DTI_TelemetryB
    if (tm['dc_amps'] !== undefined) setDcAmps(tm['dc_amps']);

    // BMS_Information
    if (tm['avg_cell'] !== undefined) setAvgCell(tm['avg_cell']);
    if (tm['max_cell'] !== undefined) setMaxCell(tm['max_cell']);
    if (tm['min_cell'] !== undefined) setMinCell(tm['min_cell']);

    setIsConnected(true);
  }

  // Configure websocket
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000');
    setSock(ws);

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
    });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
      </header>

      <VehicleStatus isConnected={isConnected} odometer={odometer} ip={ip}
                     setShowConf={setShowConf}/>

      <Speedometer dcAmps={dcAmps} speed={speed}/>

      <BatteryStatus avgCell={avgCell} minCell={minCell} invVolts={invVolts} dcAmps={dcAmps}
                     invTemp={0} accTemp={0} mtrTemp={0}/>

      <ConfigPane visible={showConf} sock={sock} setShowConf={setShowConf}/>
    </div>
  );
}

export default App;
