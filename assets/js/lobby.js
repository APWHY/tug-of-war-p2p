import { message, MessageType, messageIsValid, EMPTY_COUNT } from './message.js'
import { addSeconds, startTimer } from './time.js'
import Marker from './marker.js'

// getting values passed through by the html template
let lobbyId = _lobbyId;
let firstOpt = _firstOpt;
let secondOpt = _secondOpt;


// setting up websocket connection
let url = `ws://${window.location.host}/ws?lobbyId=${lobbyId}`;
let c = new WebSocket(url);

// handling clicker presses coming in
let clicker_counts = {};
let marker = new Marker('tug-marker', () => handleStop());
c.onmessage = function (msg) {
    let parsed = JSON.parse(msg.data);
    console.log("recieved msg:", msg.data)
    if (messageIsValid(parsed)) {
        switch (parsed.type) {
            case MessageType.NEW_USER:
                console.log(msg.data);

                let playerList = document.getElementById("player-list");
                document.getElementById('player-list-empty').hidden = true;
                let row = playerList.insertRow();
                let cell = row.insertCell();
                let text = document.createTextNode(parsed.value);
                cell.appendChild(text);


                clicker_counts[parsed.value] = {
                    ...EMPTY_COUNT,
                    'name': parsed.value
                };
                console.log(clicker_counts)
                break;
            case MessageType.CLICK_LEFT:
            case MessageType.CLICK_RIGHT:
                if (marker.running) {
                    marker.count[parsed.type]++;
                    clicker_counts[parsed.value][parsed.type]++;
                    marker.updateTarget();
                }
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
    console.log(players)
    for (let player of players) {
        console.log("player: ", player)
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
    console.log(elems)
    for (let elem of elems) elem.hidden = hidden;
}

// starts the tug of war game
function handleStart() {
    let to_time = addSeconds(6);
    c.send(message(MessageType.START, `${to_time}`))
    startTimer(to_time, marker.startAnimation);
    setHidden(document.getElementsByClassName('before'), true)
    setHidden(document.getElementsByClassName('during'), false)
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