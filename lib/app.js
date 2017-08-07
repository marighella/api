import express from 'express'
import jwt from 'express-jwt'
import winston from 'winston'
import setMongoConnection from './mongo/set-mongo-connection'
import skelleton from './routes/skelleton'
import repos from './routes/repos'
import user from './routes/user'

export default function(){
  const app = express();
  global.connections = {}
  winston.remove(winston.transports.Console)
  winston.add(winston.transports.Console, {'timestamp':true})

  app.get('/api/repos',
    jwt({secret: process.env.SECRET_JWT}),
    repos
  )

  app.get('/api/user',
    jwt({secret: process.env.SECRET_JWT}),
    user
  )

  app.get('/api/skelleton',
    jwt({secret: process.env.SECRET_JWT}),
    setMongoConnection,
    skelleton
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
