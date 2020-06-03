import { message, MessageType, messageIsValid, EMPTY_COUNT } from './message.js'
import { addSeconds, startTimer, START_TIMER_LENGTH } from './time.js'
import Marker from './marker.js'

let DEFAULT_ACCELERATION = -0.4; // how quickly the text will head back to its original position
let BOUNCE_PADDING = 20; // the amount of 'padding' on the right hand side of the table that the text bounces off
let CLICK_VELOCITY = 7.5 // the how fast the text will be travelling once a click is recieved
const ORIGIN = {
    x: 0,
    vx: 0,
}

// getting values passed through by the html template
let lobbyId = _lobbyId;
let firstOpt = _firstOpt;
let secondOpt = _secondOpt;


// setting up websocket connection
let url = `ws://${window.location.host}/ws?lobbyId=${lobbyId}`;
let c = new WebSocket(url);

// handling clicker presses coming in
let clicker_counts = {};
let name_trackers = new Map();
let trackerInterval = setInterval(updateNamePositions, 10);
let marker = new Marker('tug-marker', () => handleStop());
c.onmessage = function (msg) {
    let parsed = JSON.parse(msg.data);
    if (messageIsValid(parsed)) {
        switch (parsed.type) {
            case MessageType.NEW_USER:

                let playerList = document.getElementById("player-list");
                document.getElementById('player-list-empty').hidden = true;
                let row = playerList.insertRow();
                let cell = row.insertCell();
                let textWrapper = document.createElement("div");
                let text = document.createTextNode(parsed.value);
                textWrapper.appendChild(text)
                cell.appendChild(textWrapper);

                clicker_counts[parsed.value] = {
                    ...EMPTY_COUNT,
                    'name': parsed.value
                };
                name_trackers.set(parsed.value, {
                    ...ORIGIN,
                    elem: textWrapper,
                    cell,
                    max_x: cell.getBoundingClientRect().width - textWrapper.getBoundingClientRect().width - BOUNCE_PADDING
                })

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
            case MessageType.START:
                startTimer(parsed.value, marker.startAnimation);
                clearInterval(trackerInterval)
                setHidden(document.getElementsByClassName('before'), true);
                setHidden(document.getElementsByClassName('during'), false);
                break;
            default:
                break;
        }
    }
}

setHidden(document.getElementsByClassName('during'), true)
setHidden(document.getElementsByClassName('after'), true)
setHidden(document.getElementsByClassName('before'), false)

// we set the start time to be 5 seconds, but in reality we need to add one extra because a countdown from 5 actually takes 6 seconds to execute
document.getElementById('start-btn').addEventListener('click', handleStart);
document.getElementById('stop-btn').addEventListener('click', handleStop);

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
    c.send(message(MessageType.START, START_TIMER_LENGTH))
}

// ends the tug of war game
function handleStop() {
    marker.decay = 0
    marker.forceEnd();
    c.send(message(MessageType.STOP, ''))
    generateScoreboard();
    setHidden(document.getElementsByClassName('during'), true)
    setHidden(document.getElementsByClassName('after'), false)
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
