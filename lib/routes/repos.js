import Github from '../github'

async function repos(req, res) {
  const organization_name = req.query.org
  const api = new Github(req.user.github_token)

  const repositories = await api.getRepositories(organization_name)
  const promises = await repositories.map( async (repository) => {
    const files = await api.getRootContentsFromRepository(repository)
    const isThereSkelleton = files
      .find( (element) => {
        return element["name"] === 'skelleton.json'
      })

    if( isThereSkelleton ) {
      return Promise.resolve({
        id: repository.id,
        name: repository.name,
        full_name: repository.full_name,
      })
    } else {
      return false;
    }
  })
  const result = await Promise.all(promises)

  res
    .status(200)
    .json(result.filter(Boolean))
}

export default repos;
