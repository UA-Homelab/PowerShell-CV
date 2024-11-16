New-AzDeployment `
    -Name "deploy-pscv-resources" `
    -Location "northeurope" `
    -TemplateFile ".\main.bicep" 