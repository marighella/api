import request from 'request-promise'

export default function(githubToken) {
  const GITHUB_API_URL = 'https://api.github.com'
  const defaultHeaders = {
		json: true,
		headers: {
			'User-Agent': 'RatoX'
		},
  }

  const mergeHeaders = (options) => {
    return Object.assign({}, options, defaultHeaders)
  }

  this.getRepositories = function(organizationName){
    return request
      .get(mergeHeaders({
        uri: `${GITHUB_API_URL}/orgs/${organizationName}/repos?access_token=${githubToken}`,
      }))
  }

  this.getRootContentsFromRepository = function(repository){
    return request
      .get(mergeHeaders({
        uri: `${GITHUB_API_URL}/repos/${repository.full_name}/contents?access_token=${githubToken}`,
      }))
  }

  this.getUserData = function(){
    return request
      .get(mergeHeaders({
        uri: `${GITHUB_API_URL}/user?access_token=${githubToken}`,
      }))
  }

  this.getOrganizations = function(userData){
    return request
      .get(mergeHeaders({
        uri: `${userData.organizations_url}?access_token=${githubToken}`,
      }))
      .then((organizations) => {
        return organizations.map((organization) => {
          return {
            id: organization.id,
            login: organization.login,
            avatar_url: organization.avatar_url,
          }
        })
      })
  }
}
