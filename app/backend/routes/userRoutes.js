const express = require('express');
// const { getUserById, getUserProgress, getUsers, updateUserById, updateUserProgress } = require('../controllers/userController');
const { getAllQuestionsbyAI } = require('../controllers/aiController');

const { getUserAttemptById, checkUserAttempt, updateUserAttempt,getUserById, getUserProgress, getUsers, updateUserById, updateUserProgress, getUserAttempts, addUserAttempt } = require('../controllers/userController');

const router = express.Router();

//get all users
router.get('/all-users', getUsers);

//get user by id
router.get('/:id', getUserById)

//update user by id
router.put('/:id/update', updateUserById)

//get user progress
router.get('/:id/progress', getUserProgress)

//update user progress
router.put('/:id/progress/update', updateUserProgress)


//get all quetions by user id
router.get('/:userId/all-questions', getAllQuestionsbyAI);

//get user attempts
router.get('/:id/attempts', getUserAttempts)

//check user attempt
router.get('/:userId/attempts/:attemptId/check', checkUserAttempt)

//view user attempt by id
router.get('/:userId/attempts/:attemptId', getUserAttemptById)

//add user attempt
router.post('/:id/attempts/new', addUserAttempt) //open a deck/begin

//update user attempt
router.put('/:userId/attempts/:attemptId/update', updateUserAttempt) //answering

module.exports = router;
