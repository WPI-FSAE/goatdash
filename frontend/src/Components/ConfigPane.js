import '../Styles/ConfigPane.css';
import { useEffect, useState } from 'react';

function ConfigPane({visible, sock, setShowConf}){
    const [darkMode, setDarkMode] = useState(false);
    const [showGeneral, setShowGeneral] = useState(false);
    const [showTuning, setShowTuning] = useState(false);
    const [showGPS, setShowGPS] = useState(false);
    const [showTrip, setShowTrip] = useState(false);
    const [showCharge, setShowCharge] = useState(false);
    const [showDebug, setShowDebug] = useState(false);
    const [alertText, setAlertText] = useState("");

    function handleExit (e) {
        e.preventDefault();
        setShowGeneral(false);
        setShowTuning(false);
        setShowGPS(false);
        setShowTrip(false);
        setShowCharge(false);
        setShowDebug(false);
        setShowConf(false);
        setAlertText("");
    }

    function handleResetOdo (e) {
        e.preventDefault();
        let data = JSON.stringify({opt: "RESET_ODO"});
        sock.send(data);
        setAlertText("Odometer Reset.");
    }

    function handleResetTrip (e) {
        e.preventDefault();
        let data = JSON.stringify({opt: "RESET_TRIP"});
        sock.send(data);
        setAlertText("Trip Reset.");
    }

    function handleRefresh (e) {
        e.preventDefault();
        window.location.reload();
    }

    function handleDarkmodeToggle (e) {
        e.preventDefault();

        if (getComputedStyle(document.documentElement).getPropertyValue('--bg') === 
            getComputedStyle(document.documentElement).getPropertyValue('--dark-bg')) {
            document.documentElement.style.setProperty('--bg', 'var(--light-bg)');
            document.documentElement.style.setProperty('--text', 'var(--light-text)');
            document.documentElement.style.setProperty('--primary', 'var(--light-gray)');
            document.documentElement.style.setProperty('--positive', 'var(--light-green)');
            document.documentElement.style.setProperty('--negative', 'var(--light-red)');
            setDarkMode(false);
            setAlertText("Light.");

        } else {
            document.documentElement.style.setProperty('--bg', 'var(--dark-bg)');
            document.documentElement.style.setProperty('--text', 'var(--dark-text)');
            document.documentElement.style.setProperty('--primary', 'var(--dark-gray)');
            document.documentElement.style.setProperty('--positive', 'var(--dark-green)');
            document.documentElement.style.setProperty('--negative', 'var(--dark-red)');
            setDarkMode(true);
            setAlertText("Dark.");

        }
    }

    return (
        <div id="conf-pane" style={{display: visible ? "" : "none"}}>
            
            <h1 id="menu-title">Menu</h1>

            <div className="menu">
                <div className="panel tile" onClick={() => setShowGeneral(true)}>
                    <img className="menu-icon" src="icons/Settings.svg" style={{filter: darkMode ? "invert(1)" : ""}}></img>
                    General
                </div>

                <div className="panel tile" onClick={() => setShowTuning(true)}>
                    <img className="menu-icon" src="icons/Repair.svg" style={{filter: darkMode ? "invert(1)" : ""}}></img>
                    Tuning
                </div>

                <div className="panel tile" onClick={() => setShowGPS(true)}>
                    <img className="menu-icon" src="icons/Globe.svg" style={{filter: darkMode ? "invert(1)" : ""}}></img>
                    GPS
                </div>

                <div className="panel tile" onClick={() => setShowTrip(true)}>
                    <img className="menu-icon" src="icons/ConstructionCone.svg" style={{filter: darkMode ? "invert(1)" : ""}}></img>
                    Trip
                </div>

                <div className="panel tile" onClick={() => setShowCharge(true)}>
                    <img className="menu-icon" src="icons/VerticalBatteryCharging0.svg" style={{filter: darkMode ? "invert(1)" : ""}}></img>
                    Charge
                </div>

                <div className="panel tile" onClick={() => setShowDebug(true)}>
                    <img className="menu-icon" src="icons/Bug.svg" style={{filter: darkMode ? "invert(1)" : ""}}></img>
                    Debug
                </div>
            </div>

            <div className="page" id="general-settings" style={{display: showGeneral ? "" : "none"}}>
                <h1 id="menu-title">Menu {'>'} General</h1>
                <div className="panel button" onClick={handleRefresh}>
                    Refresh Dashboard
                </div>

                <div className="panel button" onClick={handleDarkmodeToggle}>
                    Toggle Darkmode
                </div>

                <div className="panel button" id="back" onClick={() => {setShowGeneral(false); setAlertText("");}}>
                    Back
                </div>
            </div>

            <div className="page" id="tuning-settings" style={{display: showTuning ? "" : "none"}}>
                <h1 id="menu-title">Menu {'>'} Tuning</h1>

                <div className="panel button" id="back" onClick={() => {setShowTuning(false); setAlertText("");}}>
                    Back
                </div>
            </div>

            <div className="page" id="gps-settings" style={{display: showGPS ? "" : "none"}}>
                <h1 id="menu-title">Menu {'>'} GPS</h1>

                <div className="panel button" id="back" onClick={() => {setShowGPS(false); setAlertText("");}}>
                    Back
                </div>
            </div>

            <div className="page" id="trip-settings" style={{display: showTrip ? "" : "none"}}>
                <h1 id="menu-title">Menu {'>'} Trip</h1>

                <div className="panel button" onClick={handleResetOdo}>
                    Reset Odomoeter {'(Hold)'}
                </div>

                <div className="panel button" onClick={handleResetTrip}>
                    Reset Trip
                </div>

                <div className="panel button" id="back" onClick={() => {setShowTrip(false); setAlertText("");}}>
                    Back
                </div>
                
            </div>

            <div className="page" id="charge-settings" style={{display: showCharge ? "" : "none"}}>
                <h1 id="menu-title">Menu {'>'} Charge</h1>

                <div className="panel button" id="back" onClick={() => {setShowCharge(false); setAlertText("");}}>
                    Back
                </div>
            </div>

            <div className="page" id="debug-settings" style={{display: showDebug ? "" : "none"}}>
                <h1 id="menu-title">Menu {'>'} Debug</h1>
 
                <div className="panel button" id="back" onClick={() => {setShowDebug(false); setAlertText("");}}>
                    Back
                </div>
            </div>

            <div className="panel button" id="return" onClick={handleExit}>
                Dashboard
            </div>

            <div id="alert" style={{display: alertText ? "" : "none"}}>
                {alertText}
            </div>
        </div>
    );
}

export default ConfigPane;