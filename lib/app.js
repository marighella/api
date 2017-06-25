import express from 'express'
import jwt from 'express-jwt'
import request from 'request-promise'
import winston from 'winston'
import Github from './github'

export default function(){
  const app = express();
  winston.remove(winston.transports.Console)
  winston.add(winston.transports.Console, {'timestamp':true})

  app.get('/api/repos',
    jwt({secret: process.env.SECRET_JWT}),
    async (req, res) => {
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
  )


  app.get('/api/user',
    jwt({secret: process.env.SECRET_JWT}),
    async (req, res) => {
			const api = new Github(req.user.github_token)

      const userData = await api.getUserData()
      const organizations = await api.getOrganizations(userData)

      res.status(200).json({
        id: userData.id,
        login: userData.login,
        avatar_url: userData.avatar_url,
        organizations: organizations,
      })
    }
  )

  app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
      res.status(401).send(err.message)
      return true
    }
    winston.error(err)
    res.status(500).send('Something bad happened')
  })

  return app
}
