package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/Azure/azure-sdk-for-go/sdk/data/azcosmos"

	_ "github.com/microsoft/go-mssqldb"
)

type ReturnError struct {
	Message string
	Error   error
}

type getCommandRequestBody struct {
	Command string
}

// Error writes logs in the color red with "ERROR: " as prefix
var Error = log.New(os.Stdout, "\u001b[31mERROR: \u001b[0m", log.LstdFlags|log.Lshortfile)

func main() {
	serverPort := ":8080"
	if val, ok := os.LookupEnv("FUNCTIONS_CUSTOMHANDLER_PORT"); ok {
		serverPort = ":" + val
	}
	// Define routes and handler functions
	http.HandleFunc("/api/getCommand", getCommand)

	// Start the server on port 8080
	fmt.Printf("Server running at http://localhost%v\n", serverPort)

	http.ListenAndServe(fmt.Sprintf("%v", serverPort), nil)
}

func getCommand(w http.ResponseWriter, r *http.Request) {

	var commandNotFound ReturnError

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	w.Header().Set("Content-Type", "application/json")

	decoder := json.NewDecoder(r.Body)

	var body getCommandRequestBody

	err := decoder.Decode(&body)
	if err != nil {
		Error.Println(err)
	}

	fmt.Println(body.Command)

	credential, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		Error.Printf("failed to obtain a credential: %v", err)
	}

	clientOptions := azcosmos.ClientOptions{
		EnableContentResponseOnWrite: true,
	}

	client, err := azcosmos.NewClient("https://cdb-pscv-prod-ne-001.documents.azure.com:443/", credential, &clientOptions)
	if err != nil {
		Error.Println(err)
	}

	database, err := client.NewDatabase("powershellcv")
	if err != nil {
		Error.Println(err)
	}

	container, err := database.NewContainer("commands")
	if err != nil {
		Error.Println(err)
	}

	partitionKey := azcosmos.NewPartitionKeyString(body.Command)

	context := context.TODO()

	response, err := container.ReadItem(context, partitionKey, body.Command, nil)
	if err != nil {
		commandNotFound.Message = "The term '" + body.Command + "' is not recognized as a name of a cmdlet, function, script file, or executable program.<br> Check the spelling of the name. For a list of available commands you can enter 'Get-Help'."
		commandNotFound.Error = err

		jsonError, _ := json.Marshal(commandNotFound)

		fmt.Fprintln(w, string(jsonError))
		Error.Println(err)
	}

	fmt.Println(string(response.Value))
	fmt.Fprintln(w, string(response.Value))
}
