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
    this.exams = []
    this.emitter = new EventEmitter()
  }

  writeFile(name, data) {
    return new Promise((resolve, reject) => {
      fs.appendFile(path.resolve(__dirname, `${name}.json`), JSON.stringify(data), err => {
        if (err) {
          console.error('Error whilw writing to file')
          reject()
        } else {
          resolve()
        }
      })
    })
  }

  readFile(name) {
    return new Promise((resolve, reject) => {
      fs.readFile(path.resolve(__dirname, `${name}.json`), (err, data) => {
        if (err) {
          console.log('Error in read from json')
          reject()
        } else {
          resolve(JSON.parse(data))
        }
      })
    })
  }

  initUser() {
    return axios.getUserByName(this.nick)
      .then(res => {
        this.user = res
        this.myCampus = this.user.campus[0]
        this.myCursus = this.user.cursus_users
        return this.readFile('exams')
          .then(data => {
            this.exams = data
          }, () => this.exams = [])
      })
  }



  async watchEvents() {
    console.log('start watching exams')
    this.emitter.emit('startWatch')
    setInterval(async () => {
      console.log('Getting exams again...')
      const exams = await axios.getExamsByCursAndCampus(this.myCursus[this.myCursus.length - 1].cursus_id, this.myCampus.id)
      exams.forEach(exam => {
        if (this.exams.findIndex(item => item.id === exam.id) === -1) {
          this.emitter.emit('newExam', exam)
          console.log('new exam', exam.name)
        }
      })
      this.exams = exams
      await this.writeFile('exams', {exams})
    }, 60000)
  }
}

const user = new User('gejeanet')

module.exports = user