import { message, MessageType, messageIsValid } from './message.js'
import { startTimer } from './time.js'


let params = new URLSearchParams(location.search)
let lobbyId = params.get("lobbyId")
let participantId = create_UUID();


var peer = new Peer();

peer.on('open', function (id) {
    // Workaround for peer.reconnect deleting previous id
    if (peer.id === null) {
        console.log('Received null id from peer open');
        displayedError = 'Received null id from peer open'
        peer.id = lobbyId
    } else {
        lobbyId = peer.id;
    }

    console.log('ID: ' + lobbyId);
    var c = peer.connect('dest-peer-id');



});



// let url = `ws://${window.location.host}/ws?lobbyId=${lobbyId}&participantId=${participantId}`;
// let cWasOpened = false;
// let c = new WebSocket(url);
// c.onopen = function (event) {
//     cWasOpened = true;
//     c.send(message(MessageType.NEW_USER, participantId))
// };
// c.onerror = () => {
//     //alert(cWasOpened ? "Connection to lobby unexpectedly closed." : "Websocket connection to lobby could not be established. If this issue persists, it is likely that your device is not passing the correct headers to open a websocket connection. Please inform the lobby leader with your browser's version and type.");
// };
// c.onclose = () => {
//     //alert("Connection to lobby unexpectedly closed. This usually happens if the lobby has been open for over an hour.");
// }

// let timerInterval = undefined;
// c.onmessage = function (msg) {
//     let parsed = JSON.parse(msg.data);
//     if (messageIsValid(parsed)) {
//         switch (parsed.type) {
//             case MessageType.START:
//                 timerInterval = startTimer(parsed.value)
//                 break;
//             case MessageType.STOP:
//                 document.getElementById('before-finish').hidden = true
//                 document.getElementById('after-finish').hidden = false
//                 break;
//             default:
//                 break;
//         }
//     }

// }

makeRippleGenerator('first-opt', 'bg-info');
makeRippleGenerator('second-opt', 'bg-warning');
document.getElementById('first-opt').addEventListener('click', () => c.send(message(MessageType.CLICK_LEFT, participantId)));
document.getElementById('second-opt').addEventListener('click', () => c.send(message(MessageType.CLICK_RIGHT, participantId)));


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

// generates a uuidv4
function create_UUID() {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

