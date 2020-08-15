const axios = require('./auth')
const EventEmitter = require('events')

class User {
  constructor(nick) {
    this.nick = nick
    this.myCampus = {}
    this.myCursus = []
    this.events = []
    this.emitter = new EventEmitter()
  }

  initUser() {
    return axios.getUserByName(this.nick)
      .then(res => {
        this.user = res
        this.myCampus = this.user.campus[0]
        this.myCursus = this.user.cursus_users
        this.emitter.emit('userInit')
      })
  }

  watchEvents() {
    console.log('start watching events')
    this.emitter.emit('startWatch')
    setInterval(async () => {
      console.log('Getting events again...')
      const events = await axios.getEventsByCursAndCampus(this.myCursus[this.myCursus.length - 1].cursus_id, this.myCampus.id)
      if (this.events.length) {
        events.forEach(event => {
          if (event.kind === 'exam' || event.kind === 'exams' || event.kind === 'EXAM') {
            this.emitter.emit('gotExam', event)
          }
          if (this.events.findIndex(item => item.id === event.id) === -1) {
            this.emitter.emit('newEvent', event)
          }
        })
      } else {
        this.events = events
        events.forEach(event => {
          if (event.kind === 'exam' || event.kind === 'exams' || event.kind === 'EXAM') {
            this.emitter.emit('gotExam', event)
          }
        })
      }
    }, 60000)
  }
}

const user = new User('gejeanet')

module.exports = user