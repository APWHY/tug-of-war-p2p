import { message, MessageType, messageIsValid, messageLobbyInfo, EMPTY_COUNT } from './message.js'
import { startTimer, START_TIMER_LENGTH } from './time.js'
import generateName from './names.js'
import Marker from './marker.js'

let DEFAULT_ACCELERATION = -0.4; // how quickly the text will head back to its original position
let BOUNCE_PADDING = 20; // the amount of 'padding' on the right hand side of the table that the text bounces off
let CLICK_VELOCITY = 7.5 // the how fast the text will be travelling once a click is recieved
const ORIGIN = {
    x: 0,
    vx: 0,
}

// getting values passed through by the html query string

let params = new URLSearchParams(location.search)
let lobbyId = null
let question = params.get("question")
let firstOpt = params.get("first-opt");
let secondOpt = params.get("second-opt");

let displayedError = ""

// handling clicker presses coming in
let clicker_counts = {};
let id_name_map = {};
let name_trackers = new Map();
let trackerInterval = setInterval(updateNamePositions, 10);
let marker = new Marker('tug-marker', () => handleStop());

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
    generateQRCode(lobbyId);


});

peer.on('connection', (c) => {
    c.on('close', () => {
        console.log('clicker closed connection')
    });
    // Receive messages
    c.on('data', (msg) => {
        console.log(msg)
        let parsed = JSON.parse(msg);
        if (messageIsValid(parsed)) {
            switch (parsed.type) {
                case MessageType.NEW_USER:
                    id_name_map[parsed.value] = {
                        'name': generateName(),
                        'conn': c,
                    };

                    let playerList = document.getElementById("player-list");
                    document.getElementById('player-list-empty').hidden = true;
                    let row = playerList.insertRow();
                    let cell = row.insertCell();
                    let textWrapper = document.createElement("div");
                    let text = document.createTextNode(id_name_map[parsed.value].name);
                    textWrapper.appendChild(text)
                    cell.appendChild(textWrapper);

                    clicker_counts[parsed.value] = {
                        ...EMPTY_COUNT,
                        'name': id_name_map[parsed.value].name
                    };
                    name_trackers.set(parsed.value, {
                        ...ORIGIN,
                        elem: textWrapper,
                        cell,
                        max_x: cell.getBoundingClientRect().width - textWrapper.getBoundingClientRect().width - BOUNCE_PADDING
                    })
                    c.send(messageLobbyInfo(id_name_map[parsed.value].name, question, firstOpt, secondOpt))
                    break;
                case MessageType.CLICK_LEFT:
                case MessageType.CLICK_RIGHT:
                    if (marker.running) {
                        marker.count[parsed.type]++;
                        clicker_counts[parsed.value][parsed.type]++;
                        marker.updateTarget();
                    } else {
                        let oldPos = name_trackers.get(parsed.value);
                        oldPos.cell.style.backgroundColor = parsed.type === MessageType.CLICK_LEFT ? '#97d1da' : '#ffeaad';
                        // oldPos.cell.style.color = parsed.type === MessageType.CLICK_LEFT ? 'var(--light)' : 'var(--dark)';

                        name_trackers.set(parsed.value, {
                            ...oldPos,
                            vx: CLICK_VELOCITY
                        });
                    }
                    break;
                default:
                    break;
            }
        }
    });
})

peer.on('error', (err) => {
    console.log('Error with peer:', err)
    alert('There was an error with the peering service. Check the console or attempt a page refresh.')
})

setHidden(document.getElementsByClassName('during'), true)
setHidden(document.getElementsByClassName('after'), true)
setHidden(document.getElementsByClassName('before'), false)

// we set the start time to be 5 seconds, but in reality we need to add one extra because a countdown from 5 actually takes 6 seconds to execute
document.getElementById('start-btn').addEventListener('click', handleStart);
document.getElementById('stop-btn').addEventListener('click', handleStop);
document.getElementById('error-holder').innerHTML = displayedError;
document.getElementById('question').innerHTML = question;
document.getElementById('first-opt').innerHTML = firstOpt;
document.getElementById('second-opt').innerHTML = secondOpt;

// generate the leaderboard table and the winner text
function generateScoreboard() {
    let winnerText = document.getElementById("winner");
    winnerText.innerText = `The winning opinion is ${marker.count[MessageType.CLICK_LEFT] > marker.count[MessageType.CLICK_RIGHT] ? firstOpt : secondOpt}!`

    let table = document.getElementById("scoreboard");
    let thead = table.createTHead();
    let row = thead.insertRow();
    for (let title of ['Name', firstOpt, secondOpt]) {
        let th = document.createElement("th");
        let text = document.createTextNode(title);
        th.appendChild(text);
        row.appendChild(th);
    }

    let players = Object.values(clicker_counts).sort((first, second) => (
        (second[MessageType.CLICK_LEFT] + second[MessageType.CLICK_RIGHT]) -
        (first[MessageType.CLICK_LEFT] + first[MessageType.CLICK_RIGHT])
    ))
    for (let player of players) {
        row = table.insertRow();
        if (player[MessageType.CLICK_LEFT] > player[MessageType.CLICK_RIGHT]) {
            row.className = 'table-info'
        } else if (player[MessageType.CLICK_LEFT] < player[MessageType.CLICK_RIGHT]) {
            row.className = 'table-warning'
        }


        for (let key of ['name', MessageType.CLICK_LEFT, MessageType.CLICK_RIGHT]) {
            let cell = row.insertCell();
            let text = document.createTextNode(player[key]);
            cell.appendChild(text);
        }
    }
}

// helper function to set all elements in an array to be hidden or vice versa
function setHidden(elems, hidden) {
    for (let elem of elems) elem.hidden = hidden;
}

// starts the tug of war game
function handleStart() {
    startTimer(START_TIMER_LENGTH, marker.startAnimation);
    clearInterval(trackerInterval)
    setHidden(document.getElementsByClassName('before'), true);
    setHidden(document.getElementsByClassName('during'), false);
    sendAll(message(MessageType.START, START_TIMER_LENGTH))
}

// ends the tug of war game
function handleStop() {
    marker.decay = 0
    marker.forceEnd();
    sendAll(message(MessageType.STOP, ''))
    generateScoreboard();
    setHidden(document.getElementsByClassName('during'), true)
    setHidden(document.getElementsByClassName('after'), false)
}

function sendAll(msg) {
    Object.values(id_name_map).forEach(v => v.conn.send(msg));
}



// handles the names bouncing left and right
function updateNamePositions() {
    name_trackers.forEach((v, k) => {
        v.vx = v.vx + DEFAULT_ACCELERATION
        v.x = v.x + v.vx
        if (v.x < 0 || v.x > v.max_x) {
            if (v.x < 0) {
                v.x = 0;
            } else {
                v.x = v.max_x;
            }
            v.vx = -0.5 * v.vx;
        }
        v.elem.style.paddingLeft = `${v.x}px`
    })
}

function generateQRCode(id) {
    let qrCodeUrl = `http://${window.location.host}/clicker.html/?lobbyId=${id}`
    document.getElementById("qrcode").innerHTML = ''
    var qrcode = new QRCode(document.getElementById("qrcode"), {
        width: 200,
        height: 200
    });

    qrcode.makeCode(qrCodeUrl);
    document.getElementById("qrcode-link").setAttribute("href", qrCodeUrl);

}