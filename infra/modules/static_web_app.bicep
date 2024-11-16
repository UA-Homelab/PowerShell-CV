import { getLocationShortcut } from '../functions/getLocationShortcut.bicep'

@description('The url to the repository, that contains the application.')
param repositoryUrl string

@description('The target branch in the repository.')
param repositoryBranch string

@secure()
@description('Token to connect to repository and create necessary files.')
param repositoryToken string?

@description('The path to the app code within the repository.')
param buildPipelineAppLocation string

@description('Optional: Only needed if you deploy with a managed api. Default: ""')
param buildPipelineApiLocation string?

@description('Optional: The output path of the app after building. Default: "./output"')
param buildPipelineOutputLocation string = './output'

param staticWebAppName string

@description('Optional: Custom domain for the static web app. Default: ""')
param customDomainName string = ''

@description('Optional: Resource Location. Default: The resource groups location.')
param region string

@allowed(['Free', 'Standard'])
@description('SKU of the static web app.')
param sku string

var skipGithubActionWorkflowGeneration = false

resource static_web_app 'Microsoft.Web/staticSites@2023-12-01' = {
  name: staticWebAppName
  location: region
  sku: {
    name: sku
    tier: sku
  }
  properties: {
    repositoryUrl: repositoryUrl
    repositoryToken: repositoryToken
    branch: repositoryBranch
    buildProperties: {
      skipGithubActionWorkflowGeneration: skipGithubActionWorkflowGeneration
      appLocation: buildPipelineAppLocation
      apiLocation: buildPipelineApiLocation
      outputLocation: buildPipelineOutputLocation
    }
  }
}

resource static_web_app_custom_domain_name 'Microsoft.Web/staticSites/customDomains@2023-12-01' = if (customDomainName != '') {
  parent: static_web_app
  name: customDomainName
  properties: {}
}

output out_static_web_app_name string = static_web_app.name
output out_static_web_app_id string = static_web_app.id
output out_static_web_app_default_url string = static_web_app.properties.defaultHostname
@description('Returns empty string, if no custom domain name is defined.')
output out_static_web_app_custom_url string = customDomainName
