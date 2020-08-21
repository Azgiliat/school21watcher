const Axios = require('axios')
const UID = '90c5ec7843397d895fd57bf1270162ceb18effe28929f33282843dcbbd29f20f'
const SECRET = '92fdc2ed5f2c85ca29343c7f9c1dc706aec65674d852756a420065229d6e2781'
const axiosForSchool = Axios.create({
  baseURL: 'https://api.intra.42.fr'
})

module.exports = {
  axios: axiosForSchool,
  token: null,
  async request({method = 'get', url = '', data = {}}) {
    if (!this.token) {
      console.log('No token')
      await this.getToken()
    }
    if (this.token.created_at * 1000 + this.token.expires_in * 1000 <= Date.now()) {
      console.log('getting new token, old expires')
      await this.getToken()
    }
    return this.axios({
      method,
      url,
      data
    })
  },
  getToken() {
    console.log('Getting auth token...')
    return this.axios({
      method: 'post',
      url: '/oauth/token',
      data: {
        grant_type: 'client_credentials',
        client_id: UID,
        client_secret: SECRET
      }
    })
      .then(res => {
        console.log(res.data)
        this.token = res.data
        this.axios.defaults.headers.common.Authorization = `Bearer ${res.data.access_token}`
        console.log('Ok, token here')
      })
      .catch(err => {
        console.error(err)
        console.log('error in getting token')
      })
  },
  getMe() {
    console.log('Getting info about me')
    return this.request({
      method: 'get',
      url: '/v2/me'
    })
      .then(res => {
        console.log('Got info about me')
        return res.data
      })
      .catch(err => {
        console.error(err)
        console.log('Error while trying get info about me')
      })
  },
  getUsers() {
    console.log('Trying get users...')
    return this.request({
      method: 'get',
      url: '/v2/users'
    })
      .then(res => {
        console.log('Got users!')
        console.log(res.data)
      })
      .catch(err => {
        console.error(err)
        console.log('Error while get users')
      })
  },
  getUserByName(name) {
    console.log('Trying get user by name...')
    return this.request({
      method: 'get',
      url: `/v2/users/${name}`
    })
      .then(res => {
        console.log('Got user!')
        return res.data
      })
      .catch(err => {
        console.error(err)
        console.log('Error while get user by name')
      })
  },
  getEventsByCursAndCampus(cursId, campusId) {
    console.log('Getting events by curs and campus...')
    return this.request({
      url: `/v2/campus/${campusId}/cursus/${cursId}/events`
    })
      .then(res => {
        console.log('Got events by campus and cursus!')
        return res.data
      })
      .catch(err => {
        console.error(err)
        console.log('Error in getting events by curssus and campus')
      })
  },
  getExamsByCursAndCampus(cursId, campusId) {
    console.log('Getting exams by curs and campus...')
    return this.request({
      url: `/v2/campus/${campusId}/cursus/${cursId}/exams`
    })
      .then(res => {
        console.log('Got exams by campus and cursus!')
        return res.data
      })
      .catch(err => {
        console.error(err)
        console.log('Error in getting exams by curssus and campus')
      })
  }
}