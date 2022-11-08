
function BatteryReadout({avgCell, minCell}) {

    return (
        <div id="battery">
        <p id="avg">
          Avg Cell: <b>{avgCell}V</b>
          <meter value={avgCell} max="100">Low</meter>
        </p>
        
        <p>
          Min Cell: <b>{minCell}V</b>
          <meter value={minCell} max="100">Low</meter>
        </p>
      </div>
    )
}

export default BatteryReadout;