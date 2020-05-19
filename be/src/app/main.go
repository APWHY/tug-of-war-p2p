package main

import (
	"log"
	"net/http"

	"rsc.io/quote"
)

func main() {
	http.Handle("/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Println("Hello Mars!")
	}))
	log.Println("Now server is running on port 3000")
	log.Println(quote.Hello())
	http.ListenAndServe(":3000", nil)
}
