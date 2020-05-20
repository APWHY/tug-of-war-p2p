package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	// Set the router as the default one shipped with Gin
	router := gin.Default()

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

	// // Serve frontend static files
	// router.Use(static.Serve("/", static.LocalFile("./client/build", true)))

	// // Setup route group for the API
	// api := router.Group("/api")
	// {
	// 	api.GET("/", func(c *gin.Context) {
	// 		c.JSON(http.StatusOK, gin.H{
	// 			"message": "pong",
	// 		})
	// 	})
	// }

	// Start and run the server
	router.Run(":5000")
}
