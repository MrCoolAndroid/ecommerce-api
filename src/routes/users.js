const express = require('express');
const router = express.Router();
const { register, login, validateRegister, validateLogin } = require('../controllers/usersController');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

module.exports = router;