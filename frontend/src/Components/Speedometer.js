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

function padAmps(val) {
  if (val < 1) {
    return "000";
  } else if (val < 10) {
    return "00" + val.toString();
  } else if (val < 100) {
    return "0" + val.toString();
  } else {
    return val.toString();
  }
}

function Speedometer({dcAmps, speed}) {

    const speedo_left_segments = (speed) => {
      let keys = Array.from(Array(9).keys());
    
      return keys.map((key) => {
        let color = 'var(--bg)';
        if ((8 - key) * 5 < speed) {
          color = 'var(--green)';
        }

        return <div className="left-segment" key={key} style={{"top": `${key * 12}%`, "backgroundColor": color}}></div>
      });
    }

    const speedo_top_segments = (speed) => {
      let keys = Array.from(Array(7).keys());

      return keys.map((key) => {
        let color = 'var(--bg)';
        if ((key * 5) + 45 < speed) {

          if (key >= 4) {
            color = 'var(--red)'
          } else {
            color = 'var(--green)';
          }
        }

        return <div className="top-segment" key={key} style={{"left": `${key * 14}%`, "backgroundColor": color}}></div>
    });
    }

    return (
        <div id="speedo">
          <div id="speed">
            <h1><i>{padSpeedo(speed)}</i></h1> <p id="label"><i>MPH</i></p>
          </div> 
          <div id="amps">
            <h2><i>{padAmps(dcAmps)}</i></h2> <p id="label"><i>AMPS</i></p>    
          </div>

          <div id="gauge">

            <div className="progress left-edge">
              {speedo_left_segments(speed)}
            </div>

            <div className="progress top-edge">
              {speedo_top_segments(speed)}
            </div>

          </div>
        </div>
    )
}

export default Speedometer;