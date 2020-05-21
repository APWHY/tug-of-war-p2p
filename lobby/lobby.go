package lobby

import (
	petname "github.com/dustinkirkland/golang-petname"
	uuid "github.com/satori/go.uuid"

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

// A Lobby is the representation of a single 'game' of tug of war
type Lobby struct {
	ID           uuid.UUID
	Participants map[string]int
	Count        Count
	Question     Question
}

// CreateLobby is a convienence wrapper for creating a lobby with just a question
func CreateLobby(question string, leftOption string, rightOption string) *Lobby {
	return &Lobby{
		ID:           uuid.NewV4(),
		Participants: map[string]int{},
		Count: Count{
			Left:  0,
			Right: 0,
		},
		Question: Question{
			Question: question,
			Left:     leftOption,
			Right:    rightOption,
		},
	}
}

var excludedWords = [...]string{"up", "upwards", "chigger"}

// AddName will generate an anonymous name for users to use and add them to the lobby's participants
func (l *Lobby) AddName() string {
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

	println(name, "----------------------|--------------------------")
	return ""
}
