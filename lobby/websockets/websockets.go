package websockets

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var wsupgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

// ParticipantWsHandler is a websocket handler for an individual participant
type ParticipantWsHandler = func(http.ResponseWriter, *http.Request)

// LobbyWsHandler is a websocket handler for an individual lobby
type LobbyWsHandler = func(http.ResponseWriter, *http.Request)

// Wshandler only echos for now -- this needs to be come two different types of websocket handler (one for clickers and one for the lobby)
func Wshandler(w http.ResponseWriter, r *http.Request) {
	conn, err := wsupgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to set websocket upgrade: %+v", err)
		return
	}

	for {
		t, msg, err := conn.ReadMessage()
		log.Printf("recieved message %s", msg)
		if err != nil {
			log.Printf("Socket connection terminated due to err: %s", err)
			break
		}
		conn.WriteMessage(t, msg)
	}
}

// ParticipantWsHandlerGen will generate a ParticipantWsHandler for us to use
func ParticipantWsHandlerGen() ParticipantWsHandler {
	return Wshandler
}

// LobbyWsHandlerGen will generate a LobbyWsHandler for us to use
func LobbyWsHandlerGen() LobbyWsHandler {
	return Wshandler
}
