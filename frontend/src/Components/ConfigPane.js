import '../Styles/ConfigPane.css';

function ConfigPane({visible, sock, setShowConf}){

    function handleExit (e) {
        e.preventDefault();
        setShowConf(false);
    }

    function handleResetOdo (e) {
        e.preventDefault();
        let data = JSON.stringify({opt: "RESET_ODO"});
        sock.send(data);
    }

    function handleResetTrip (e) {
        e.preventDefault();
        let data = JSON.stringify({opt: "RESET_TRIP"});
        sock.send(data);
    }

    function handleRefresh (e) {
        e.preventDefault();
        window.location.reload();
    }

    function handleDarkmodeToggle (e) {
        e.preventDefault();

        const curr_bg = getComputedStyle(document.documentElement).getPropertyValue('--bg');
        const curr_text = getComputedStyle(document.documentElement).getPropertyValue('--text');
        document.documentElement.style.setProperty('--bg', curr_text);
        document.documentElement.style.setProperty('--text', curr_bg);
    }

    return (
        <div id="conf-pane" style={{display: visible ? "" : "none"}}>
            
            <div className="panel button" id="return" style={{backgroundColor: 'var(--red)'}} onClick={handleExit}>
                Return
            </div>

            <div className="panel button" style={{backgroundColor: 'var(--red)'}} onClick={handleResetOdo}>
                Reset Odometer
            </div>

            <div className="panel button" style={{backgroundColor: 'var(--red)'}} onClick={handleResetTrip}>
                Reset Trip
            </div>

            <div className="panel button" style={{backgroundColor: 'var(--red)'}} onClick={handleRefresh}>
                Refresh Dashboard
            </div>

            <div className="panel button" style={{backgroundColor: 'var(--red)'}} onClick={handleDarkmodeToggle}>
                Toggle Darkmode
            </div>
        </div>
    );
}

export default ConfigPane;