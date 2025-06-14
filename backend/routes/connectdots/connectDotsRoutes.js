const express = require('express');
const { createUserName, getUserName, updateUserName } = require('../../controllers/connectdots/connectDotsController');

const router = express.Router({ mergeParams: true }) // merge parent route params

// Only keep username-related REST endpoints
router.post('/createUserName', createUserName)
router.get('/getUserName', getUserName)
router.put('/updateUserName', updateUserName)

// All lobby actions (createLobby, getLobbyInfo, joinLobby) are now handled via Socket.IO at /socket.io

module.exports = router
