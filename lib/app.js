import express from 'express'
import jwt from 'express-jwt'
import request from 'request-promise'
import winston from 'winston'

export default function(){
  const app = express();
  winston.remove(winston.transports.Console)
  winston.add(winston.transports.Console, {'timestamp':true})

  app.get('/api/repos',
    jwt({secret: process.env.SECRET_JWT}),
    async (req, res) => {
      const organization_name= req.query.org

      const repositories = await request
        .get({
          uri: `https://api.github.com/orgs/${organization_name}/repos?access_token=${req.user.github_token}`,
          json: true,
          headers: {
            'User-Agent': 'RatoX'
          },
        })

      const promises = repositories.map( (repository) => {
        return request
          .get({
            uri: `https://api.github.com/repos/${repository.full_name}/contents?access_token=${req.user.github_token}`,
            json: true,
            headers: {
              'User-Agent': 'RatoX'
            },
          }).then((files) => {
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

      const user_data = await request
        .get({
          uri: `https://api.github.com/user?access_token=${req.user.github_token}`,
          json: true,
          headers: {
            'User-Agent': 'RatoX'
          },
        })

      const orgs_data = await request
        .get({
          uri: `${user_data.organizations_url}?access_token=${req.user.github_token}`,
          json: true,
          headers: {
            'User-Agent': 'RatoX'
          },
        })

      const organizations = orgs_data.map((org) => {
        return {
          id: org.id,
          login: org.login,
          avatar_url: org.avatar_url,
        }
      })

      res.status(200).json({
        id: user_data.id,
        login: user_data.login,
        avatar_url: user_data.avatar_url,
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
