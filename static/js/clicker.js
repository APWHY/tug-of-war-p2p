import { message, MessageType, messageIsValid } from './message.js'
import { startTimer } from './time.js'

let params = new URLSearchParams(location.search)
let lobbyId = params.get("lobbyId")
let participantId = null;

let peer = new Peer();

peer.on('open', () => {
    // Workaround for peer.reconnect deleting previous id
    if (peer.id === null) {
        alert('Received null id from peer open. Try refreshing the page');
        peer.id = participantId
    } else {
        participantId = peer.id;
    }

    let c = peer.connect(lobbyId);
    c.on('open', () => {
        c.send(message(MessageType.NEW_USER, participantId))
        document.getElementById('first-opt').addEventListener('click', () => c.send(message(MessageType.CLICK_LEFT, participantId)));
        document.getElementById('second-opt').addEventListener('click', () => c.send(message(MessageType.CLICK_RIGHT, participantId)));
    })
    c.on('error', (err) => {
        console.log('error recieved:', err)
    });
    c.on('data', (msg) => {
        let parsed = JSON.parse(msg);
        if (messageIsValid(parsed)) {
            switch (parsed.type) {
                case MessageType.LOBBY_INFO:
                    document.getElementById('first-opt-text').innerHTML = parsed.value.firstOpt
                    document.getElementById('second-opt-text').innerHTML = parsed.value.secondOpt
                    document.getElementById('question-text').innerHTML = parsed.value.question
                    document.getElementById('name-text').innerHTML = `Name: ${parsed.value.name}`
                    break;
                case MessageType.START:
                    timerInterval = startTimer(parsed.value)
                    break;
                case MessageType.STOP:
                    document.getElementById('before-finish').hidden = true
                    document.getElementById('after-finish').hidden = false
                    c.close()
                    break;
                default:
                    break;
            }
        }
    });
    c.on('close', () => {
        console.log('The lobby has closed the connection.')
    });
});


makeRippleGenerator('first-opt', 'bg-info');
makeRippleGenerator('second-opt', 'bg-warning');

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