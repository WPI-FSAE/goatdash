import './Styles/App.css';
import { useEffect, useState, useRef } from 'react';
import { internalIpV4 } from 'internal-ip';
import Speedometer from './Components/Speedometer';
import BatteryStatus from './Components/BatteryStatus';
import VehicleStatus from './Components/VehicleStatus';
import WheelStatus from './Components/WheelStatus';
import ConfigPane from './Components/ConfigPane';
import Alerts from './Components/Alerts';
import LapStatus from './Components/LapStatus';

function App() {
  const [ip, setIp] = useState("");

  // Connections
  const [sock, setSock] = useState("");

  // Dashboard state
  const [showConf, setShowConf] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Set up refs for tm updates
  const speedoRef = useRef(null);
  const updateSpeedo = (tm) => speedoRef.current?.updateSpeedo(tm);

  const batteryRef = useRef(null);
  const updateBattery = (tm) => batteryRef.current?.updateBattery(tm);

  const statusRef = useRef(null);
  const updateStatus = (tm, conn) => statusRef.current?.updateStatus(tm, conn);

  const lapRef = useRef(null);
  const updateLap = (tm) => lapRef.current?.updateLap(tm);

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
      updateStatus({}, true);
    });

    ws.addEventListener('message', (event) => {
      let tm = JSON.parse(event.data);
      
      /* Incoming changes should not rerender entire app,
         state is handled by the individual components. */
      updateSpeedo(tm);
      updateBattery(tm);
      updateStatus(tm, true);
      updateLap(tm);
    });

    ws.addEventListener('close', (event) => {
      console.log(event);
      updateStatus({}, false);
    });

    return () => ws.close();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
      </header>

      <VehicleStatus ref={statusRef} ip={ip}
                     setShowConf={setShowConf}/>

      <Speedometer ref={speedoRef}/>

      <Alerts/>

      <BatteryStatus ref={batteryRef} darkMode={darkMode}/>

      <WheelStatus fl={false} fr={false} rl={false} rr={false}/>

      <LapStatus ref={lapRef}/>
      
      <ConfigPane visible={showConf} sock={sock} setShowConf={setShowConf} 
                  darkMode={darkMode} setDarkMode={setDarkMode}/>
      
    </div>
  );
}

export default App;
