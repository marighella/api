import 'babel-polyfill'

import assert  from 'assert'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import nock from 'nock'
import app  from '../lib/app'

describe('API: repository data', () => {
  process.env.SECRET_JWT = 'passphrase big very huge man'

  afterEach( () => {
    nock.cleanAll()
  })

  beforeEach( () => {
    const fake_repo_result = [{
      id: 20022340,
      name: "mst-image-service",
      full_name: "movimento-sem-terra/mst-image-service",
    }, {
      id: 20022341,
      name: "mst-file-service",
      full_name: "movimento-sem-terra/mst-file-service",
    },
    ]

    nock('https://api.github.com', {
      reqheaders: {
        'User-Agent': 'RatoX',
      },
    })
      .get('/orgs/test/repos?access_token=token_github')
      .reply(200, fake_repo_result)

    const fake_contents_file_service = [{
      name: "skelleton.json",
      path: "skelleton.json",
      sha: "6dd71983fc0eabd758ca8ddd9697cc083e646929",
      size: 399,
      url: "https://api.github.com/repos/movimento-sem-terra/site-novo/contents/skelleton.json?ref=master",
    }]

    nock('https://api.github.com', {
      reqheaders: {
        'User-Agent': 'RatoX',
      },
    })
      .get('/repos/movimento-sem-terra/mst-image-service/contents?access_token=token_github')
      .reply(200, [])

    nock('https://api.github.com', {
      reqheaders: {
        'User-Agent': 'RatoX',
      },
    })
      .get('/repos/movimento-sem-terra/mst-file-service/contents?access_token=token_github')
      .reply(200, fake_contents_file_service)
  })

  it('should return only repos with skelleton.json on root', async () => {
    const token = jwt.sign({ github_token: 'token_github' }, process.env.SECRET_JWT, { expiresIn: '1d' });
    const res = await request(app())
      .get('/api/repos?org=test')
      .set('Authorization', `Bearer ${token}`)
      .send()

    assert.equal(res.status, 200)
    assert.deepEqual(res.body, [{
      id: 20022341,
      name: "mst-file-service",
      full_name: "movimento-sem-terra/mst-file-service",
    }])
  })
})
