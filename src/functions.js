var inputLogArrayLength = 0;
const inputLogArray = [];
var inputCounter = 0;
const inputLineId = "activeInputLine";
const inputLineClass = "newInputLine";

// Used to prepare a new input field
function prepareCommandInput() {
    var commandInput = document.getElementById(inputLineId);
    commandInput.addEventListener ("keydown", function(event) {
        if (event.code == "Enter" || event.key == "KEYCODE_ENTER") {
            sendValue(event);
        }
        if (event.code === "ArrowUp") {
            navigateThroughCommandHistoryBackwards(commandInput, inputLogArray, inputCounter);
        }
        if (event.code === "ArrowDown") {
            navigateThroughCommandHistoryForward(commandInput, inputLogArray, inputCounter);
        }
        if (event.key == "-") { //event.key is independent of the keyboard layout
        }
    })
}

//Executed when "Enter" is pressed
function sendValue(event) {
    var command = event.target.value;

    logCommand(command, inputLogArray, inputCounter);
    getCommand(command);
}

//Executed when "Arrow Up" is pressed
function navigateThroughCommandHistoryBackwards() {
    var value = inputLogArray[inputCounter - 1];

    if (inputCounter > 0) {
        inputCounter--;
        document.getElementById(inputLineId).value = value;
    }
}

//Executed when "Arrow Down" is pressed
function navigateThroughCommandHistoryForward(){
    var value = inputLogArray[inputCounter + 1];

    if (inputCounter < (inputLogArray.length - 1)) {
        inputCounter++;
        document.getElementById(inputLineId).value = value;
    }
}

function errorMessage(message) {
    document.getElementById('insertTest').insertAdjacentHTML('beforeend', "<p class='error'>" + message + "</p>");
}

function createNewInputLine(command) {
    const newInputLine = "<p class='input'>PS CV:> <input class='" + inputLineClass + "' id='" + inputLineId + "' type='text' spellcheck='false'></p>";

    document.getElementById('insertTest').insertAdjacentHTML('beforeend', "<br class='breakNewInputField'>");
    document.getElementById('insertTest').insertAdjacentHTML('beforeend', newInputLine);

    if (command != "clear" && command != "Clear-Host") {
        document.getElementById(inputLineId).removeAttribute('id');
    }

    prepareCommandInput(inputLogArray, inputCounter);
    document.getElementById(inputLineId).focus();
}

function insertHtml(line) {
    document.getElementById('insertTest').insertAdjacentHTML('beforeend', line);
}

function generateHtmlFromResponse(response) {
   
    if (!("Error" in response)) {
        var items = response.Values;

        for(var i = 0; i < items.length; i++) {
            var keys = Object.keys(response.Values[i]);
                for(var x = 0; x < keys.length; x++) {
                    var key = keys[x];
                    var value = response.Values[i][key];

                    if (x == 0) {
                        var html = "<p class='response' id='newResponseBlock'>" + key + ": " + value + "</p>";
                    } else {
                        var html = "<p class='response'>" + key + ": " + value + "</p>";
                    }
                    
                    insertHtml(html);
                }
        }
    } else {
        errorMessage(response.Message)
    }
}

function apiRequest(requestUrl, command) {
    
        fetch(requestUrl, {
            method: "POST",
            headers: {},
            body: JSON.stringify({"Command": command}),
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            generateHtmlFromResponse(data);
            createNewInputLine();
        })
    }

function getCommand(command) {

    if (command.toLowerCase() == "clear" || command.toLowerCase() == "clear-host") {
        clear();
        createNewInputLine(command);
    } else if (command.toLowerCase() == "open-githubrepo" || command.toLowerCase() == "open-githubrepository"){
        window.open("https://github.com/UA-Homelab/PowerShell-CV").focus();
    } 
    else {
        const requestUrl = "https://fa-pscv-prod-ne-001.azurewebsites.net/api/getCommand"
        //const requestUrl = "http://localhost:60371/api/getCommand"
        apiRequest(requestUrl, command);
    }
}

function clear() {
    classNames = [
        "response",
        "newInputLine",
        "breakNewInputField",
        "input",
        "error"
    ];
    classNames.forEach(className => {
        const elements = document.getElementsByClassName(className);
        while(elements.length > 0){
            elements[0].parentNode.removeChild(elements[0]);
        }
    })
}

function logCommand(command) {
    inputLogArray.push(command);
    inputCounter++;
}