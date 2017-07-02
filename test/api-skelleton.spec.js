import 'babel-polyfill'

import assert  from 'assert'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import nock from 'nock'
import app  from '../lib/app'

describe('API: skelleton', () => {
  process.env.SECRET_JWT = 'passphrase big very huge man'
  let token

  afterEach( () => {
  })

  beforeEach( () => {
    token = jwt
      .sign(
      {
        github_token: 'token_github'
      },
      process.env.SECRET_JWT,
      {
        expiresIn: '1d'
      })
  })

  it('should return a JSON with user information', async ()=>{
    const res = await request(app())
      .get('/api/skelleton')
      .set('Authorization', `Bearer ${token}`)
      .send()

    assert.equal(res.status, 200)
  })
})
