import 'babel-polyfill'

import assert  from 'assert'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import nock from 'nock'
import mongoose from 'mongoose'
import app  from '../lib/app'

describe('API: skelleton', () => {
  process.env.SECRET_JWT = 'passphrase big very huge man'
  let tokenWithoutRepository
  let tokenWithRepository

  afterEach( () => {
  })

  beforeEach( () => {
    tokenWithoutRepository = jwt
      .sign(
      {
        github_token: 'token_github'
      },
      process.env.SECRET_JWT,
      {
        expiresIn: '1d'
      })

    tokenWithRepository = jwt
      .sign(
      {
        github_token: 'token_github',
        repository: {
           full_name: 'test_repo',
        },
      },
      process.env.SECRET_JWT,
      {
        expiresIn: '1d'
      })
  })

  it('should return a 401 when there is not repository information on payload token', async ()=>{
    const res = await request(app())
      .get('/api/skelleton')
      .set('Authorization', `Bearer ${tokenWithoutRepository}`)
      .send()

    assert.equal(res.status, 401)
  })

  it('should return a 200 when there is repository information on payload token', async ()=>{
    const res = await request(app())
      .get('/api/skelleton')
      .set('Authorization', `Bearer ${tokenWithRepository}`)
      .send()

    assert.equal(res.status, 200)
  })
})
