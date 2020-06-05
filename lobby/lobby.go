package lobby

import (
	"log"
	"net/http"

	petname "github.com/dustinkirkland/golang-petname"
	uuid "github.com/satori/go.uuid"
	"gitlab.bcgdv.io/syd/tug-of-war/lobby/websockets"

	"strings"
)

// Question is the question and options available to those in the lobby
type Question struct {
	Question string
	Left     string
	Right    string
}

// Participant is a struct wrapping each individual player in a tug of war lobby
type Participant struct {
	ID     uuid.UUID
	Name   string
	sender websockets.MessageSender // allows us to send messages to the participant's client
}

// Deleter is a callback function used to remove this lobby from any external store of lobbies
type Deleter func(name uuid.UUID)

// A Lobby is the representation of a single 'game' of tug of war
type Lobby struct {
	ID           uuid.UUID
	Participants map[string]*Participant
	Question     Question
	sender       websockets.MessageSender // allows us to send messages to the lobby client
	lobbyPipe    chan *websockets.Message // all incoming messages on the lobby's WS connection get pushed to this channel
	clickerPipe  chan *websockets.Message // all incoming messages on all participants' WS connections get pushed to this channel
	stopPipe     chan struct{}            // used to tell all websocket listeners to close down
	lobbyDeleter func()
}

// CreateLobby is a convienence wrapper for creating a lobby with just a question
func CreateLobby(question string, leftOption string, rightOption string, deleter Deleter) *Lobby {
	newID := uuid.NewV4()
	return &Lobby{
		ID:           newID,
		Participants: map[string]*Participant{},
		Question: Question{
			Question: question,
			Left:     leftOption,
			Right:    rightOption,
		},
		lobbyPipe:    make(chan *websockets.Message),
		clickerPipe:  make(chan *websockets.Message),
		stopPipe:     make(chan struct{}),
		lobbyDeleter: func() { deleter(newID) },
	}
}

// there are some words that this library provides taht don't really provide for good names, so there is a small list here of words to remove
var excludedWords = [...]string{"up", "upwards", "chigger", "woodcock"}

// AddParticipant will generate an anonymous name for users to use and add them to the lobby's participants
func (l *Lobby) AddParticipant() *Participant {
	name := ""
	shouldRetry := true
	for shouldRetry {
		shouldRetry = false
		name = strings.Title(petname.Generate(2, " "))
		for _, word := range excludedWords {
			if strings.Contains(name, word) {
				shouldRetry = true
			}
		}
	}

	newParticipant := &Participant{ID: uuid.NewV4(), Name: name, sender: websockets.DummySender}
	l.Participants[newParticipant.ID.String()] = newParticipant
	return newParticipant
}

// MakeLobbyWsHandler will return the function responsible for making the websocket handler for a lobby and attaching it to the lobbyPipe as well as setting up listeners on the clicker and lobby channels
func (l *Lobby) MakeLobbyWsHandler(w http.ResponseWriter, r *http.Request) bool {
	sender, ok := websockets.WsHandlerGen(w, r, l.lobbyPipe, l.stopPipe)
	if !ok {
		return ok
	}
	l.sender = sender
	go l.lobbyWatcher()
	go l.clickersWatcher()
	return ok

}

// MakeParticipantWsHandler will return the function responsible for making the websocket handler for a participant and attaching it to the clickerPipe
func (l *Lobby) MakeParticipantWsHandler(w http.ResponseWriter, r *http.Request, participantID string) bool {
	if foundParticipant, ok := l.Participants[participantID]; ok {
		sender, ok := websockets.WsHandlerGen(w, r, l.clickerPipe, l.stopPipe)
		if !ok {
			return false
		}
		foundParticipant.sender = sender
		return true
	}

	return false
}

// DeleteLobby provides a way for the external context to forcibly close the lobby, as well as being the normal way in which a lobby will close down
func (l *Lobby) DeleteLobby() {
	close(l.stopPipe)
	l.lobbyDeleter()

}

// lobbyWatcher handles messages sent along lobbyPipe
func (l *Lobby) lobbyWatcher() {
	for {
		recv := <-l.lobbyPipe
		for _, p := range l.Participants {
			p.sender(recv)
		}
		l.sender(recv)
		if recv.Kind == websockets.Stop {
			l.DeleteLobby()
		}
	}
}

// clickersWatcher handles messages sent along clickerPipe
func (l *Lobby) clickersWatcher() {
	for {
		recv := <-l.clickerPipe
		participantName, ok := l.Participants[recv.Value.(string)]
		if ok {
			recv.Value = participantName.Name
			l.sender(recv)

		} else {
			log.Printf("WARNING: Incorrect participant id recieved %s", recv.Value)
		}

	}
}
