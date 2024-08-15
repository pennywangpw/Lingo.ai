const { db } = require('../firebase/firebaseConfig');
const { increment, collection, addDoc, getDocs, updateDoc, getDoc, doc, query, where } = require('firebase/firestore');
const { archiveDeckInDB, getDeckFromDB } = require('./deckService');
const { getDeck } = require('../controllers/deckController');
const { checkTopicProgression } = require('./topicService');

//Service to view all user attempts
const getUserAttemptsFromDB = async (uid) => {
    try {
        const userRef = doc(db, 'users', uid);
        const userAttemptsRef = collection(userRef, 'attempts');
        console.log('userAttemptsRef: ', userAttemptsRef);
        const userAttemptsSnapshot = await getDocs(userAttemptsRef);
        const userAttempts = userAttemptsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return userAttempts;
    } catch (error) {
        throw new Error('Error fetching user attempts: ' + error.message);
    }
}

const getUserAttemptByIDFromDB = async (uid, attemptId) => {
    try {
        const userRef = doc(db, 'users', uid);
        const attemptDocRef = doc(userRef, 'attempts', attemptId);
        const attemptDoc = await getDoc(attemptDocRef);
        if (attemptDoc.exists()) {
            return attemptDoc.data();
        } else {
            throw new Error('Attempt not found');
        }
    } catch (error) {
        throw new Error('Error fetching user attempt: ' + error.message);
    }
}

const checkAttemptInDB = async (userId, attemptId) => {
    console.log('userId: ', userId, 'attemptId: ', attemptId);
    console.log('hit here')
    try {
        const userRef = doc(db, 'users', userId);
        const attemptDocRef = doc(userRef, 'attempts', attemptId);
        //console.log('attemptDocRef: ', attemptDocRef);
        const attemptDoc = await getDoc(attemptDocRef);
        console.log('attemptDoc: ', attemptDoc);
        if (attemptDoc.exists()) {
            const attemptData = attemptDoc.data();
            console.log('Attempt data:', attemptData);

            const { passes, totalQuestions } = attemptData;
            const percentagePassed = (passes / totalQuestions) * 100;

            if (percentagePassed >= 80) {
                console.log('Attempt passes with 80% or more:', percentagePassed);
                return { ...attemptData, percentagePassed, meetsThreshold: true };
            } else {
                console.log('Attempt does not pass with 80% or more:', percentagePassed);
                return { ...attemptData, percentagePassed, meetsThreshold: false };
            }
        } else {
            throw new Error('Attempt not found');
        }
    } catch (error) {
        throw new Error('Error checking user attempt: ' + error.message);
    }
};

//Service to add user attempt; call this service after user starts a deck
const AddUserAttemptToDB = async (attemptData, id) => {
    try {
        //attempt data = grab json data from frontend, its passed thru this and if it matches
        //with correct answer, add +1 to pass count for this attempt
        console.log('attemptData: ', attemptData);
        const userDocRef = doc(db, 'users', id);
        const userAttemptsRef = collection(userDocRef, 'attempts')
        const docRef = await addDoc(userAttemptsRef, attemptData);
        console.log('Document written with ID: ', docRef.id);

        return docRef.id;
    } catch (error) {
        throw new Error('Error adding user attempt: ' + error.message);
    }
}

const checkAnswerInDB = async (userId, id, attemptId, answer, deckId) => {
    console.log('userId: ', userId, 'attemptId: ', attemptId, 'id: ', id, 'answer: ', answer, 'deckId: ', deckId);
    try {
        if (!attemptId) {
            throw new Error('Attempt ID is required.');
        }

        const userDocRef = doc(db, 'users', userId);
        const attemptDocRef = doc(userDocRef, 'attempts', attemptId);
        const attemptDoc = await getDoc(attemptDocRef);
        const deckDocRef = doc(db, 'decks', deckId);
        const deckDoc = await getDoc(deckDocRef);

        // Ensure attemptDoc and deckDoc exist
        if (!attemptDoc.exists()) {
            throw new Error('Attempt not found');
        }
        if (!deckDoc.exists()) {
            throw new Error('Deck not found');
        }

        const deckData = deckDoc.data();

        // Ensure that cards and jsonData exist and are structured as expected
        if (!deckData.cards || !Array.isArray(deckData.cards) || !deckData.cards[0].questionData || !Array.isArray(deckData.cards[0].questionData.jsonData)) {
            throw new Error('Invalid data structure: jsonData is not an array or cards are not structured correctly');
        }

        // Find the specific question in the cards array
        const questionIndex = deckData.cards[0].questionData.jsonData.findIndex(q => q.id === id);
        if (questionIndex === -1) {
            throw new Error('Question not found');
        }

        const correctAnswer = deckData.cards[0].questionData.jsonData[questionIndex].answer;
        const checkIfAttempted = deckData.cards[0].questionData.jsonData[questionIndex].isAttempted;

        if (checkIfAttempted === true) {
            throw new Error('Question already attempted');
        }

        let feedbackMessage;

        if (answer === correctAnswer) {
            // Mark the question as attempted
            deckData.cards[0].questionData.jsonData[questionIndex].isAttempted = true;

            // Update the deck document in Firestore with the modified cards array
            await updateDoc(deckDocRef, {
                cards: deckData.cards,  // Update the entire cards array
            });

            // Increment the passes count in the attempt document
            await updateDoc(attemptDocRef, { passes: increment(1) });
            const updatedAttemptDoc = await getDoc(attemptDocRef);
            const updatedAttemptData = updatedAttemptDoc.data();

            // Determine if the user is passing based on passes count
            const isPassing = updatedAttemptData.passes >= 3;

            // if passes >= 3, call checkTopicProgression service
            console.log('deck data', updatedAttemptData);
            if (isPassing) {
                feedbackMessage = 'You passed this deck!';
                await checkTopicProgression(deckData.userId, deckData.cards[0].questionData.topic_id, isPassing);
                await archiveDeckInDB(deckId, deckData.userId);
            }

            // return { message: 'Answer is correct!' };
            feedbackMessage = 'Answer is correct!';
        } else {
            deckData.cards[0].questionData.jsonData[questionIndex].isAttempted = true;
            await updateDoc(deckDocRef, {
                cards: deckData.cards,  // Update the entire cards array
            });
            // return { message: 'Answer is incorrect.', correctAnswer };
            feedbackMessage = 'Answer is incorrect.';
        }

        return { message: feedbackMessage, correctAnswer };
    } catch (error) {
        throw new Error('Error checking answer: ' + error.message);
    }
};




//Service to update user attempt
const updateUserAttemptInDB = async (uid, attemptId, updateData) => {
    try {
        const attemptDocRef = doc(db, 'users', uid, 'attempts', attemptId);
        await updateDoc(attemptDocRef, updateData);
        console.log('Attempt updated:', attemptId);
    } catch (error) {
        throw new Error('Error updating user attempt: ' + error.message);
    }
};


//Service to end user attempt (session end)
const endUserAttemptInDB = async (uid, attemptId) => {
    try {
        const userDocRef = doc(db, 'users', uid);
        const attemptDocRef = doc(userDocRef, 'attempts', attemptId);
        await updateDoc(attemptDocRef, { status: 'ended', endTime: new Date() });
        console.log('User attempt ended');
    } catch (error) {
        throw new Error('Error ending user attempt: ' + error.message);
    }
}


module.exports = { getUserAttemptByIDFromDB, checkAttemptInDB, checkAnswerInDB, getUserAttemptsFromDB, AddUserAttemptToDB, updateUserAttemptInDB, endUserAttemptInDB };
