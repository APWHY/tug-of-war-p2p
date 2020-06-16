package main

import (
	"github.com/gin-gonic/gin"
)

// the 'serverless' variant of the tug-of-war applciation does not need a webserver -- this is solely used as a development environment
func main() {
	// Set the router as the default one shipped with Gin
	router := gin.Default()

	router.Static("/", "./static")

	// Start and run the server
	router.Run("192.168.0.24:5000")
	router.Run(":5000")
}
