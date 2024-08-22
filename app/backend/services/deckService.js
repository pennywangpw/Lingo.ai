const { db } = require('../firebase/firebaseConfig');
const { collection, addDoc, getDocs, updateDoc, getDoc, doc, query, where, Timestamp, setDoc } = require('firebase/firestore');

//service to view all decks
const getDecksFromDB = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'decks'));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        throw new Error('Error fetching decks: ' + error.message);
    }
}

//service to get user decks from DB
const getUserDecksFromDB = async (uid) => {
    try {
        const userDocRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
            throw new Error('User not found');
        }
        const userDecksCollectionRef = collection(userDocRef, 'decks');
        const userDecksSnapshot = await getDocs(userDecksCollectionRef);
        const userDecks = userDecksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return userDecks;
    } catch (error) {
        throw new Error('Error fetching user decks: ' + error.message);
    }
}
const getDecksByTopicIdFromDB = async (topicId) => {
    try {
        const querySnapshot = await getDocs(query(collection(db, 'decks'), where('topic_id', '==', topicId)));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        throw new Error('Error fetching decks: ' + error.message);
    }
}

//get attempt by deck id
const getAttemptByDeckIdFromDB = async (deckId) => {
    try {
        // Get the deck document reference
        const deckRef = doc(db, 'decks', deckId);
        const deckDoc = await getDoc(deckRef);

        if (!deckDoc.exists()) {
            throw new Error('Deck not found');
        }

        // Grab the userId from the deck document
        const userId = deckDoc.data().userId;

        // Get the user document reference
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            throw new Error('User not found');
        }

        // Reference to the 'attempts' subcollection within the user document
        const userAttemptsCollectionRef = collection(userDocRef, 'attempts');
        const userAttemptsSnapshot = await getDocs(userAttemptsCollectionRef);

        // Filter attempts by deckId
        const userAttempts = userAttemptsSnapshot.docs.filter(doc => doc.data().deckId === deckId);

        // Return the first attempt found (if any)
        if (userAttempts.length > 0) {
            const firstAttempt = userAttempts[0].data();  // Get the data of the first attempt
            return { id: userAttempts[0].id, ...firstAttempt }; // Or return additional data as needed
        } else {
            throw new Error('No attempts found for this deck.');
        }

    } catch (error) {
        throw new Error('Error fetching attempt by deckId: ' + error.message);
    }
}


//service to view a deck
const getDeckFromDB = async (deckId) => {
    try {
        const docRef = doc(db, 'decks', deckId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            throw new Error('Deck not found');
        }
    } catch (error) {
        throw new Error('Error fetching deck: ' + error.message);
    }
}

const getUserDeckByIdFromDB = async (uid, deckId) => {
    try {
        const userDocRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
            throw new Error('User not found');
        }
        const userDecksCollectionRef = collection(userDocRef, 'decks');
        const userDecksSnapshot = await getDocs(userDecksCollectionRef);
        const userDecks = userDecksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return userDecks.find(deck => deck.id === deckId);
    } catch (error) {
        throw new Error('Error fetching user deck: ' + error.message);
    }
}

//service to create a deck (empty)
const createDeckInDB = async ({ userId, topic_id, createdAt, archived }) => {
    console.log('userId: ', userId, 'topic_id: ', topic_id, 'createdAt: ', createdAt, 'archived: ', archived)
    try {
        const topicRef = doc(db, 'topics', topic_id);
        const topicDoc = await getDoc(topicRef);

        if (!topicDoc.exists()) {
            throw new Error('Topic not found');
        }
        let conceptId = topicDoc.data().concept_id;
        console.log('conceptId: ', conceptId)
        const conceptRef = doc(db, 'concepts', conceptId);
        const conceptDoc = await getDoc(conceptRef);
        if (!conceptDoc.exists()) {
            throw new Error('Concept not found');
        }
        console.log('hit here', conceptDoc.data().level)
        const level = conceptDoc.data().level
        const docRef = await addDoc(collection(db, 'decks'), {
            userId,
            level,
            topic_id,
            attemptId: null,
            createdAt,
            archived
        });
        const deck = { deck_name: docRef.id.slice(0, 4), id: docRef.id, level, userId: userId, topic_id: topic_id, createdAt, archived, attemptId: null };
        console.log('deck check: ', deck)
        const userDecksCollectionRef = collection(doc(db, 'users', userId), 'decks');
        await setDoc(doc(userDecksCollectionRef, docRef.id), deck);
        return deck;
    } catch (error) {
        throw new Error('Error creating deck: ' + error.message);
    }
};

