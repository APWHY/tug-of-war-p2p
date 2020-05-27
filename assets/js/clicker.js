import { message, MessageType, messageIsValid } from './message.js'
import { startTimer, stopTimer } from './time.js'

// getting values passed through by the html template
let lobbyId = _lobbyId;
let participantId = _participantId;

let url = `ws://${window.location.host}/ws?lobbyId=${lobbyId}&participantId=${participantId}`;
let c = new WebSocket(url);

let timerInterval = undefined;
c.onmessage = function (msg) {
    console.log(JSON.parse(msg.data));
    let parsed = JSON.parse(msg.data);
    console.log(parsed, messageIsValid(parsed));
    if (messageIsValid(parsed)) {
        switch (parsed.type) {
            case MessageType.START:
                timerInterval = startTimer(parsed.value)
                break;
            case MessageType.STOP:
                document.getElementById('before-finish').hidden = true
                document.getElementById('after-finish').hidden = false
                break;
            default:
                break;
        }
    }

}


document.getElementById('first-opt').addEventListener('click', () => c.send(message(MessageType.CLICK_LEFT, participantId)));
document.getElementById('second-opt').addEventListener('click', () => c.send(message(MessageType.CLICK_RIGHT, participantId)));



