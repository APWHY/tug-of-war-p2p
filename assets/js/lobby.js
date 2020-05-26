import { message, MessageType, messageIsValid } from './message.js'
import { addSeconds } from './time.js'
// import { QRCode } from './qrcode.min.js'

// getting values passed through by the html template
let lobbyId = _lobbyId;
let qrCodeUrl = _qrCodeUrl

console.log("lobbyId: ", lobbyId);
console.log("qrCodeUrl: ", qrCodeUrl);

let url = `ws://${window.location.host}/ws?lobbyId=${lobbyId}`;
let c = new WebSocket(url);

const EMPTY_COUNT = {
    [MessageType.CLICK_LEFT]: 0,
    [MessageType.CLICK_RIGHT]: 0
};

let total_count = { ...EMPTY_COUNT };
let clicker_counts = {};

c.onmessage = function (msg) {
    console.log(msg.data);
    let parsed = JSON.parse(msg.data);
    console.log(parsed, messageIsValid(parsed));
    if (messageIsValid(parsed)) {
        switch (parsed.type) {
            case MessageType.CLICK_LEFT:
            case MessageType.CLICK_RIGHT:
                total_count[parsed.type]++;
                if (parsed.value in clicker_counts) {
                    clicker_counts[parsed.value][parsed.type]++;
                } else {
                    clicker_counts[parsed.value] = { ...EMPTY_COUNT };
                    clicker_counts[parsed.value][parsed.type]++;
                }
                break;
            default:
                break;
        }
    }
    console.log(total_count);
    console.log(clicker_counts);
}

// c.onopen = function () {
//     setInterval(
//         function () { send("ping") }
//         , 1000)
// }

function handleClick(clicked) {
    console.log(`you have clicked ${clicked}`);
    c.send(clicked);
}
document.getElementById('start-btn').addEventListener('click', () => handleClick(message(MessageType.START, `${addSeconds(5)}`)));
document.getElementById('stop-btn').addEventListener('click', () => handleClick(message(MessageType.STOP, `${addSeconds(0)}`)));






// var qrCode = new QRCode(document.getElementById("qrcode"), {
//     width: 100,
//     height: 100
// });

// function makeCode() {
//     var elText = document.getElementById("text");

//     if (!elText.value) {
//         alert("Input a text");
//         elText.focus();
//         return;
//     }

//     qrCode.makeCode(elText.value);
// }

// makeCode();

