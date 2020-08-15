const user = require('./src/user')
const bot = require('./src/telegram')

const main = async () => {
  bot.createBot()
  await user.initUser()
  user.watchEvents()
}

main()