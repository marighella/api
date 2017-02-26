import 'babel-polyfill'

import assert  from 'assert'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import nock from 'nock'
import app  from '../lib/app'

describe('API: authentication', () => {
  process.env.SECRET_JWT = 'passphrase big very huge man'

  it('should return status 401 when the request is not authenticated', async ()=>{
    const res = await request(app())
      .get('/api/user')
      .send()

    assert.equal(res.status, 401)
  })
})
