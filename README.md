# My life in a PowerShell

## About

## Infrastructure

The infrastructure consists of a Static Web App (Free), an Azure Function App (Consumption Plan) and an Azure CosmosDB (Free). It was deployed using Bicep and GitHub Actions.



![infrastructure_overview](readme_files/infrastructure.png)

1. User interacts with site.
2. Command gets send to Function App.
3. Function App authenticates against CosmosDB with managed identity and gets the .json, in which the command is defined.
4. CosmosDB returns the json content.
5. Function App responds with a json object and Frontend renders the command output for the user.

## Commands and features

The commands return information about me. 

| Command | Description |
|---------|-------------|
|Get-Help | Returns all available commands and information about them |
|Get-Hobby| Returns a list of my hobbies |
|Get-Certification| Returns a list of all my acitive certifications|
|Get-Skill| Returns a list of my skills and how proficient I am in each of them|
| Get-Education| Returns information about my formal education|
| Get-WorkExperience| Returns a list about the roles and companies I have worked in|
| Get-PersonalInformation | Returns personal information about me |
| Open-GitHubRepo | Opens the projects repository |
| Open-SoundCloud | Opens my SoundCloud page |
| Open-LinkedIn | Opens my LinkedIn profile |
| Show-Welcome | Opens the welcome message, that is opened when the page loads the first time |


I also tried to make the experience as close to working in an actual PowerShell as possible. That's why I imlemented the following features:

- Complete a command using the "Tab"-Key.
- Interrupt the current input with ctrl+c.
- Navigate through the command history by using the arrow keys up and down.


