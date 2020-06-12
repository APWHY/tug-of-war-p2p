package main

import (
	"net/http"
	"time"

	petname "github.com/dustinkirkland/golang-petname"
	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"

	"gitlab.bcgdv.io/syd/tug-of-war/lobby"
)

var lobbies = map[string]*lobby.Lobby{}

func deleteLobby(ID uuid.UUID) {
	delete(lobbies, ID.String())
}

func main() {
	// Set the router as the default one shipped with Gin
	router := gin.Default()
	petname.NonDeterministicMode()
	router.LoadHTMLGlob("templates/*")
	router.Static("/static", "./static")

	router.GET("/", func(c *gin.Context) {
		c.HTML(
			http.StatusOK,
			"index.html",
			gin.H{
				"title": "Home Page",
				"err":   "",
			},
		)

	})
	router.GET("/lobby", func(c *gin.Context) {
		question := c.Query("question")
		firstOption := c.Query("first-opt")
		secondOption := c.Query("second-opt")

		// redirect back to the home page if all required parameters are not provided
		if question == "" || firstOption == "" || secondOption == "" {
			c.HTML(
				http.StatusOK,
				"index.html",
				gin.H{
					"title": "Home Page",
					"err":   "invalid lobby parameters",
				},
			)
		} else {
			newLobby := lobby.CreateLobby(question, firstOption, secondOption, deleteLobby)
			lobbies[newLobby.ID.String()] = newLobby
			time.AfterFunc(time.Hour, newLobby.DeleteLobby) // delete lobbies that have existed for an hour
			c.HTML(
				http.StatusOK,
				"lobby.html",
				gin.H{
					"title":     "Lobby",
					"lobbyId":   newLobby.ID,
					"question":  newLobby.Question.Question,
					"firstOpt":  newLobby.Question.Left,
					"secondOpt": newLobby.Question.Right,
				},
			)

		}

	})
	router.GET("/clicker", func(c *gin.Context) {
		ID := c.Query("lobbyId")

		if foundLobby, ok := lobbies[ID]; ok {
			newParticipant := foundLobby.AddParticipant()
			c.HTML(
				http.StatusOK,
				"clicker.html",
				gin.H{
					"title":         "Buttons",
					"id":            foundLobby.ID,
					"question":      foundLobby.Question.Question,
					"firstOpt":      foundLobby.Question.Left,
					"secondOpt":     foundLobby.Question.Right,
					"name":          newParticipant.Name,
					"participantId": newParticipant.ID,
				},
			)
		} else {
			c.HTML(
				http.StatusOK,
				"index.html",
				gin.H{
					"title": "Home Page",
					"err":   "invalid lobby id",
				},
			)
		}

	})

	router.GET("/ws", func(c *gin.Context) {
		lobbyID := c.Query("lobbyId")
		participantID := c.Query("participantId")
		if foundLobby, ok := lobbies[lobbyID]; ok {
			if participantID == "" {
				foundLobby.MakeLobbyWsHandler(c.Writer, c.Request)
			} else {
				foundLobby.MakeParticipantWsHandler(c.Writer, c.Request, participantID)
			}
		}
	})

	// Start and run the server
	router.Run("192.168.0.24:5000")
	router.Run(":5000")
}
