import Github from '../github'

async function repos(req, res) {
  const organization_name = req.query.org
  const api = new Github(req.user.github_token)

  const repositories = await api.getRepositories(organization_name)
  const promises = repositories.map( (repository) => {
    return api.getRootContentsFromRepository(repository)
      .then((files) => {
        const isThereSkelleton = files
          .find( (element) => {
            return element["name"] === 'skelleton.json'
          })

        repository.isThereSkelleton = !!isThereSkelleton

        return Promise.resolve(files)
      })
  })

  Promise
    .all(promises)
    .then((result) => {
      const repos = repositories
        .filter( (repository) => {
          return repository.isThereSkelleton
        })
        .map( (repository) => {
          return {
            id: repository.id,
            name: repository.name,
            full_name: repository.full_name,
          }
        })

      res.status(200).json(repos)
    })
    .catch((error) => {
      winston.error(error)
      res.status(500).send('Something is not good to get the repository list')
    })
}

export default repos;
