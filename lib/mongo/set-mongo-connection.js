import winston from 'winston'
import mongoose from 'mongoose'

const setMongoConnection = function(req, res, next) {
  const user = req.user.user || {}
  const repository = req.user.repository
  if( !repository || !repository.full_name ){
    return res
      .status(401)
      .send("There is no information about repository on payload, please refresh your token")
  }

  let conn = global.connections[repository.full_name]

  if( !conn ){
    conn = mongoose
      .createConnection(`mongodb://localhost/${repository.full_name}`)

    conn.on('connected', () => {
      winston.info(`Mongoose default connection open to ${user.login}`)

    });
    conn.on('disconnected', () => {
      winston.info(`Mongoose ${user.login} connection disconnected`)
    });

    process.on('SIGINT', () => {
      client.close(function () {
        winston.error(`${user.login} connection disconnected through app termination`)
        process.exit(0)
      });
    })

    global.connections[repository.full_name] = conn
  }

  req.db = conn

  next()
}


export default setMongoConnection
