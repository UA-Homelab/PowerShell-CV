targetScope = 'subscription'

import { getLocationShortcut} from 'functions/getLocationShortcut.bicep'

@description('A shortcut of the applications name. Used to generate resource name.')
param applicationShort string = 'pscv'

@allowed(['Dev', 'Test','Staging', 'QA', 'Prod'])
param environment string = 'Prod'

@description('Resource Location.')
param region string = 'northeurope'
param staticWebAppRegion string = 'westeurope' //static web app was not available in northeurope and cosmos db not in westeurope

@description('Optional: An index for the resource name. Default "001".')
param index string = '001'

// parameters for static web app
param staticWebAppSku string = 'Free'
param buildPipelineAppLocation string = 'src'
param repositoryBranch string = 'main'
param repositoryUrl string = 'https://github.com/UA-Homelab/PowerShell-CV'
param buildPipelineApiLocation string?
param repositoryToken string?

// parameters for function app
param functionAppRuntime string = 'custom'
param functionAppSkuName string = 'Y1'

//parameters for cosmos db
param cosmosDbDatabaseName string = 'powershellcv'
param cosmosDbContainerName string = 'commands'
param cosmosDbPartitionKeyPaths array = [
  '/command_name'
]

var location_short = getLocationShortcut(region)
var resource_name_suffix = toLower('${applicationShort}-${environment}-${location_short}-${index}')
var resource_group_name = 'rg-${resource_name_suffix}'
var static_web_app_name = toLower('swa-${applicationShort}-${environment}-${getLocationShortcut(staticWebAppRegion)}-${index}')
var function_app_name = 'func-${resource_name_suffix}'
var cosmos_db_account_name = 'cosmos-${resource_name_suffix}'

resource resource_group 'Microsoft.Resources/resourceGroups@2023-07-01' = {
  name: resource_group_name
  location: region
}

module static_web_app 'modules/static_web_app.bicep' = {
  scope: resourceGroup(resource_group.name)
  name: '${deployment().name}-swa'
  params: {
    repositoryToken: repositoryToken
    region: staticWebAppRegion
    sku: staticWebAppSku
    buildPipelineAppLocation: buildPipelineAppLocation
    repositoryBranch: repositoryBranch
    repositoryUrl: repositoryUrl
    staticWebAppName: static_web_app_name
    buildPipelineApiLocation: buildPipelineApiLocation
  }
}

module function_app 'modules/function_app.bicep' = {
  scope: resourceGroup(resource_group.name)
  name: '${deployment().name}-func'
  params: {
    allowedOrigins: [static_web_app.outputs.out_static_web_app_default_url, static_web_app.outputs.out_static_web_app_custom_url]
    functionAppName: function_app_name
    runtime: functionAppRuntime
    skuName: functionAppSkuName
  }
}

module cosmos_db 'modules/cosmos_db_free.bicep' = {
  scope: resourceGroup(resource_group.name)
  name: '${deployment().name}-cosmos'
  params: {
    accountName: cosmos_db_account_name
    containerName: cosmosDbContainerName
    databaseName: cosmosDbDatabaseName
    partitionKeyPaths: cosmosDbPartitionKeyPaths
    readerRoleAssignmentPrincipalId: function_app.outputs.out_function_app_identity_principal_id
  }
}
