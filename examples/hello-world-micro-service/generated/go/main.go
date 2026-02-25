package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

// ResponseData represents the JSON response structure.
type ResponseData struct {
	Message string `json:"message"`
}

// sayHello handles the GET /hello route.
func sayHello(w http.ResponseWriter, r *http.Request) {
	// 1. EXTRACT Input First and Last Name from the request URL query parameters.
	firstName := r.URL.Query().Get("First name")
	lastName := r.URL.Query().Get("Last name")

	// 2. VALIDATE Input First & Last Names:
	// a. IF either of the Name is empty or missing:
	//    i. SET Input Name to "World" (Default).
	var fullMessage string
	if firstName == "" || lastName == "" {
		fullMessage = "Vanakam World"
	} else {
		// 3. CONSTRUCT the response:
		// a. FORMAT the string: "Vanakam" + Last Name, First Name.
		fullMessage = fmt.Sprintf("Vanakam %s, %s", lastName, firstName)
	}

	// b. STORE it in Message Payload.
	payload := ResponseData{
		Message: strings.TrimSpace(fullMessage),
	}

	// 4. SEND Response:
	// a. SET HTTP Status Code to 200 (OK).
	// b. SET Content-Type header to "application/json".
	// c. WRITE Message Payload as JSON to the response body.
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(payload)
}

func main() {
	port := 8080
	http.HandleFunc("/hello", sayHello)

	fmt.Printf("Starting Hello Microservice on port %d...\n", port)
	err := http.ListenAndServe(fmt.Sprintf(":%d", port), nil)
	if err != nil {
		fmt.Printf("Error starting server: %s\n", err)
	}
}
