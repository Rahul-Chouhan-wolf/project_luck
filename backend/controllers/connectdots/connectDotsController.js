const ConnectDotsUser = require('../../models/connectdots/userModel')

const createUserName = async (req, res) => {
  const { userId, userName } = req.body;
  if (!userId || !userName) {
    return res.status(400).json({ message: 'User ID and name are required' });
  }

  const user = await ConnectDotsUser.create({ userId, userName })
  if (!user) {
    return res.status(500).json({ message: 'Failed to create user name' });
  }
  res.status(200).json({ message: 'User name created successfully', userId, userName });
}

const updateUserName = async (req, res) => {
  const { userId, userName } = req.body;
  if (!userId || !userName) {
    return res.status(400).json({ message: 'User ID and name are required' });
  }

  const user = await ConnectDotsUser.findOne({ userId: userId })
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (!user.updateOne({ userName })) {
    return res.status(500).json({ message: 'Failed to update user name' });
  }
  res.status(200).json({ message: 'User name updated successfully', userId, userName });
}

const getUserName = async (req, res) => {
  let userId = req.params.userId || req.query.userId || req.body.userId
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const user = await ConnectDotsUser.findOne({ userId })
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.status(200).json({ userName: user.userName });
}

module.exports = {
  createUserName,
  getUserName,
  updateUserName,
};
