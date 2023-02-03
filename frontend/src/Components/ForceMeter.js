import '../Styles/ForceMeter.css';
import { useState, forwardRef, useImperativeHandle } from 'react';

function padDecimal(val) {
    let val_str = val.toString();
    if (val_str.includes('.')) {
        if (val_str.indexOf('.') + 1 === val_str.length) val_str = val_str + '0';
    }
    else val_str = val_str + ".0";

    return val_str;
}

const ForceMeter = forwardRef((props, ref) => {
    const [maxFr, setMaxFr] = useState(0);
    const [maxRr, setMaxRr] = useState(0);
    const [maxLt, setMaxLt] = useState(0);
    const [maxRt, setMaxRt] = useState(0);

    const [posX, setPosX] = useState(0);
    const [posY, setPosY] = useState(0);

    useImperativeHandle(ref, () => ({
        updateForceMeter(tm) {
            if (tm['f_x'] !== undefined && tm['f_x'] !== posX) setPosX(tm['f_x']);
            if (tm['f_y'] !== undefined && tm['f_y'] !== posY) setPosY(tm['f_y']);

            if (tm['max_fr'] !== undefined && tm['max_fr'] !== maxFr) setMaxFr(tm['max_fr']);
            if (tm['max_rr'] !== undefined && tm['max_rr'] !== maxRr) setMaxRr(tm['max_rr']);
            if (tm['max_lt'] !== undefined && tm['max_lt'] !== maxLt) setMaxLt(tm['max_lt']);
            if (tm['max_rt'] !== undefined && tm['max_rt'] !== maxRt) setMaxRt(tm['max_rt']);
        }
    }));

    const getCoords = (x, y) => {
        let hyp = Math.sqrt(x**2 + y**2);

        if (hyp > 1) {
            let scalar = 1 / hyp;
            return {x: scalar * x, y: scalar * y};
        }

        return {x: x, y: y};
    } 

    const coords = getCoords(posX, posY);

    return (
        <div id="force-meter">
            <div id="force-gauge">

                <div className="tick-mark" style={{top: "33%", left: "50%"}}></div>
                <div className="tick-mark" style={{top: "15%", left: "50%"}}></div>

                <div className="tick-mark" style={{bottom: "33%", left: "50%"}}></div>
                <div className="tick-mark" style={{bottom: "15%", left: "50%"}}></div>

                <div className="tick-mark" style={{bottom: "50%", right: "33%", transform: "rotate(90deg)"}}></div>
                <div className="tick-mark" style={{bottom: "50%", right: "15%", transform: "rotate(90deg)"}}></div>

                <div className="tick-mark" style={{bottom: "50%", left: "33%", transform: "rotate(90deg)"}}></div>
                <div className="tick-mark" style={{bottom: "50%", left: "15%", transform: "rotate(90deg)"}}></div>

                <div id="force-indicator" style={{transform: `translate(${(coords.x * 600) - 50}%, ${(-1 * coords.y * 600) - 50}%)`}}/>

            </div>

            <p className="force-val" id="fr-max">{padDecimal(maxFr)}</p>
            <p className="force-val" id="rr-max">{padDecimal(maxRr)}</p>
            <p className="force-val" id="lt-max">{padDecimal(maxLt)}</p>
            <p className="force-val" id="rt-max">{padDecimal(maxRt)}</p>

            <p id="force-label">Max G</p>
            
        </div>
    )
});

export default ForceMeter;