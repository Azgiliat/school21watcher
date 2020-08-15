const axios = require('./auth')
const EventEmitter = require('events')
const fs = require('fs')
const path = require('path')

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
        return new Promise((resolve, reject) => {
          fs.readFile(path.resolve(__dirname, 'events.json'), (err, data) => {
            if (err) {
              console.error(err)
              console.log('Error in read events from json')
              reject()
            } else {
              if (JSON.parse(data).events.length) {
                this.events = JSON.parse(data).events
              }
              resolve()
            }
          })
        })
      })
  }

  watchEvents() {
    console.log('start watching events')
    this.emitter.emit('startWatch')
    setInterval(async () => {
      console.log('Getting events again...')
      const events = await axios.getEventsByCursAndCampus(this.myCursus[this.myCursus.length - 1].cursus_id, this.myCampus.id)
      events.forEach(event => {
        if (event.kind === 'exam' || event.kind === 'exams' || event.kind === 'EXAM') {
          this.emitter.emit('gotExam', event)
        }
        if (this.events.findIndex(item => item.id === event.id) === -1) {
          this.emitter.emit('newEvent', event)
          console.log('new event', event.name)
        }
      })
      this.events = events
      await new Promise((resolve, reject) => {
        fs.writeFile(path.resolve(__dirname, 'events.json'), JSON.stringify({
          events: events
        }), err => {
          if (err) {
            console.error(err)
            console.log('Error in writing events to json')
            reject()
          } else {
            resolve()
          }
        })
      })
    }, 60000)
  }
}

const user = new User('gejeanet')

module.exports = user