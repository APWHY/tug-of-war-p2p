import MessageType from './message.js'

// getting values passed through by the html template
let lobbyId = _lobbyId

console.log("lobbyId: ", lobbyId)

let url = `ws://localhost:5000/ws?lobbyId=${lobbyId}`;
let c = new WebSocket(url);

let send = function (data) {
    `#output${(new Date()) + " ==> " + data + "\n"}`
    c.send(data)
}

c.onmessage = function (msg) {
    `#output${(new Date()) + " <== " + msg.data + "\n"}`
    console.log(msg)
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
document.getElementById('start-btn').addEventListener('click', () => handleClick(MessageType.START))
document.getElementById('stop-btn').addEventListener('click', () => handleClick(MessageType.STOP))








