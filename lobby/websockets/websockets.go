package websockets

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var wsupgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

type messageType int

// this should be matched up to the MessageType constant in assets/js/message.js
const (
	// Start starts the game
	Start messageType = iota
	// Stop ends the game and gets click data
	Stop
	// ClickLeft shows that the left option has been clicked once
	ClickLeft
	// ClickRight shows that the right option has been clicked once
	ClickRight
	// NewUser tells the lobby that a new user has joined the lobby
	NewUser
	messageTypeLast
)

// Message is the information sent to and from the server and the websocket client
type Message struct {
	Kind  messageType `json:"type"`
	Value interface{} `json:"value"`
}

// MessageSender is a function that will allow you to send a message to the client
type MessageSender func(*Message)

// WsHandlerGen returns a connection that will allow us to send messages as well as running a goroutine that pipes recieved messages into the specified channel
func WsHandlerGen(w http.ResponseWriter, r *http.Request, channel chan *Message) (MessageSender, bool) {
	conn, err := wsupgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to set websocket upgrade: %+v", err)
		return nil, false
	}
	// listen for messages and pass them into channel
	go func() {
		for {
			_, msg, err := conn.ReadMessage()
			log.Printf("recieved message %s", msg)
			if err != nil {
				log.Printf("Socket connection terminated due to err: %s", err)
				break
			}
			msgInt, ok := msgUnmarshal(msg)
			if ok {
				channel <- msgInt
			}
		}
	}()
	return senderGenerator(conn), true

}

func senderGenerator(c *websocket.Conn) MessageSender {
	return func(msg *Message) {
		c.WriteMessage(websocket.TextMessage, msgMarshal(msg))
	}
}

func msgUnmarshal(msg []byte) (*Message, bool) {

	var dat map[string]interface{}
	if err := json.Unmarshal(msg, &dat); err != nil {
		log.Printf("Error unmarshalling message: %s", err)
	}

	kind, ok := dat["type"]

	if !ok {
		log.Printf("message %s does not have a 'type' field", msg)
		return nil, false
	}

	if messageType(kind.(float64)) >= messageTypeLast {
		log.Printf("kind %d is not a type of Message", kind)
		return nil, false
	}

	value, ok := dat["value"]

	if !ok {
		log.Printf("message %s has no 'value' field", msg)
		return nil, false
	}
	return &Message{
		Kind:  messageType(kind.(float64)), // we only send ints but json automatically assumes float64 so we need to assert before we convert
		Value: value,
	}, true

}

func msgMarshal(msg *Message) []byte {
	retVal, err := json.Marshal(msg)
	if err != nil { // this should always be working, so we don't bother to pass the error
		log.Printf("error marshalling message to json: %s", err)
	}
	return retVal
}
