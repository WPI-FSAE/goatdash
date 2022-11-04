import './Styles/App.css';
import { useEffect, useState } from 'react';
import { internalIpV4 } from 'internal-ip';
import Speedometer from './Components/Speedometer'
import BatteryStatus from './Components/BatteryStatus'


function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [avgCell, setAvgCell] = useState(0);
  const [maxCell, setMaxCell] = useState(0);
  const [minCell, setMinCell] = useState(0);
  const [invVolts, setInvVolts] = useState(0);
  const [dcAmps, setDcAmps] = useState(0);
  const [odometer, setOdometer] = useState(0);
  const [ip, setIp] = useState("");

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
      setSpeed(Math.abs(tm['speed']));
      setAvgCell(tm['avg_cell']);
      setMaxCell(tm['max_cell']);
      setMinCell(tm['min_cell']);
      setInvVolts(tm['inv_volts']);
      setDcAmps(tm['dc_amps']);
      setOdometer(tm['odometer']);
      setIsConnected(true);
    });

    ws.addEventListener('close', (event) => {
      console.log(event);
      setIsConnected(false);
      setTimeout(function() {
        window.location.reload()
      }, 3000);
    });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
      </header>

      <div id="status">
        <p>
          Status: <b>{isConnected ? 'Connected' : 'Disconnected'}</b> <br />
          Odometer: <b>{odometer}</b>
        </p>
      </div>

      <Speedometer speed={speed}/>
      <BatteryStatus avgCell={avgCell} minCell={minCell}/>


      {<div class ="rows">
      
      
      </div>}


      {<div class ="outer">
                    
          <div class ="inner">
          
          </div>
          <div class ="bar-top">

          </div>
          <div class ="bar">
             speed bar goes here, also this ^^ is a placeholder color
            </div>
      </div>}

      {<div class ="rows">
      
      
      </div>}


      <div id="power">
        <p>
          Sys Voltage: <b>{invVolts}V</b>
        </p>
        <p>
          Sys Amps: <b>{dcAmps}A</b>
        </p>
      </div>

      <div id="network">
        <p id="ip">
          IP: {ip}
        </p>
      </div>
    </div>
  );
}

export default App;