//service to add cards to a deck
const addCardsToDeckInDB = async (deckId, userId, aiGeneratedRequestId) => {
    try {
        const deck = [];
        const userRef = doc(db, 'users', userId);
        const deckRef = doc(db, 'decks', deckId);
        const deckDoc = await getDoc(deckRef);
        if (!deckDoc.exists()) {
            throw new Error('Deck not found');
        }

        // Reference the specific ai_generated_requests document in the subcollection
        const aiGeneratedRequestRef = doc(db, 'users', userId, 'ai_generated_requests', aiGeneratedRequestId);
        const aiGeneratedRequestDoc = await getDoc(aiGeneratedRequestRef);
        if (!aiGeneratedRequestDoc.exists()) {
            throw new Error('AI Generated Request not found');
        }

        const questionData = aiGeneratedRequestDoc.data().questionData;
        console.log("questionData: ", questionData)
        const deckLevel = deckDoc.data().level;
        const deckTopicId = deckDoc.data().topic_id;

        const topicRef = doc(db, 'topics', deckTopicId);
        const topicDoc = await getDoc(topicRef);
        if (!topicDoc.exists()) {
            throw new Error('Topic not found');
        }
        const topicName = topicDoc.data().topic_name;
        console.log("------: ", questionData.topic)
        console.log("------: ", topicName)
        console.log("------: ", questionData.level)
        console.log("------: ", deckLevel)

        // Check if the question data matches the deck's topic and level
        if (questionData.topic === topicName) {
            deck.push(aiGeneratedRequestDoc.data());
        }

        // Update the deck with the new cards
        await setDoc(deckRef, { ...deckDoc.data(), cards: deck }, { merge: true });
        console.log('deckdeckdeck',deck )
        return deck;
    } catch (error) {
        throw new Error('Error adding card to deck: ' + error.message);
    }
};

//service to view archived decks
const getArchivedDecksFromDB = async () => {
    try {
        const querySnapshot = await getDocs(query(collection(db, 'decks'), where('archived', '==', true)));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        throw new Error('Error fetching archived decks: ' + error.message);
    }
}

//service to archive a deck
const archiveDeckInDB = async (deckId, uid) => {
    console.log('archiveDeckInDB: ', deckId, uid)
    try {
        // Get the deck data
        const deckRef = doc(db, 'decks', deckId);
        const deckDoc = await getDoc(deckRef);

        if (!deckDoc.exists()) {
            throw new Error('Deck not found');
        }
        console.log('check if archived: ', deckDoc.data().archived)
        // Check if the deck is already archived
        if (deckDoc.data().archived) {
            return { success: false, message: 'Deck is already archived.' };
        }

        const deckData = deckDoc.data();

        // Check if the user ID matches the deck's userId
        if (deckData.userId !== uid) {
            return { success: false, message: 'Unauthorized: User ID does not match the deck owner.' };
        }

        // Check if all cards in the deck have isAttempted set to true
        for (const card of deckData.cards) {
            console.log('Checking card:', card);
            for (const question of card.questionData.jsonData) {
                console.log('Checking question:', question);
                if (!question.isAttempted) {
                    console.log(`Question with id ${question.id} is not attempted. Archiving will not proceed.`);
                    return { success: false, message: 'Not all cards are attempted. Deck will not be archived.' };
                }
            }
        }

        // Archive the deck if all cards are attempted
        await updateDoc(deckRef, { archived: true });
        const updatedDeckDoc = await getDoc(deckRef);

        if (!updatedDeckDoc.exists()) {
            throw new Error('Deck not found');
        }

        const updatedDeckData = updatedDeckDoc.data();
        // Add the deck to the user's subcollection
        const userDecksCollectionRef = collection(doc(db, 'users', uid), 'archived_decks');
        await setDoc(doc(userDecksCollectionRef, deckId), updatedDeckData);

        return { success: true, message: 'Deck archived' };
    } catch (error) {
        return { success: false, message: 'Error archiving deck: ' + error.message };
    }
};

//service to view user archived decks
const getUserArchivedDecksFromDB = async (uid) => {
    try {
        const userDocRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            throw new Error('User not found');
        }
        const userDecksCollectionRef = collection(userDocRef, 'archived_decks');

        const userDecksSnapshot = await getDocs(userDecksCollectionRef);
        const userDecks = userDecksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return userDecks;
    } catch (error) {
        throw new Error('Error fetching user archived decks: ' + error.message);
    }
}

//check if deck is in progress
const checkDeckIsInProgressFromDB = async (deckId) => {
    try {
        // Get the deck document reference
        const deckRef = doc(db, 'decks', deckId);
        const deckDoc = await getDoc(deckRef);

        if (!deckDoc.exists()) {
            throw new Error('Deck not found');
        }

        const deckData = deckDoc.data();

        // Check if the deck is archived
        if (deckData.archived) {
            throw new Error('Deck is archived');
        }

        // Check if the deck has any cards
        const cards = deckData.cards;
        if (cards.length === 0) {
            throw new Error('Deck has no cards');
        }

        // Check if any card in the deck has been attempted
        let isDeckInProgress = false;
        for (const card of cards) {
            const cardQuestions = card.questionData.jsonData;
            for (const question of cardQuestions) {
                if (question.isAttempted) {
                    isDeckInProgress = true;
                    break;
                }
            }
            if (isDeckInProgress) break;
        }

        // Determine the deck status based on the card attempts
        if (isDeckInProgress) {
            return { message: 'Deck is in progress' };
        } else {
            return { message: 'Deck is brand new' };
        }
    } catch (error) {
        throw new Error('Error fetching deck: ' + error.message);
    }
};


module.exports = {
    getDecksFromDB, getDecksByTopicIdFromDB,
    createDeckInDB, addCardsToDeckInDB,
    archiveDeckInDB, getArchivedDecksFromDB,
    getUserArchivedDecksFromDB, getDeckFromDB,
    getUserDecksFromDB, getAttemptByDeckIdFromDB,
    checkDeckIsInProgressFromDB, getUserDeckByIdFromDB
};
