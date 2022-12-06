import '../Styles/WheelStatus.css';

function WheelStatus({fl, fr, rl, rr}){
    return (
        <div id="wheel-status">

            <div className="bar" style={{top: "20%", left: "50%"}}/>
            <div className="bar" style={{bottom: "25%", left: "50%"}}></div>
            <div className="bar" style={{top: "20%", left: "60%", width: "3px", height: "55%", transform: "translate(-2px,0)"}}></div>

            <div className="wheel" id="fl" style={{backgroundColor: fl ? "var(--negative)" : "inherit"}}>
                FL
            </div>

            <div className="wheel" id="fr" style={{backgroundColor: fr ? "var(--negative)" : "inherit"}}>
                FR
            </div>

            <div className="wheel" id="rl" style={{backgroundColor: rl ? "var(--negative)" : "inherit"}}>
                RL
            </div>

            <div className="wheel" id="rr" style={{backgroundColor: rr ? "var(--negative)" : "inherit"}}>
                RR
            </div>

        </div>
    );
}

export default WheelStatus;