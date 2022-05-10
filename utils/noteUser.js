const createLink = require('../utils/createLink')
const User = require('../Schemas/User.js')

async function noteUser(ctx, origin) {
  let data, referer
  console.log("NewUser: ", ctx)
  let { invite_link : link } = await createLink(ctx, origin)
  if (origin === 'direct') {
      data = ctx.update.message.from
      data.message_id = ctx.update.message.message_id
      referer = 0
  }
  if (origin === 'indirect') {
      data = ctx.update.chat_join_request.from
      referer = ctx.update.chat_join_request.invite_link.name.split('-')[1]
  }
  let username = data.username || 'No_username'
  let name = data.first_name
  let language = data.language_code
  let telegramID = data.id
  let sinceMessageID = data.message_id ? data.message_id : 0
  const user = new User({ username, name, language, telegramID, referer, sinceMessageID, link })
  user.save()
  console.log(`${username} is a new user with referer link ${link}.`)
  return link
}

module.exports = noteUser