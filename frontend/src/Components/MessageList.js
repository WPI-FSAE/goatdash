import * as Constants from '../constants';
import { useEffect } from 'react';

function MessageList({messages, idx, scrollToBottom, setIdxFunc, setShouldScrollFunc}) {

    useEffect(() => {
        if (scrollToBottom) {
            setIdxFunc(messages.length - 1);
        }
    }, [idx, scrollToBottom]);

    function handleScrollUp() {
        if (idx > Constants.DBG_MSG_CNT) {
            setIdxFunc(idx - 1);
            setShouldScrollFunc(false);
        }
    }

    function handleScrollDown() {
        if (idx < messages.length && messages.length > Constants.DBG_MSG_CNT) {
            setIdxFunc(idx + 1);
        }

        if (idx + 1 == messages.length - 1) {
            setShouldScrollFunc(true);
        }
    }

    return (
        <div id="msg-box">
            <div className="scroll-button" id="scroll-up" onClick={handleScrollUp}>↑</div>
            <div className="scroll-button" id="scroll-down" onClick={handleScrollDown}>↓</div>
            <div className="scroll-button" id="scroll-bottom" onClick={() => {setShouldScrollFunc(true); setShouldScrollFunc(messages.length - 1);}}>⤓</div>

            <div style={{width: "80%", height: "100%"}}> 
                {messages.slice(idx - Constants.DBG_MSG_CNT - 1 > 0 ? idx - Constants.DBG_MSG_CNT + 1: 0, idx + 1).map((message, index) => (
                    <p key={index} className="debug-msg">{message}</p>
                ))}
            </div>

            <p id="msg-count">{idx + 1}/{messages.length}</p>
        </div>
    )
}

export default MessageList;
