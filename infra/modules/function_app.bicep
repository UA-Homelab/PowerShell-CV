@description('The name of the function app that you wish to create.')
param functionAppName string

@description('Storage Account type')
@allowed([
  'Standard_LRS'
  'Standard_GRS'
  'Standard_RAGRS'
])
param storageAccountType string = 'Standard_LRS'

@description('Location for all resources.')
param region string = resourceGroup().location

@allowed([ 
'Y1' 
'EP1'  
'EP2'  
'EP3'  
'P1V2' 
'P2V2' 
'P3V2' 
'P1V3' 
'P2V3' 
'P3V3'
])
param skuName string

@description('The language worker runtime to load in the function app.')
@allowed([ 'dotnet', 'dotnet-isolated', 'node', 'python', 'java', 'powershell', 'custom' ])
param runtime string

param allowedOrigins array

var app_service_plan_name = 'asp-${functionAppName}'
var application_insights_name = 'appi-${functionAppName}'
var storage_account_name = replace('st${functionAppName}', '-', '')
var sku_tier = skuName == 'Y1' ? 'Dynamic' : skuName == 'EP1' || skuName == 'EP2' || skuName == 'EP3' ? 'Elastic Premium' : 'Premium'
var storage_account_kind = 'StorageV2'
var function_app_kind = 'functionapp'

resource storage_account 'Microsoft.Storage/storageAccounts@2022-05-01' = {
  name: storage_account_name
  location: region
  sku: {
    name: storageAccountType
  }
  kind: storage_account_kind
  properties: {
    supportsHttpsTrafficOnly: true
    defaultToOAuthAuthentication: true
  }
}

resource app_service_plan 'Microsoft.Web/serverfarms@2021-03-01' = {
  name: app_service_plan_name
  location: region
  sku: {
    name: skuName
    tier: sku_tier
  }
  properties: {}
}

resource function_app 'Microsoft.Web/sites@2021-03-01' = {
  name: functionAppName
  location: region
  kind: function_app_kind
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: app_service_plan.id
    siteConfig: {
      appSettings: [
        {
          name: 'AzureWebJobsStorage'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storage_account_name};EndpointSuffix=${environment().suffixes.storage};AccountKey=${storage_account.listKeys().keys[0].value}'
        }
        {
          name: 'WEBSITE_CONTENTAZUREFILECONNECTIONSTRING'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storage_account_name};EndpointSuffix=${environment().suffixes.storage};AccountKey=${storage_account.listKeys().keys[0].value}'
        }
        {
          name: 'WEBSITE_CONTENTSHARE'
          value: toLower(functionAppName)
        }
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~14'
        }
        {
          name: 'APPINSIGHTS_INSTRUMENTATIONKEY'
          value: application_insights.properties.InstrumentationKey
        }
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: runtime
        }
      ]
      ftpsState: 'FtpsOnly'
      minTlsVersion: '1.2'
      cors: {
        allowedOrigins: allowedOrigins
      }
    }
    httpsOnly: true
  }
}

resource application_insights 'Microsoft.Insights/components@2020-02-02' = {
  name: application_insights_name
  location: region
  kind: 'web'
  properties: {
    Application_Type: 'web'
    Request_Source: 'rest'
  }
}

output out_function_app_name string = function_app.name
output out_function_app_id string = function_app.id
output out_function_app_identity_principal_id string = function_app.identity.principalId
