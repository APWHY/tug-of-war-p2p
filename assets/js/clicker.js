// getting values passed through by the html template
var lobbyId = _lobbyId
var participantId = _participantId

console.log("lobbyId: ", lobbyId, "participatnId: ", participantId)

url = `ws://localhost:5000/ws?lobbyId=${lobbyId}&participantId=${participantId}`;
c = new WebSocket(url);

send = function (data) {
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


function handleClick(isLeft) {
    clicked = 'left' ? isLeft : 'right'
    console.log(`you have clicked ${isLeft}`)
    c.send(clicked)
}



