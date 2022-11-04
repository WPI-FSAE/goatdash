import './App.css';
import { useEffect, useState } from 'react';
import { internalIpV4 } from 'internal-ip';

function padDecimal(val) {
  if (val.toString().includes('.')) {
    return val.toString();
  } else {
    return val.toString() + ".0";
  }
}

function App() {
  const [isConnected, setIsConnected] = useState('Disconnected');
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
        ws.send('START');
	setIsConnected('Connected');
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
      setIsConnected('Connected');
    });

    ws.addEventListener('close', (event) => {
      console.log(event);
      setIsConnected('Disconnected');
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
	  Status: <b>{isConnected}</b> <br />
    Odometer: <b>{odometer}</b>
	</p>
      </div>

      <div id="speedo">
      <h1><i>{padDecimal(speed)}</i></h1> <p id="mph"><i>MPH</i></p>        
      </div>


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


      <div id="battery">
        <p id="avg">
          Avg Cell: <b>{avgCell}V</b>
        </p>
        <p>
          Min Cell: <b>{minCell}V</b>
        </p>
      </div>

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
