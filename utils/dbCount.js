const createLink = require('./createLink')
const User = require('../Schemas/User.js')

async function newSession(data) {
  let partner = await User.findOne({username: data.username})
  partner.session++
  partner.save()
  console.log(`${partner.username} has interacted with the bot ${partner.session} times`)
}

async function newUser(ctx, origin) {
  let data, referer
  console.log("NewUser: ", ctx)
  try {
    let { invite_link : link } = await createLink(ctx, origin)
  } catch( error ) {
    console.log(error.description)
    let link = 'broken_link'
  }
  if ( origin === 'direct' ) {
    data = ctx.update.message.from
    data.message_id = ctx.update.message.message_id
    referer = 0
  }
  if ( origin === 'indirect' ) {
    data = ctx.update.chat_join_request.from
    data.message_id = ctx.update.message.message_id
    referer = ctx.update.chat_join_request.invite_link.name.split('-')[1]
  }
  let username = data.username || 'No_username'
  let name = data.first_name
  let language = data.language_code
  let telegramID = data.id
  let sinceMessageID = data.message_id ? data.message_id : 0
  const user = new User({ username, name, language, telegramID, referer, sinceMessageID, link })
  user.save()
  console.log(`${ username } is a new user with referer link ${ link }.`)
  return link
}

async function dbCount(ctx) {
  let data = ctx.update.message
  let visitor
  try {
    visitor = await User.findOne({ telegramID: data.from.id})
  } catch( error ) {
    console.log(error)
  }
  if ( visitor ) {
    newSession(visitor)
  } else {
    newUser(ctx, 'direct')
  }
}

module.exports = dbCount