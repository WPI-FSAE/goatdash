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

    function Menu() {
        
        function MenuEntry({title, icon, showFn}) {
            return (
                <div className="panel tile" onClick={() => showFn(true)}>
                    <img className="menu-icon" src={icon} style={{filter: darkMode ? "invert(1)" : ""}}></img>
                    {title}
                </div>
            )
        }
        return (
            <div className="menu">

                <MenuEntry title="General" icon="svg_icons/Settings.svg" showFn={setShowGeneral}/>
                <MenuEntry title="Tuning" icon="svg_icons/Repair.svg" showFn={setShowTuning}/>
                <MenuEntry title="GPS" icon="svg_icons/Globe.svg" showFn={setShowGPS}/>
                <MenuEntry title="Trip" icon="svg_icons/ConstructionCone.svg" showFn={setShowTrip}/>
                <MenuEntry title="Charge" icon="svg_icons/VerticalBatteryCharging0.svg" showFn={setShowCharge}/>
                <MenuEntry title="Debug" icon="svg_icons/Bug.svg" showFn={setShowDebug}/>

            </div>
        )
    }

    function GeneralSettings() {
        const [showThemes, setShowThemes] = useState(false);

        function handleRefresh (e) {
            e.preventDefault();
            window.location.reload();
        }

        function setTheme(e, theme) {
            e.preventDefault();
            document.documentElement.style.setProperty('--bg', `var(--${theme}-bg)`);
            document.documentElement.style.setProperty('--text', `var(--${theme}-text)`);
            document.documentElement.style.setProperty('--primary', `var(--${theme}-gray)`);
            document.documentElement.style.setProperty('--positive', `var(--${theme}-green)`);
            document.documentElement.style.setProperty('--negative', `var(--${theme}-red)`);

            if (theme == 'light') 
                setDarkMode(false);
            else
                setDarkMode(true);

            setAlertText(`Set ${theme[0].toUpperCase() + theme.substring(1)} theme.`);
        }
    
        function ThemeButton({theme}) {
            return (
                <div className="panel button" onClick={(e) => setTheme(e, theme)}>
                    <div style={{display: "inline"}}>
                        {theme[0].toUpperCase() + theme.substring(1)}
                    </div>
                    <div style={{display: "absolute", width: "10%"}}>
                        <div style={{backgroundColor: `var(--${theme}-bg)`, height: "20%"}}></div>
                        <div style={{backgroundColor: `var(--${theme}-text)`, height: "20%"}}></div>
                        <div style={{backgroundColor: `var(--${theme}-gray)`, height: "20%"}}></div>
                        <div style={{backgroundColor: `var(--${theme}-green)`, height: "20%"}}></div>
                        <div style={{backgroundColor: `var(--${theme}-red)`, height: "20%"}}></div>
                    </div>
                </div>
            )
        }

        return (
            <div className="page" id="general-settings" style={{display: showGeneral ? "" : "none"}}>
                <h1 id="menu-title">Menu {'>'} General</h1>

                <div className="option-page">
                    <div className="option-select">
                        <div className="panel button" onClick={handleRefresh}>
                            Refresh Dashboard
                        </div>

                        <div className="panel button"  style={{filter: showThemes ? "brightness(.7)" : ""}} onClick={() => setShowThemes(!showThemes)}>
                            Set Theme
                        </div>
                    </div>

                    <div className="option-pane" id="theme-set" style={{display: showThemes ? "" : "none"}}>
                        
                        <ThemeButton theme="light"/>
                        <ThemeButton theme="toucan"/>
                        <ThemeButton theme="deep"/>
                        <ThemeButton theme="philly"/>
                        <ThemeButton theme="darker"/>
                
                    </div>
                </div>

                <div className="panel button" id="back" onClick={() => {setShowGeneral(false); setAlertText("");}}>
                    Back
                </div>
            </div>
        )
    }

    function TuningSettings() {
        return (
            <div className="page" id="tuning-settings" style={{display: showTuning ? "" : "none"}}>
                <h1 id="menu-title">Menu {'>'} Tuning</h1>

                <div className="panel button" id="back" onClick={() => {setShowTuning(false); setAlertText("");}}>
                    Back
                </div>
            </div>
        )
    }

    function GPSSettings() {
        return (            
            <div className="page" id="gps-settings" style={{display: showGPS ? "" : "none"}}>
                <h1 id="menu-title">Menu {'>'} GPS</h1>

                <div className="panel button" id="back" onClick={() => {setShowGPS(false); setAlertText("");}}>
                    Back
                </div>
            </div>
        )
    }

    function TripSettings() {

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

        return (
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
        )
    }

    function ChargeSettings() {
        return (
            <div className="page" id="charge-settings" style={{display: showCharge ? "" : "none"}}>
                <h1 id="menu-title">Menu {'>'} Charge</h1>

                <div className="panel button" id="back" onClick={() => {setShowCharge(false); setAlertText("");}}>
                    Back
                </div>
            </div>
        )
    }

    function DebugSettings() {
        return (
            <div className="page" id="debug-settings" style={{display: showDebug ? "" : "none"}}>
                <h1 id="menu-title">Menu {'>'} Debug</h1>
 
                <div className="panel button" id="back" onClick={() => {setShowDebug(false); setAlertText("");}}>
                    Back
                </div>
            </div>
        )
    }

    return (
        <div id="conf-pane" style={{display: visible ? "" : "none"}}>
            
            <h1 id="menu-title">Menu</h1>

           <Menu/>

            <GeneralSettings/>
            <TuningSettings/>
            <GPSSettings/>
            <TripSettings/>
            <ChargeSettings/>
            <DebugSettings/>

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