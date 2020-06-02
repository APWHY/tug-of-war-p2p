import { message, MessageType, messageIsValid } from './message.js'
import { startTimer, stopTimer } from './time.js'

// getting values passed through by the html template
let lobbyId = _lobbyId;
let participantId = _participantId;

let url = `ws://${window.location.host}/ws?lobbyId=${lobbyId}&participantId=${participantId}`;
let c = new WebSocket(url);
c.onopen = function (event) {
    c.send(message(MessageType.NEW_USER, participantId))
};

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
        console.log(evt)
        rippleCanvas.appendChild(rippler);
        rippler.addEventListener('animationend', rippler.remove)
    })
}

makeRippleGenerator('first-opt', 'bg-info');
makeRippleGenerator('second-opt', 'bg-warning');




document.getElementById('first-opt').addEventListener('click', () => c.send(message(MessageType.CLICK_LEFT, participantId)));
document.getElementById('second-opt').addEventListener('click', () => c.send(message(MessageType.CLICK_RIGHT, participantId)));



