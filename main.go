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
		// Call the HTML method of the Context to render a template
		c.HTML(
			// Set the HTTP status to 200 (OK)
			http.StatusOK,
			// Use the index.html template
			"index.html",
			// Pass the data that the page uses (in this case, 'title')
			gin.H{
				"title": "Home Page",
				"err":   "",
			},
		)

	})
	router.GET("/lobby", func(c *gin.Context) {
		// Call the HTML method of the Context to render a template
		question := c.Query("question")
		firstOption := c.Query("first-opt")
		secondOption := c.Query("second-opt")

		// redirect back to the home page if all required parameters are not provided
		if question == "" || firstOption == "" || secondOption == "" {
			log.Println("showing home page???????????????????????????????????????")
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
			log.Println(*newLobby, " is lobby")
			// // jsonLobby, err := json.Marshal(newLobby)
			// if err != nil {
			// 	panic("can't marshal the lobby!")
			// }
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
			log.Println("found lobby with id")
			newParticipant := foundLobby.AddParticipant()
			log.Println("name:", newParticipant)
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
			log.Println("invalid lobby id received: ", ID)
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
			log.Println("found lobby: ", lobbyID)

			if participantID == "" {
				log.Println("returning lobby ws: ", lobbyID)
				foundLobby.MakeLobbyWsHandler(c.Writer, c.Request)
			} else {
				if foundLobby.MakeParticipantWsHandler(c.Writer, c.Request, participantID) {
					log.Println("found participant: ", lobbyID)
				} else {
					log.Println("invalid participant id received: ", participantID)
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
			log.Println("invalid lobby id received: ", lobbyID)
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
