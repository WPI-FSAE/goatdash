import '../Styles/StateOfCharge.css';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useState, forwardRef, useImperativeHandle } from 'react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler
);
 
const StateOfCharge = forwardRef((props, ref) => {
    const [dcAmpsBuffer, setDcAmpsBuffer] = useState([...Array(240).fill(0)]);
    const [lastUpdateTime, setLastUpdateTime] = useState(0);
    const [battPct, setBattPct] = useState(10);
    const [miEst, setMiEst] = useState(2.1);
    const [lapEst, setLapEst] = useState(3);
    const [timeEst, setTimeEst] = useState(25);


    const handleAddVal = (val) => {
        let currTime = Date.now();

        if(currTime - lastUpdateTime > 250) {
            setDcAmpsBuffer((prevVals) => [
                ...prevVals.slice(-239),
                val
            ]);
            setLastUpdateTime(currTime);
        }

    };

    useImperativeHandle(ref, () => ({
        updateSoc(tm) {
            if (tm['dc_amps'] !== undefined) handleAddVal(tm['dc_amps']);
            if (tm['batt_pct'] !== undefined && tm['batt_pct'] !== battPct) setBattPct(tm['batt_pct']);
            if (tm['mi_est'] !== undefined && tm['mi_est'] !== miEst) setMiEst(tm['mi_est']);
            if (tm['lap_est'] !== undefined && tm['lap_est'] !== lapEst) setLapEst(tm['lap_est']);
            if (tm['time_est'] !== undefined && tm['time_est'] !== timeEst) { console.log("Updating time est"); setTimeEst(tm['time_est']);};
        }
    }));

    const style = getComputedStyle(document.body);
    const posColor = style.getPropertyValue('--positive');
    const negColor = style.getPropertyValue('--negative');
    const txtColor = style.getPropertyValue('--text');
    const bgColor = style.getPropertyValue('--bg');
    const priColor = style.getPropertyValue('--primary');

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        fill: false,
        scales: {
            x: {
                display: false
            },
            y: {
                display: true,
                beginAtZero: true,
                min: -100,
                max: 200,
                ticks: {
                    display: false,
                    stepSize: 200
                },
                grid: {
                    color: (context) => {
                        if (context.tick.value === 0) {
                            return bgColor;
                        }
                    },
                    tickLength: 0,
                },
                border: {
                    display: false,
                }
            }
        },
        elements: {
            point: {
                radius: 0,
            },
            line: {
                borderWidth: 2,
                borderCapStyle: "round",
            }
        }
      };

    const labels = [...Array(240).keys()]

    const data = {
        labels,
        datasets: [
            {
                data: dcAmpsBuffer,
                borderColor: dcAmpsBuffer[dcAmpsBuffer.length - 1] < 0 ? txtColor : txtColor,
            },
        ]
    }

    return (
        <div id="state-of-charge" style={{outline: `solid ${battPct < 10 ? "var(--negative)" : "var(--text)"} 1px`}}>
            
            <div id="soc-graph">
                <Line options={options} data={data}/>
                <p id="timescale-label">60s</p>
                <p id="regen-label">Regen</p>
                <p id="draw-label">Draw</p>
            </div>

            <div id="range">
                <p id="range-label">Range Est</p>
                <p id="range-miles" className="range-entry">{miEst}</p>
                <p id="range-miles-label" className="range-entry-label">mi</p>

                <p id="range-laps" className="range-entry">{lapEst}</p>
                <p id="range-laps-label" className="range-entry-label">lap</p>

                <p id="range-mins" className="range-entry">{timeEst}</p>
                <p id="range-mins-label" className="range-entry-label">min</p>

                <p id="batt-pct" style={{color: battPct < 10 ? "var(--negative)" : "var(--text)"}}>{battPct}</p>
                <p id="batt-pct-label">pct</p>
            </div>
        </div>
    );
});

export default StateOfCharge;