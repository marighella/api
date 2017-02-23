import 'babel-polyfill'

import assert  from 'assert'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import nock from 'nock'
import app  from '../lib/app'

describe('API', () => {
  process.env.SECRET_JWT = 'passphrase big very huge man'

  afterEach( () => {
    nock.cleanAll()
  })

  describe('User', () => {

    describe('authentication', () => {

      it('should return status 401 when the request is not authenticated', async ()=>{
        const res = await request(app())
          .get('/api/user')
          .send()

        assert.equal(res.status, 401)
      })
    })

    describe('data', () => {

      beforeEach( () => {
        const fake_result = {
          id: -1,
          login: 'Fakito',
          avatar_url: 'url',
          organizations_url: 'https://api.github.com/users/Fakito/orgs',
        }

        const fake_orgs_result = [{
          id: -1,
          login: 'org-fakito',
          avatar_url: 'URL',
          repos_url: 'https://api.github.com/orgs/org-fakito/repos',
        }]

        nock('https://api.github.com')
          .get('/user?access_token=token_github')
          .reply(200, fake_result)

        nock('https://api.github.com')
          .get('/users/Fakito/orgs?access_token=token_github')
          .reply(200, fake_orgs_result)

      })

      it('should return a JSON with user information', async ()=>{
        const fake_user = {
          id: -1,
          login: 'Fakito',
          avatar_url: 'url',
        }
        const token = jwt.sign({ github_token: 'token_github' }, process.env.SECRET_JWT, { expiresIn: '1d' });
        const res = await request(app())
          .get('/api/user')
          .set('Authorization', `Bearer ${token}`)
          .send()

        assert.equal(res.status, 200)
        assert.deepEqual(res.body, {
          id: -1,
          login: 'Fakito',
          avatar_url: 'url',
          organizations: [
            {
              id: -1,
              login: 'org-fakito',
              avatar_url: 'URL',
            },
          ],
        })
      })
    })
  })
})
