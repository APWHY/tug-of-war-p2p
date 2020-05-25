import { message, MessageType } from './message.js'
import { addSeconds } from './time.js'

// getting values passed through by the html template
let lobbyId = _lobbyId

console.log("lobbyId: ", lobbyId)

let url = `ws://localhost:5000/ws?lobbyId=${lobbyId}`;
let c = new WebSocket(url);


c.onmessage = function (msg) {
    console.log(msg.data)
    console.log(JSON.parse(msg.data))
}

// c.onopen = function () {
//     setInterval(
//         function () { send("ping") }
//         , 1000)
// }

function handleClick(clicked) {
    console.log(`you have clicked ${clicked}`)
    c.send(clicked)
}
document.getElementById('start-btn').addEventListener('click', () => handleClick(message(MessageType.START, `${addSeconds(5)}`)))
document.getElementById('stop-btn').addEventListener('click', () => handleClick(message(MessageType.STOP, `${addSeconds(0)}`)))








