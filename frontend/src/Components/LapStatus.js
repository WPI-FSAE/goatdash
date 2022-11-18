import '../Styles/LapStatus.css';

function LapStatus({}){
    return (
        <div id="lap-status">
            <div id="lap-batt">
                <div className="time"><span className="label">DELTA </span>--v</div>
            </div>
            
            <div id="lap-time">
                <div className="time">--:--.--<span className="label"> TIME</span></div>

                <div className="time">+--:--.--<span className="label"> DELTA</span></div>

                <div className="time" id="lap">+--:--.--<span className="label"> LAP</span></div>
            </div>
        </div>
    );
}

export default LapStatus;