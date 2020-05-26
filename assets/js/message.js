// message.js -- helper functions to make serialisation and deserialisation of messages sent via websocket easier

export const MessageType = {
    START: 0,
    STOP: 1,
    CLICK_LEFT: 2,
    CLICK_RIGHT: 3,
};
Object.freeze(MessageType);


export function message(type, value) {
    return JSON.stringify({ type, value })
}
export function messageIsValid(message) {
    return message.type != undefined && message.value != undefined
}