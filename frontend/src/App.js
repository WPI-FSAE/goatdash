import './App.css';
import { useEffect, useState } from 'react';

function App() {
  const [speed, setSpeed] = useState(0);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000');
      
    ws.addEventListener('open', (event) => {
        console.log("opening conn...");
        ws.send('START');
    });

    ws.addEventListener('message', (event) => {
        setSpeed(event.data);
    });

    ws.addEventListener('close', (event) => {
        console.log(event);
    });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <p>
          The car is going {speed} mph.
        </p>
      </header>
    </div>
  );
}

export default App;
