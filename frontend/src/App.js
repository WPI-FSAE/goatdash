import './App.css';
import { useEffect, useState } from 'react';

function App() {
  const [speed, setSpeed] = useState(0);
  const [avgCell, setAvgCell] = useState(0);
  const [maxCell, setMaxCell] = useState(0);
  const [minCell, setMinCell] = useState(0);
  const [invVolts, setInvVolts] = useState(0);
  const [dcAmps, setDcAmps] = useState(0);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000');
      
    ws.addEventListener('open', (event) => {
        console.log("opening conn...");
        ws.send('START');
    });

    ws.addEventListener('message', (event) => {
      let tm = JSON.parse(event.data);  
      console.log('recv tm: ', tm);
      setSpeed(tm['speed']);
      setAvgCell(tm['avg_cell']);
      setMaxCell(0);
      setMinCell(tm['min_cell']);
      setInvVolts(tm['inv_volts']);
      setDcAmps(tm['dc_amps']);
    });

    ws.addEventListener('close', (event) => {
        console.log(event);
    });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
      </header>

      <div id="speedo">
        <h1><i>{speed}</i></h1> <p id="mph"><i>MPH</i></p>
      </div>

      <div id="battery">
        <p id="avg">
          Avg Cell: {avgCell}v
        </p>
        <p>
          Max Cell: {maxCell}v
        </p>
        <p>
          Min Cell: {minCell}v
        </p>
      </div>

      <div id="power">
        <p>
          Sys Voltage: {invVolts}v
        </p>
        <p>
          Sys Amps: {dcAmps}a
        </p>
      </div>
    </div>
  );
}

export default App;
