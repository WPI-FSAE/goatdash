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

        if (getComputedStyle(document.documentElement).getPropertyValue('--bg') === 
            getComputedStyle(document.documentElement).getPropertyValue('--dark-bg')) {
            document.documentElement.style.setProperty('--bg', 'var(--light-bg)');
            document.documentElement.style.setProperty('--text', 'var(--light-text)');
            document.documentElement.style.setProperty('--primary', 'var(--light-gray)');
            document.documentElement.style.setProperty('--positive', 'var(--light-green)');
            document.documentElement.style.setProperty('--negative', 'var(--light-red)');
    
        } else {
            document.documentElement.style.setProperty('--bg', 'var(--dark-bg)');
            document.documentElement.style.setProperty('--text', 'var(--dark-text)');
            document.documentElement.style.setProperty('--primary', 'var(--dark-gray)');
            document.documentElement.style.setProperty('--positive', 'var(--dark-green)');
            document.documentElement.style.setProperty('--negative', 'var(--dark-red)');
        }
    }

    return (
        <div id="conf-pane" style={{display: visible ? "" : "none"}}>
            
            <div className="panel button" id="return" style={{backgroundColor: 'var(--negative)'}} onClick={handleExit}>
                Return
            </div>

            <div className="panel button" style={{backgroundColor: 'var(--negative)'}} onClick={handleResetOdo}>
                Reset Odometer
            </div>

            <div className="panel button" style={{backgroundColor: 'var(--negative)'}} onClick={handleResetTrip}>
                Reset Trip
            </div>

            <div className="panel button" style={{backgroundColor: 'var(--negative)'}} onClick={handleRefresh}>
                Refresh Dashboard
            </div>

            <div className="panel button" style={{backgroundColor: 'var(--negative)'}} onClick={handleDarkmodeToggle}>
                Toggle Darkmode
            </div>
        </div>
    );
}

export default ConfigPane;