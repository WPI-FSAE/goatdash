import '../Styles/StateOfCharge.css';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useState, forwardRef, useImperativeHandle } from 'react';
import * as Constants from '../constants';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler
);
 
const StateOfCharge = forwardRef((props, ref) => {
    const [dcAmpsBuffer, setDcAmpsBuffer] = useState([...Array(Constants.AMP_TIME_SLICE[0] * Constants.AMP_REFRESH).fill(0)]);
    const [timeSlice, setTimeSlice] = useState(0);
    const [lastUpdateTime, setLastUpdateTime] = useState(0);
    const [battPct, setBattPct] = useState(0);
    const [miEst, setMiEst] = useState(0);
    const [lapEst, setLapEst] = useState(0);
    const [timeEst, setTimeEst] = useState(0);


    function clickHandler(e) {
        e.preventDefault();
        
        let newSlice = timeSlice + 1;
        if (newSlice >= Constants.AMP_TIME_SLICE.length) newSlice = 0;

        setTimeSlice(newSlice);
        setDcAmpsBuffer([...Array(Constants.AMP_TIME_SLICE[newSlice] * Constants.AMP_REFRESH).fill(0)]);
    }

    const handleAddVal = (val) => {
        let currTime = Date.now();

        if(currTime - lastUpdateTime > 1000 / Constants.AMP_REFRESH) {
            setDcAmpsBuffer((prevVals) => [
                ...prevVals.slice((-1 * Constants.AMP_TIME_SLICE[timeSlice] * Constants.AMP_REFRESH) - 1),
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
            if (tm['time_est'] !== undefined && tm['time_est'] !== timeEst) setTimeEst(tm['time_est']);;
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

    const labels = [...Array(Constants.AMP_TIME_SLICE[timeSlice] * Constants.AMP_REFRESH).keys()]

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
        <div id="state-of-charge" style={{outline: `solid ${battPct < Constants.BATT_PCT_THRESHOLD ? "var(--negative)" : "var(--text)"} 1px`}} onClick={clickHandler}>
            
            <div id="soc-graph">
                <Line options={options} data={data}/>
                <p id="timescale-label">{Constants.AMP_TIME_SLICE[timeSlice]}s</p>
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

                <p id="batt-pct" style={{color: battPct < Constants.BATT_PCT_THRESHOLD ? "var(--negative)" : "var(--text)"}}>{battPct}</p>
                <p id="batt-pct-label">pct</p>
            </div>
        </div>
    );
});

export default StateOfCharge;