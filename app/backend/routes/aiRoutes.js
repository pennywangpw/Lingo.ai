const express = require('express');
const { addCardQuestions } = require('../controllers/aiController');
const router = express.Router();


router.post('/create-questions', addCardQuestions);







module.exports = router
