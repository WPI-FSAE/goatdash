function padDecimal(val) {
    if (val.toString().includes('.')) {
      return val.toString();
    } else {
      return val.toString() + ".0";
    }
}

function Speedometer({speed}) {
    return (
        <div id="speedo">
            <h1><i>{padDecimal(speed)}</i></h1> <p id="mph"><i>MPH</i></p>        
        </div>
    )
}

export default Speedometer;