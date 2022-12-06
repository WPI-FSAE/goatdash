import './Styles/App.css';
import { useEffect, useState } from 'react';
import { internalIpV4 } from 'internal-ip';
import Speedometer from './Components/Speedometer';
import BatteryStatus from './Components/BatteryStatus';
import VehicleStatus from './Components/VehicleStatus';
import WheelStatus from './Components/WheelStatus';
import ConfigPane from './Components/ConfigPane';
import Alerts from './Components/Alerts';


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
  const [trip, setTrip] = useState(0);
  const [ip, setIp] = useState("");
  const [halo, setHalo] = useState("prim"); // prim | neg | pos | none

  // Connections
  const [sock, setSock] = useState("");

  // Dashboard state
  const [showConf, setShowConf] = useState(true);

  // Update dashboard values from tm frame
  function handle_tm_update(tm) {

    // DTI_TelemetryA
    if (tm['rpm'] !== undefined && tm['rpm'] !== rpm) setRpm(tm['rpm']);
    if (tm['speed'] !== undefined && tm['speed'] !== speed) setSpeed(Math.abs(tm['speed']));
    if (tm['inv_volts'] !== undefined && tm['inv_volts'] !== invVolts) setInvVolts(tm['inv_volts']);
    if (tm['odometer'] !== undefined && tm['odometer'] !== odometer) setOdometer(tm['odometer']);
    if (tm['trip'] !== undefined && tm['trip'] !== trip) setTrip(tm['trip']);

    // DTI_TelemetryB
    if (tm['dc_amps'] !== undefined && tm['dc_amps'] !== dcAmps) setDcAmps(tm['dc_amps']);

    // BMS_Information
    if (tm['avg_cell'] !== undefined && tm['avg_cell'] !== avgCell) setAvgCell(tm['avg_cell']);
    if (tm['max_cell'] !== undefined && tm['max_cell'] !== maxCell) setMaxCell(tm['max_cell']);
    if (tm['min_cell'] !== undefined && tm['min_cell'] !== minCell) setMinCell(tm['min_cell']);

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

    return () => ws.close();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
      </header>

      <div className={`halo ${halo === 'prim' ? 'active' : ''}`}/>
      <div className={`halo ${halo === 'neg' ? 'active' : ''}`} id="negative"/>
      <div className={`halo ${halo === 'pos' ? 'active' : ''}`} id="positive"/>

      <VehicleStatus isConnected={isConnected} odometer={odometer} trip={trip} ip={ip}
                     setShowConf={setShowConf}/>

      <Speedometer dcAmps={dcAmps} speed={speed}/>

      <Alerts/>

      <BatteryStatus avgCell={avgCell} minCell={minCell} invVolts={invVolts} dcAmps={dcAmps}
                     invTemp={0} accTemp={0} mtrTemp={0}/>

      <WheelStatus fl={false} fr={false} rl={false} rr={false}/>

      <ConfigPane visible={showConf} sock={sock} setShowConf={setShowConf}/>
    </div>
  );
}

export default App;
