package main

import (
	"log"
	"net/http"

	petname "github.com/dustinkirkland/golang-petname"
	"github.com/gin-gonic/gin"

	"gitlab.bcgdv.io/syd/tug-of-war/lobby"
)

var lobbies = map[string]*lobby.Lobby{}

func main() {
	// Set the router as the default one shipped with Gin
	router := gin.Default()
	petname.NonDeterministicMode()
	router.LoadHTMLGlob("templates/*")
	router.Static("/assets", "./assets")

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
			log.Println("making new lobby")

			newLobby := lobby.CreateLobby(question, firstOption, secondOption)
			lobbies[newLobby.ID.String()] = newLobby
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
				if !foundLobby.MakeParticipantWsHandler(c.Writer, c.Request, participantID) {
					c.HTML(
						http.StatusOK,
						"index.html",
						gin.H{
							"title": "Home Page",
							"err":   "invalid participant id (from clicker)",
						},
					)
				}
			}
		} else {
			c.HTML(
				http.StatusOK,
				"index.html",
				gin.H{
					"title": "Home Page",
					"err":   "invalid lobby id (from clicker)",
				},
			)
		}
	})

	// Start and run the server
	router.Run(":5000")
}
