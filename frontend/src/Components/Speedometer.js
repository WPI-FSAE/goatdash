import "../Styles/Speedometer.css"

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
          <div>
            <h1><i>{padDecimal(speed)}</i></h1> <p id="mph"><i>MPH</i></p>
          </div> 
          <div>
            <h2><i>0000</i></h2> <p id="mph"><i>RPM</i></p>    
          </div>   
        </div>
    )
}

export default Speedometer;