const express = require('express');
const { createLobbyApi, getLobbyApi, createUserName, getUserName, updateUserName } = require('../../controllers/connectdots/connectDotsController');

const router = express.Router({ mergeParams: true }) // merge parent route params

router.post('/create', createLobbyApi)
router.post('/createUserName', createUserName)
router.get('/getUserName', getUserName)
router.get('/:lobbyId', getLobbyApi)
router.put('/updateUserName', updateUserName)

module.exports = router
