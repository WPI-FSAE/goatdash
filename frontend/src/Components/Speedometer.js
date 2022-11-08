import "../Styles/Speedometer.css"

function padSpeedo(val) {
    let str = "";

    if (val.toString().includes('.')) {
      str = val.toString();
    } else {
      str = val.toString() + ".0";
    }

    if (val < 10) {
      str = "0" + str;
    }

    return str;
}

function padRpm(val) {
  if (val < 1) {
    return "0000";
  } else if (val < 10) {
    return "000" + val.toString();
  } else if (val < 100) {
    return "00" + val.toString();
  } else if (val < 1000) {
    return "0" + val.toString();
  } else {
    return val.toString();
  }
}

function Speedometer({rpm, speed}) {

    const speedo_left_segments = (speed) => {
      let keys = Array.from(Array(10).keys());

      return keys.map((key) =>
        <div className="left-segment" key={key} style={{"top": `${key * 10}%`}}></div>
      );
    }

    const speedo_top_segments = (speed) => {
      let keys = Array.from(Array(7).keys());

      return keys.map((key) =>
        <div className="top-segment" key={key} style={{"left": `${key * 14}%`}}></div>
      );
    }

    return (
        <div id="speedo">
          <div id="speed">
            <h1><i>{padSpeedo(speed)}</i></h1> <p id="label"><i>MPH</i></p>
          </div> 
          <div id="rpm">
            <h2><i>{padRpm(rpm)}</i></h2> <p id="label"><i>RPM</i></p>    
          </div>

          <div id="gauge">

            <div className="progress start">

            </div>

            <div className="progress left-edge">
              {speedo_left_segments(0)}
            </div>

            <div className="progress corner">

            </div>

            <div className="progress top-edge">
              {speedo_top_segments(0)}
            </div>

          </div>
        </div>
    )
}

export default Speedometer;