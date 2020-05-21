package main

import (
	"log"
	"net/http"

	petname "github.com/dustinkirkland/golang-petname"
	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"

	"gitlab.bcgdv.io/syd/tug-of-war/lobby"
)

var lobbies = map[uuid.UUID]*lobby.Lobby{}

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
			},
		)

	})
	router.GET("/lobby", func(c *gin.Context) {
		// Call the HTML method of the Context to render a template
		log.Println("wowzers")
		question := c.Query("question")
		firstOption := c.Query("first-opt")
		secondOption := c.Query("second-opt")
		log.Println(question, firstOption, secondOption, "----------")

		// redirect back to the home page if all required parameters are not provided
		if question == "" || firstOption == "" || secondOption == "" {
			log.Println("showing home page???????????????????????????????????????")
			c.HTML(
				http.StatusOK,
				"index.html",
				gin.H{
					"title": "Home Page",
				},
			)
		} else {
			log.Println("making new lobby")

			newLobby := lobby.CreateLobby(question, firstOption, secondOption)
			lobbies[newLobby.ID] = newLobby
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
					"id":        newLobby.ID,
					"question":  newLobby.Question.Question,
					"firstOpt":  newLobby.Question.Left,
					"secondOpt": newLobby.Question.Right,
				},
			)

		}

	})
	router.GET("/clicker", func(c *gin.Context) {
		// lobby.CreateLobby(question, firstOption, secondOption).AddName()

		c.HTML(
			http.StatusOK,
			"clicker.html",
			gin.H{
				"title": "Clicker",
			},
		)

	})

	// Start and run the server
	router.Run(":5000")
}
