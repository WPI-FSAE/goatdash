import '../Styles/ConfigPane.css';
import * as Constants from '../constants';
import { useState, forwardRef, useImperativeHandle } from 'react';
import MessageList from './MessageList';

const ConfigPane = forwardRef(({visible, sock, setShowConf, darkMode, setDarkMode}, ref) => {
    const [showGeneral, setShowGeneral] = useState(false);
    const [showTuning, setShowTuning] = useState(false);
    const [showGPS, setShowGPS] = useState(false);
    const [showTrip, setShowTrip] = useState(false);
    const [showCharge, setShowCharge] = useState(false);
    const [showDebug, setShowDebug] = useState(false);
    const [alertText, setAlertText] = useState("");

    const [lapMsgs, setLapMsgs] = useState([]);
    const [bottomMsgLap, setBottomMsgLap] = useState(0);
    const [shouldScrollToBottomLap, setShouldScrollToBottomLap] = useState(true);

    const [dbgMsgs, setDbgMsgs] = useState([]);
    const [bottomMsgDbg, setBottomMsgDbg] = useState(0);
    const [shouldScrollToBottomDbg, setShouldScrollToBottomDbg] = useState(true);

    const [lat, setLat] = useState(0);
    const [long, setLong] = useState(0);
    const [lapArmed, setLapArmed] = useState(false);

    const handleAddLap = (val) => {
        setDbgMsgs((prevVals) => [
                ...prevVals.slice((-1 * Constants.DBG_BUF_SIZE) + 1),
                val
            ]);
        
        if (lapMsgs.length >= Constants.DBG_BUF_SIZE) {
                setBottomMsgLap(bottomMsgLap - 1);
        }
    };

    const handleAddDbg = (val) => {
        setDbgMsgs((prevVals) => [
                ...prevVals.slice((-1 * Constants.DBG_BUF_SIZE) + 1),
                val
            ]);
        
        if (dbgMsgs.length >= Constants.DBG_BUF_SIZE) {
                setBottomMsgDbg(bottomMsgDbg - 1);
        }
    };

    useImperativeHandle(ref, () => ({
        updateConfigPane(tm) {
            if (tm['lat'] !== undefined && tm['lat'] !== lat) setLat(tm['lat']);
            if (tm['long'] !== undefined && tm['long'] !== long) setLong(tm['long']);
            if (tm['lap_armed'] !== undefined && tm['lap_armed'] !== lapArmed) setLapArmed(tm['lap_armed']);
            if (tm['dbg_msgs'] !== undefined) handleAddDbg(tm['dbg_msgs']);
        }
    }));

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

        let data = JSON.stringify({opt: "SET_STATE", state: Constants.DASH_STATE});
        sock.send(data);
    }

    // Create a NumberPad component
    /*
    This code block was developed in part by ChatGPT 
    */
    const NumberPad = (props) => {
        // Define the numbers to display on the numberpad
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    
        // Create a state variable for the current value
        const [value, setValue] = useState("");
    
        // Create the numberpad elements
        const numberPadElements = numbers.map(number => (
            // Create a square element with the number in the center
            <div
                className="num-pad-key"
                key={number}
                onClick={() => setValue(value + number)}
            >
                {number}
            </div>
        ));
    
        // Define a handler function to display the value state variable
        const handleEnter = (fn) => {
            fn(value);
        };

        const handleDel = () => {
            if (value === "") {
                props.setShow(false);
                return;
            }
            setValue(value.slice(0, -1))
        }
    
        return (
        <div className="num-pad-wrap" style={{display: props.show ? "" : "none"}}>
            <div className="num-pad-val">{props.name}: {value}_</div>
            <div className="num-pad">
                {/* Display the numberpad elements in a grid */}
                {numberPadElements.slice(0, 9)}
                <div
                        className="num-pad-key"
                        onClick={handleDel}
                        style={{backgroundColor: "var(--negative)"}}
                >
                    {value === "" ? "Back" : "Delete"}
                </div>
                {numberPadElements.slice(9, 10)}
                <div
                        className="num-pad-key"
                        onClick={() => handleEnter(props.fn)}
                        style={{backgroundColor: "var(--positive)"}}
                >
                    Enter
                </div>

                </div>
        </div>
        );
    };

    function Menu() {
        
        function MenuEntry({title, icon, showFn}) {
            return (
                <div className="panel tile" style={{filter: showFn ? "" : "brightness(.5)"}} onClick={() => showFn(true)}>
                    <img className="menu-icon" src={icon} style={{filter: darkMode ? "invert(1)" : ""}}></img>
                    {title}
                </div>
            )
        }

        function enterGPS(show) {
            if (show) {
                setShowGPS(true);
                let data = JSON.stringify({opt: "SET_STATE", state: Constants.GPS_STATE});
                sock.send(data);
            }
        }

        function enterCharge(show) {
            if (show) {
                setShowCharge(true);
                let data = JSON.stringify({opt: "SET_STATE", state: Constants.CHARGE_STATE});
                sock.send(data);
            }
        }

        function enterDebug(show) {
            if (show) {
                setShowDebug(true);
                let data = JSON.stringify({opt: "SET_STATE", state: Constants.DEBUG_STATE});
                sock.send(data);
            }
        }

        return (
            <div className="menu">

                <MenuEntry title="General" icon="svg_icons/Settings.svg" showFn={setShowGeneral}/>
                <MenuEntry title="Tuning" icon="svg_icons/Repair.svg" showFn={setShowTuning}/>
                <MenuEntry title="Lap" icon="svg_icons/ConstructionCone.svg" showFn={enterGPS}/>
                <MenuEntry title="Trip" icon="svg_icons/Globe.svg" showFn={setShowTrip}/>
                <MenuEntry title="Charge" icon="svg_icons/VerticalBatteryCharging0.svg"/>
                <MenuEntry title="Debug" icon="svg_icons/Bug.svg" showFn={enterDebug}/>

            </div>
        )
    }

    function GeneralSettings() {
        const [showThemes, setShowThemes] = useState(false);

        function handleRefresh (e) {
            e.preventDefault();
            window.location.reload();
        }
        
        function handleRemoteStart (e) {
            e.preventDefault();
            sock.send("START_REMOTE");
        }

        function setTheme(e, theme) {
            e.preventDefault();
            document.documentElement.style.setProperty('--bg', `var(--${theme}-bg)`);
            document.documentElement.style.setProperty('--text', `var(--${theme}-text)`);
            document.documentElement.style.setProperty('--primary', `var(--${theme}-gray)`);
            document.documentElement.style.setProperty('--positive', `var(--${theme}-green)`);
            document.documentElement.style.setProperty('--negative', `var(--${theme}-red)`);

            if (theme === 'light') 
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
                        ↻ Refresh Dashboard
                        </div>

                        <div className="panel button" onClick={handleRemoteStart}>
                            Start Remote Telemetry
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

                <div className="button" id="back" onClick={() => {setShowGeneral(false); setAlertText("");}}>
                    Back
                </div>
            </div>
        )
    }

    function TuningSettings() {
        const [showACLim, setShowACLim] = useState(false);
        const [showDCLim, setShowDCLim] = useState(false);
        const [showTCS, setShowTCS] = useState(false);
        const [showRegen, setShowRegen] = useState(false);

        function togglePane(e, paneShowFn, paneState) {
            e.preventDefault();
            setAlertText("");

            setShowACLim(false);
            setShowDCLim(false);
            setShowTCS(false);
            setShowRegen(false);
            paneShowFn(!paneState);
        }

        return (
            <div className="page" id="tuning-settings" style={{display: showTuning ? "" : "none"}}>
                <h1 id="menu-title">Menu {'>'} Tuning</h1>

                <div className="option-page">
                    <div className="option-select">
                        <div className="panel button"  style={{filter: showACLim ? "brightness(.7)" : ""}} onClick={(e) => togglePane(e, setShowACLim, showACLim)}>
                        {/* <div className="panel button"  style={{filter: "brightness(.5)"}}> */}
                            Set AC Current Limit
                        </div>

                        <div className="panel button"  style={{filter: showDCLim ? "brightness(.7)" : ""}} onClick={(e) => togglePane(e, setShowDCLim, showDCLim)}>
                        {/* <div className="panel button"  style={{filter: "brightness(.5)"}}> */}
                            Set DC Current Limit
                        </div>

                        <div className="panel button"  style={{filter: showTCS ? "brightness(.7)" : ""}} onClick={(e) => togglePane(e, setShowTCS, showTCS)}>
                            Set TCS Strength
                        </div>

                        {/* <div className="panel button"  style={{filter: showRegen ? "brightness(.7)" : ""}} onClick={(e) => togglePane(e, setShowRegen, showRegen)}> */}
                        <div className="panel button"  style={{filter: "brightness(.5)"}}>
                            Set Regen Braking Strength
                        </div>
                    </div>

                    <NumberPad fn={(val) => {sock.send(JSON.stringify({opt: "SET_AC_LIM", ac_limit: val}));}} show={showACLim} setShow={setShowACLim} name="Set AC Max (A)"/>
                    <NumberPad fn={(val) => {sock.send(JSON.stringify({opt: "SET_DC_LIM", dc_limit: val}));}} show={showDCLim} setShow={setShowDCLim} name="Set DC Max (A)"/>
                    <NumberPad fn={(val) => {sock.send(JSON.stringify({opt: "SET_TCS", strength: val}));}} show={showTCS} setShow={setShowTCS} name="Set TCS Strength (%, 0 to disable)"/>
                    <NumberPad fn={(val) => alert(val)} show={showRegen} setShow={setShowRegen} name="Set Regen Strength (%)"/>

                    <div className="option-pane" id="" style={{display: showDCLim ? "" : "none"}}>
                        
                    </div>
                </div>

                <div className="button" id="back" onClick={() => {setShowTuning(false); setAlertText("");}}>
                    Back
                </div>
            </div>
        )
    }

    function GPSSettings({laps}) {
        const [showLapOptions, setShowLapOptions] = useState(true);
        const [showLapNumber, setShowLapNumber] = useState(false);
        const [showLaps, setShowLaps] = useState(false);

        function handleSetLapNumber (val) {
            let data = JSON.stringify({opt: "SET_LAP", laps: val});
            sock.send(data);
            setShowLapNumber(false);
            setAlertText(`Set Laps To ${val}`);
        }

        function togglePane(e, paneShowFn, paneState) {
            e.preventDefault();
            
            setShowLapOptions(false);
            setShowLaps(false);
            paneShowFn(!paneState);
        }

        return (            
            <div className="page" id="gps-settings" style={{display: showGPS ? "" : "none"}}>
                <h1 id="menu-title">Menu {'>'} Lap</h1>
                
                <div className="option-page">
                    <div className="option-select">
                        <div className="panel button"  style={{filter: showLapOptions ? "brightness(.7)" : ""}} onClick={(e) => togglePane(e, setShowLapOptions, showLapOptions)}>
                            Lap Options
                        </div>

                        <div className="panel button"  style={{filter: showLaps ? "brightness(.7)" : ""}} onClick={(e) => togglePane(e, setShowLaps, showLaps)}>
                            Previous Laps
                        </div>

                        <ol style={{fontSize: "1.2rem"}}>
                            <li>Set ammount of laps or 0.</li>
                            <li>When car is at start line, Set Lap Start Location.</li>
                            <li>Before starting, Arm Lapping. If armed, lap tracking will start when vehicle starts motion.</li>
                        </ol>


                    </div>

                    <div className="option-pane" id="lap-set" style={{display: showLapOptions ? "" : "none"}}>

                        <div className="panel button" onClick={() => setShowLapNumber(true)}>
                            Set Lap Ammount
                        </div>

                        <div className="panel button" onClick={() => sock.send(JSON.stringify({opt: "SET_LAP_WP"}))}>
                            Set Lap Start Location
                        </div>

                        <div className="panel button" onClick={() => sock.send(JSON.stringify({opt: "ARM_LAP"}))}>
                            Arm Lapping
                        </div>

                        <div className="panel button" onClick={() => sock.send(JSON.stringify({opt: "RESET_LAP"}))}>
                            Reset Lapping
                        </div>
                        
                        <p>Vehicle Position: {lat}, {long}</p>
                        <p>Start Line Position {lat}, {long}</p>
                        <p>Lap Armed: {lapArmed ? "Yes" : "No"}</p>

                    </div>

                    <div className="option-pane" id="lap-list" style={{display: showLaps ? "" : "none"}}>
                        <MessageList messages={laps} idx={bottomMsgLap} scrollToBottom={shouldScrollToBottomLap} setIdxFunc={setBottomMsgLap} setShouldScrollFunc={setShouldScrollToBottomLap}/>
                    </div>

                </div>

                <NumberPad fn={handleSetLapNumber} name="Number of Laps" show={showLapNumber} setShow={setShowLapNumber}/>

                <div className="panel button" id="back" onClick={() => {setShowGPS(false); setAlertText(""); sock.send(JSON.stringify({opt: "SET_STATE", state: Constants.DASH_STATE}));}}>
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

        function handleResetDraw (e) {
            e.preventDefault();
            let data = JSON.stringify({opt: "RESET_DRAW"});
            sock.send(data);
            setAlertText("Peak Draw Reset.");
        }

        function handleResetRegen (e) {
            e.preventDefault();
            let data = JSON.stringify({opt: "RESET_REGEN"});
            sock.send(data);
            setAlertText("Peak Regen Reset.");
        }

        function handleResetForce (e) {
            e.preventDefault();
            let data = JSON.stringify({opt: "RESET_FORCE"});
            sock.send(data);
            setAlertText("Force Meter Reset.");
        }

        return (
            <div className="page" id="trip-settings" style={{display: showTrip ? "" : "none"}}>
                <h1 id="menu-title">Menu {'>'} Trip</h1>

                <div className="option-page">
                    <div className="option-select">
                        <div className="panel button" onClick={handleResetOdo}>
                            ↺ Reset Odomoeter
                        </div>

                        <div className="panel button" onClick={handleResetTrip}>
                            ↺ Reset Trip
                        </div>

                        <div className="panel button" onClick={handleResetDraw}>
                            ⇝ Reset Peak Draw
                        </div>

                        <div className="panel button" onClick={handleResetRegen}>
                            ⇜ Reset Peak Regen 
                        </div>

                        <div className="panel button" onClick={handleResetForce}>
                            ⊙ Reset Force Meter
                        </div>

                    </div>
                </div>

                <div className="button" id="back" onClick={() => {setShowTrip(false); setAlertText(""); sock.send(JSON.stringify({opt: "SET_STATE", state: Constants.DASH_STATE}));}}>
                    Back
                </div>
                
            </div>
        )
    }

    function ChargeSettings() {
        return (
            <div className="page" id="charge-settings" style={{display: showCharge ? "" : "none"}}>
                <h1 id="menu-title">Menu {'>'} Charge</h1>

                <div className="button" id="back" onClick={() => {setShowCharge(false); setAlertText("");}}>
                    Back
                </div>
            </div>
        )
    }

    function DebugSettings({messages}) {
        return (
            <div className="page" id="debug-settings" style={{display: showDebug ? "" : "none"}}>
                <h1 id="menu-title">Menu {'>'} Debug</h1>

                <MessageList messages={messages} idx={bottomMsgDbg} scrollToBottom={shouldScrollToBottomDbg} setIdxFunc={setBottomMsgDbg} setShouldScrollFunc={setShouldScrollToBottomDbg}/>
        
                <div className="button" id="back" onClick={() => {setShowDebug(false); setAlertText(""); sock.send(JSON.stringify({opt: "SET_STATE", state: Constants.DASH_STATE}));}}>
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
            <GPSSettings laps={lapMsgs}/>
            <TripSettings/>
            <ChargeSettings/>
            <DebugSettings messages={dbgMsgs}/>

            <div className="button" id="return" onClick={handleExit}>
                Dashboard
            </div>

            <div id="alert" style={{display: alertText ? "" : "none"}}>
                {alertText}
            </div>
        </div>
    );
});

export default ConfigPane;