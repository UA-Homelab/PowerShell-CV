const inputLogArray = [];
const inputLineId = "activeInputLine";
const inputLineClass = "newInputLine";
const availableCommands = [ 
    "Get-Help",
    "Get-Certification", 
    "Get-Education", 
    "Get-Hobby", 
    "Get-PersonalInformation", 
    "Get-Skill", 
    "Get-WorkExperience",
    "Open-GitHubRepo", 
    "Open-LinkedIn", 
    "Open-SoundCloud", 
    "Show-Welcome",
    "Clear-Host", 
]

var alreadyTabedCommands = [];
var saveInputLineValue = "";
var tabPressCounter = 0;
var inputCounter = 0;
var inputLogArrayLength = 0;

// Used to prepare a new input field
function prepareCommandInput() {
    var commandInput = document.getElementById(inputLineId);
    commandInput.addEventListener ("keydown", function(event) {
        if (event.key == "Enter") { //event.code == "Enter" || 
            sendValue(event);
            inputCounter = inputLogArray.length
        }
        if (event.code === "ArrowUp") {
            navigateThroughCommandHistoryBackwards(commandInput, inputLogArray, inputCounter);
        }
        if (event.code === "ArrowDown") {
            navigateThroughCommandHistoryForward(commandInput, inputLogArray, inputCounter);
        }
        if (event.key == "-") {
        }
        if (event.key === 'Tab') {
            event.preventDefault();
            pressTabToComplete();
        }
        if (event.key === 'Backspace') {
            tabPressCounter = 0;
            alreadyTabedCommands = []
        }
        if (event.ctrlKey && event.key === 'c') {
            inputCounter = inputLogArray.length
            tabPressCounter = 0;
            event.preventDefault();
            commandPlusC()
            createNewInputLine();
        }
    })
}

function commandPlusC() {
    const inputLine = document.getElementById(inputLineId);
    
    const inputDummy = '<div class="dummyInputLine" id="activeInputLine">' + inputLine.value + '</div>'
    const coloredText = inputDummy + "<p class='commandPlusC' style='display:inline; color:red;'>^C</p>";
    inputLine.outerHTML = coloredText
}

function pressTabToComplete() {

    var inputLineValue = document.getElementById(inputLineId).value;

    if (tabPressCounter == 0) {saveInputLineValue = inputLineValue};

    tabPressCounter = tabPressCounter + 1

    for(var i = 0; i < availableCommands.length; i++) {

        var availableCommandLowercase = availableCommands[i].toLowerCase();

        if (availableCommandLowercase.startsWith(saveInputLineValue.toLowerCase()) && !alreadyTabedCommands.includes(availableCommandLowercase)) {

            document.getElementById(inputLineId).value = availableCommands[i];
            alreadyTabedCommands.push((document.getElementById(inputLineId).value).toLowerCase());
            console.log(alreadyTabedCommands)
            console.log(tabPressCounter)

            return

        }


    } 

}

//Executed when "Enter" is pressed
function sendValue(event) {
    var command = event.target.value;

    tabPressCounter = 0
    alreadyTabedCommands = []

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
    } else {
        document.getElementById(inputLineId).value = null;
        inputCounter = inputLogArray.length
    }
}

function errorMessage(message) {
    document.getElementById('insertTest').insertAdjacentHTML('beforeend', "<span><p class='error'>" + message + "</p></span>");
    document.getElementById('insertTest').insertAdjacentHTML('beforeend', "<div class='breakNewInputField'><div>");
}

function createNewInputLine(command) {
    const newInputLine = "<p class='input'>PS CV:> <input class='" + inputLineClass + "' id='" + inputLineId + "' type='text' spellcheck='false' autocomplete='off'></p>";

    
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
                        var html = "<p class='response' id='newResponseBlock'>" + "<span class='key'>" + key + ":</span> " + value + "</p>";
                    } else {
                        var html = "<p class='response'>" + "<span class='key'>" + key + ":</span>  " + value + "</p>";
                    }
                    
                    insertHtml(html);
                }
        }
        document.getElementById('insertTest').insertAdjacentHTML('beforeend', "<div class='breakNewInputField'><div>");
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
        createNewInputLine(command);
    } else if (command.toLowerCase() == "open-soundcloud"){
        window.open("https://soundcloud.com/ua_records").focus();
        createNewInputLine(command);
    } else if (command.toLowerCase() == "open-linkedin"){
        window.open("https://www.linkedin.com/in/alexander-urdl/").focus();
        createNewInputLine(command);
    } else if (command.toLowerCase() == "show-welcome" || command.toLowerCase() == "show-welcomemessage") {
        document.getElementById("overlay").style.display = "block";
        createNewInputLine(command);
    }
    else {
        const requestUrl = "https://func-pscv-prod-eun-001.azurewebsites.net/api/getCommand"
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

function closeOverlay() {
    document.getElementById("overlay").style.display = "none";

    setTimeout(() => {
        document.getElementById(inputLineId).focus();
    }, 0);
    
}
