import './App.css';
import { useEffect, useState } from 'react';

function App() {
  const [speed, setSpeed] = useState(0);
  const [batt, setBatt] = useState(0);
  const [power, setPower] = useState(0);

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
      setBatt(tm['batt']);
      setPower(tm['power']);

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
        <grid-speed>
          {speed} MPH
        </grid-speed>
      </div>

      <div id="battery">
        <p>
          Battery: {batt}%
        </p>
      </div>

      <div id="power">
        <p>
          Power: {power}w 
        </p>
      </div>
    </div>
  );
}

export default App;
