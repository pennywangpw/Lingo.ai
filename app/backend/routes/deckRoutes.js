const express = require('express');
const { getAllDecks, getDeck, createDeck, addCardsToDeck, removeCardFromDeck, removeDeck, archiveDeck, getArchivedDecks, getUserArchivedDecks, getAttemptbyDeck } = require('../controllers/deckController');
const router = express.Router();

router.get('/all', getAllDecks);

router.get('/:deckId', getDeck);

router.get('/archive', getArchivedDecks);

router.get('/user-archive/:uid', getUserArchivedDecks);

router.post('/add-to-archive', archiveDeck);

router.post('/new', createDeck);

router.delete('/remove/:deckId', removeDeck);

router.put('/update/:deckId', archiveDeck);

router.get('/:deckId/attempt', getAttemptbyDeck);


module.exports = router;

module.exports = router
