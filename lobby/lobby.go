package lobby

import (
	petname "github.com/dustinkirkland/golang-petname"
	uuid "github.com/satori/go.uuid"
	"gitlab.bcgdv.io/syd/tug-of-war/lobby/websockets"

	"strings"
)

// Count is a count of how many times each option was selected
type Count struct {
	Left  int
	Right int
}

// Question is the question and options available to those in the lobby
type Question struct {
	Question string
	Left     string
	Right    string
}

// Participant is a struct wrapping each individual player in a tug of war lobby
type Participant struct {
	ID      uuid.UUID
	Name    string
	handler websockets.ParticipantWsHandler
}

// A Lobby is the representation of a single 'game' of tug of war
type Lobby struct {
	ID           uuid.UUID
	Participants map[string]Participant
	Count        Count
	Question     Question
	handler      websockets.LobbyWsHandler
}

// CreateLobby is a convienence wrapper for creating a lobby with just a question
func CreateLobby(question string, leftOption string, rightOption string) *Lobby {
	return &Lobby{
		ID:           uuid.NewV4(),
		Participants: map[string]Participant{},
		Count: Count{
			Left:  0,
			Right: 0,
		},
		Question: Question{
			Question: question,
			Left:     leftOption,
			Right:    rightOption,
		},
		handler: websockets.LobbyWsHandlerGen(),
	}
}

// there are some words that this library provides taht don't really provide for good names, so there is a small list here of words to remove
var excludedWords = [...]string{"up", "upwards", "chigger", "woodcock"}

// AddParticipant will generate an anonymous name for users to use and add them to the lobby's participants
func (l *Lobby) AddParticipant() Participant {
	name := ""
	shouldRetry := true
	for shouldRetry {
		shouldRetry = false
		name = petname.Generate(2, " ")
		for _, word := range excludedWords {
			if strings.Contains(name, word) {
				shouldRetry = true
			}

		}

	}

	newParticipant := Participant{ID: uuid.NewV4(), Name: name, handler: websockets.ParticipantWsHandlerGen()}
	l.Participants[newParticipant.ID.String()] = newParticipant
	return newParticipant
}

// GetParticipantWsHandler will return the websocket handler that is responsible for keeping track on button presses from that participant
func (l *Lobby) GetParticipantWsHandler(participantID string) (websockets.ParticipantWsHandler, bool) {

	// for k := range l.Participants {
	// 	println(k)
	// 	println(participantID)
	// 	println(k == participantID)
	// }

	if foundParticipant, ok := l.Participants[participantID]; ok {
		return foundParticipant.handler, true
	}
	return nil, false
}

// GetLobbyWsHandler will return the websocket handler that is responsible for recieving the current button presses from all clickers
func (l *Lobby) GetLobbyWsHandler() websockets.LobbyWsHandler {
	return l.handler
}
