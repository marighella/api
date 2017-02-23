import express from 'express'
import jwt from 'express-jwt'
import request from 'request-promise'

export default function(){
  const app = express();

  app.get('/api/user',
    jwt({secret: process.env.SECRET_JWT}),
    async (req, res) => {

      const user_data = await request
        .get({
          uri: `https://api.github.com/user?access_token=${req.user.github_token}`,
          json: true,
        })

      const orgs_data = await request
         .get({
           uri: `${user_data.organizations_url}?access_token=${req.user.github_token}`,
           json: true,
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

  return app
}