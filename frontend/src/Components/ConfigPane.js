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

    function handleRefresh (e) {
        e.preventDefault();
        window.location.reload();
    }

    return (
        <div id="conf-pane" style={{display: visible ? "" : "none"}}>
            
            <div className="panel button" style={{backgroundColor: 'var(--red)'}} onClick={handleExit}>
                Return
            </div>

            <div className="panel button" style={{backgroundColor: 'var(--red)'}} onClick={handleResetOdo}>
                Reset Odometer
            </div>

            <div className="panel button" style={{backgroundColor: 'var(--red)'}} onClick={handleRefresh}>
                Refresh Dashboard
            </div>
        </div>
    );
}

export default ConfigPane;