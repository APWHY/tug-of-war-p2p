// message.js -- helper functions to make serialisation and deserialisation of messages sent via websocket easier

// if you change this also change the Message type in lobby/websockets/websockets.go
export const MessageType = {
    START: 0,
    STOP: 1,
    CLICK_LEFT: 2,
    CLICK_RIGHT: 3,
    NEW_USER: 4,
};
Object.freeze(MessageType);

export const EMPTY_COUNT = {
    [MessageType.CLICK_LEFT]: 0,
    [MessageType.CLICK_RIGHT]: 0
};
Object.freeze(EMPTY_COUNT);

export function message(type, value) {
    return JSON.stringify({ type, value })
}

export function messageIsValid(message) {
    return message.type != undefined && message.value != undefined
}