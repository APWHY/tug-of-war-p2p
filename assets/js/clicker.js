import { message, MessageType, messageIsValid } from './message.js'
import { startTimer } from './time.js'
// getting values passed through by the html template
let lobbyId = _lobbyId;
let participantId = _participantId;

let url = `ws://${window.location.host}/ws?lobbyId=${lobbyId}&participantId=${participantId}`;
let cWasOpened = false;
let c = new WebSocket(url);
c.onopen = function (event) {
    cWasOpened = true;
    c.send(message(MessageType.NEW_USER, participantId))
};
c.onerror = () => {
    alert(cWasOpened ? "Connection to lobby unexpectedly closed." : "Websocket connection to lobby could not be established. If this issue persists, it is likely that your device is not passing the correct headers to open a websocket connection. Please inform the lobby leader with your browser's version and type.");
};
c.onclose = () => {
    alert("Connection to lobby unexpectedly closed. This usually happens if the lobby has been open for over an hour.");
}

let timerInterval = undefined;
c.onmessage = function (msg) {
    let parsed = JSON.parse(msg.data);
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


function makeRippleGenerator(buttonId, buttonColorClass) {
    let btn = document.getElementById(buttonId)
    let rippleCanvas = document.getElementById('all-ripples')

    btn.addEventListener('click', evt => {
        let diffX = btn.getBoundingClientRect().left - rippleCanvas.getBoundingClientRect().left
        let diffY = btn.getBoundingClientRect().top - rippleCanvas.getBoundingClientRect().top
        let x = evt.offsetX + diffX;
        let y = evt.offsetY + diffY;
        let rippler = document.createElement('div');
        rippler.classList.add('ripple');
        rippler.classList.add(buttonColorClass);
        rippler.style.left = `${x}px`;
        rippler.style.top = `${y}px`;
        rippleCanvas.appendChild(rippler);
        rippler.addEventListener('animationend', rippler.remove)
    })
}

makeRippleGenerator('first-opt', 'bg-info');
makeRippleGenerator('second-opt', 'bg-warning');
document.getElementById('first-opt').addEventListener('click', () => c.send(message(MessageType.CLICK_LEFT, participantId)));
document.getElementById('second-opt').addEventListener('click', () => c.send(message(MessageType.CLICK_RIGHT, participantId)));



