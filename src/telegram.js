const user = require('./user')
const path = require('path')
const fs = require('fs')
const TelegramBot = require('node-telegram-bot-api')
const token = '1343514743:AAHCpJnjlCeUTt3Xj-qz3zRQrg1NHdlYJ18'
const bot = new TelegramBot(token, {polling: true})

module.exports = {
  bot,
  chatIds: [],
  createBot() {
    fs.readFile(path.resolve(__dirname, 'chats.json'), (err, data) => {
      if (err) {
        console.error(err)
        console.log('Error in read chats from json')
      } else {
        console.log('reading')
        console.log(JSON.parse(data).chats)
        this.chatIds = JSON.parse(data).chats
      }
    })

    this.bot.onText(/\/giveChatId/, (msg, match) => {
      if (this.chatIds.findIndex(id => id === msg.chat.id) === -1) {
        console.log(`New caht id ${msg.chat.id}`)
        this.chatIds.push(msg.chat.id)
        fs.writeFile(path.resolve(__dirname, 'chats.json'), {
          chats: JSON.stringify(this.chatIds)
        }, err => {
          console.error(err)
          console.log('Error in writing chats to json')
        })
        bot.sendMessage(msg.chat.id, 'Got your chat ID, thx')
      } else {
        bot.sendMessage(msg.chat.id, 'Already got your chat id')
      }
    })

    user.emitter.on('startWatch', () => {
      this.chatIds.forEach(id => {
        bot.sendMessage(id, 'Start watching events')
      })
    })

    user.emitter.on('newEvent', evt => {
      this.chatIds.forEach(id => {
        bot.sendMessage(id, `Новое событие! ${evt.name}`)
      })
    })

    user.emitter.on('gotExam', evt => {
      this.chatIds.forEach(id => {
        bot.sendMessage(id, `ЭКЗАМЕН!!! ${evt.name}`)
      })
    })
  }
}