const express = require('express');
const {getTopicById, getTopics, addTopic, updateTopic, removeTopic } = require('../controllers/topicController');
const router = express.Router();

router.get('/all-topics', getTopics);

router.get('/:topicId', getTopicById);

router.post('/new', addTopic);

router.put('/update/:topicId', updateTopic);

router.delete('/remove/:topicId', removeTopic);

module.exports = router
