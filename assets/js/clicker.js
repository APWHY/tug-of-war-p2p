import MessageType from './message.js'

// getting values passed through by the html template
let lobbyId = _lobbyId
let participantId = _participantId

console.log("lobbyId: ", lobbyId, "participatnId: ", participantId)

let url = `ws://localhost:5000/ws?lobbyId=${lobbyId}&participantId=${participantId}`;
let c = new WebSocket(url);

let send = function (data) {
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
document.getElementById('first-opt').addEventListener('click', () => handleClick(MessageType.CLICK_LEFT))
document.getElementById('second-opt').addEventListener('click', () => handleClick(MessageType.CLICK_RIGHT))



