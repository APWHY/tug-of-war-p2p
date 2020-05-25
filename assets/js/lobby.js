// getting values passed through by the html template
var lobbyId = _lobbyId

console.log("lobbyId: ", lobbyId)

url = `ws://localhost:5000/ws?lobbyId=${lobbyId}`;
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





