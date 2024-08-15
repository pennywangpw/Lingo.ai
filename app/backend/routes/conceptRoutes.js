const express = require('express');
const { getConceptById, getConcepts, addConcept, updateConcept, removeConcept, getTopicsByConcept } = require('../controllers/conceptController');
const router = express.Router();

router.get('/all-concepts', getConcepts);

router.get('/:conceptId', getConceptById);

router.post('/add-concept', addConcept);

router.put('/update-concept/:conceptId', updateConcept);

router.delete('/remove-concept/:conceptId', removeConcept);

router.get('/:conceptId/topics', getTopicsByConcept);

module.exports = router
