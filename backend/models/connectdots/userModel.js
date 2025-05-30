const mongoose = require('mongoose')

const ConnectDotsUserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  userName: {
    type: String,
    required: true
  }
})

ConnectDotsUserSchema.pre('save', async function (next) {
  if (!this.isModified('userName')) {
    return next()
  }
  
  // check if the userName already exists
  const existingUser = await ConnectDotsUser.findOne({ userName: this.userName })
  if (existingUser) {
    return next(new Error('User name already exists'))
  }

  next()
})
const ConnectDotsUser = mongoose.model('ConnectDotsUser', ConnectDotsUserSchema)

module.exports = ConnectDotsUser