const { getDecksFromDB, createDeckInDB,
    addCardsToDeckInDB, removeCardFromDeckInDB,
    removeDeckFromDB, archiveDeckInDB,
    getArchivedDecksFromDB, getUserArchivedDecksFromDB
    , getDeckFromDB,
    getAttemptByDeckIdFromDB
} = require('../services/deckService');
const { doc, getDoc, addDoc, setDoc, collection } = require('firebase/firestore');
const { db } = require('../firebase/firebaseConfig');

const getAllDecks = async (req, res) => {
    try {
        const decks = await getDecksFromDB();
        res.status(200).json({ decks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


const getDeck = async (req, res) => {
    const { deckId } = req.params;
    try {
        const deck = await getDeckFromDB(deckId);
        res.status(200).json({ deck });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// const createDeck = async (req, res) => {
//     const { userId, topic_id, createdAt = new Date().toISOString(), archived = false } = req.body;
//     try {
//         const deckInfo = await createDeckInDB({ userId, topic_id, createdAt, archived });
//         const deckId = deckInfo.id;
//         const deckQuestions = await addCardsToDeckInDB(deckId, userId);

//         res.status(201).json({ message: 'Deck created', deckInfo, deckQuestions });
//     } catch (error) {
//         res.status(500).json({ message: `Error creating deck: ${error.message}` });
//     }
// };

const createDeck = async (req, res) => {
    const { userId, aiGeneratedRequestId, createdAt = new Date().toISOString(), archived = false } = req.body;
    try {
        console.log('Starting createDeck function');
        // Retrieve the topic_id based on aiGeneratedRequestId
        console.log('Fetching AI Generated Request document...');
        const aiGeneratedRequestRef = doc(db, 'users', userId, 'ai_generated_requests', aiGeneratedRequestId);
        const aiGeneratedRequestDoc = await getDoc(aiGeneratedRequestRef);

        if (!aiGeneratedRequestDoc.exists()) {
            console.log('AI Generated Request not found');
            return res.status(404).json({ message: 'AI Generated Request not found' });
        }

        console.log('AI Generated Request document fetched successfully');
        const topic_id = aiGeneratedRequestDoc.data().questionData.topic_id;

        // Create the deck in the database
        console.log('Creating deck in database...');
        const deckInfo = await createDeckInDB({ userId, topic_id, createdAt, archived });
        const deckId = deckInfo.id;

        console.log('Deck created with ID:', deckId);
        // Add cards to the deck using the aiGeneratedRequestId
        console.log('Adding cards to the deck...');
        const deckQuestions = await addCardsToDeckInDB(deckId, userId, aiGeneratedRequestId);

        console.log('Cards added to the deck successfully');
        res.status(201).json({ message: 'Deck created', deckInfo, deckQuestions });
    } catch (error) {
        console.error('Error occurred during deck creation:', error);
        res.status(500).json({ message: `Error creating deck: ${error.message}` });
    }
};



const removeCardFromDeck = async (req, res) => {
    const { deckId } = req.params;
    try {
        await removeCardFromDeckInDB(deckId);
        res.status(200).json({ message: 'Card removed from deck' });
    } catch (error) {
        res.status(500).json({ message: `Error removing card from deck: ${error.message}` });
    }
}


const removeDeck = async (req, res) => {
    const { deckId } = req.params;
    try {
        await removeDeckFromDB(deckId);
        res.status(200).json({ message: 'Deck removed' });
    } catch (error) {
        res.status(500).json({ message: `Error removing deck: ${error.message}` });
    }
}


const archiveDeck = async (req, res) => {
    const { deckId, uid } = req.body;

    if (!deckId || !uid) {
        return res.status(400).json({ message: 'Missing deckId or uid' });
    }

    try {
        const result = await archiveDeckInDB(deckId, uid);

        if (result.success) {
            return res.status(200).json({ message: result.message });
        } else {
            return res.status(400).json({ message: result.message });
        }
    } catch (error) {
        res.status(500).json({ message: `Error archiving deck: ${error.message}` });
    }
};



const getArchivedDecks = async (req, res) => {
    try {
        const decks = await getArchivedDecksFromDB();
        res.status(200).json({ decks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getUserArchivedDecks = async (req, res) => {
    const { uid } = req.params;
    try {
        const decks = await getUserArchivedDecksFromDB(uid);
        res.status(200).json({ decks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getAttemptbyDeck = async (req, res) => {
    const { deckId } = req.params;
    try {
        const attempt = await getAttemptByDeckIdFromDB(deckId);
        res.status(200).json({ attempt });
    } catch (error) {
        res.status(500).json({ message: error.message });
  
  }
}

module.exports = { getAllDecks, getDeck, createDeck, removeCardFromDeck, removeDeck, archiveDeck, getArchivedDecks, getUserArchivedDecks, getAttemptbyDeck };
