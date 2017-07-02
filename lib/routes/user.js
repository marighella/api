import Github from '../github'

async function user(req, res) {
  const api = new Github(req.user.github_token)

  const userData = await api.getUserData()
  const organizations = await api.getOrganizations(userData)

  res
    .status(200)
    .json({
      id: userData.id,
      login: userData.login,
      avatar_url: userData.avatar_url,
      organizations: organizations,
    })
}

export default user;
