const { db } = require('../firebase/firebaseConfig');
const { collection, addDoc, getDocs, updateDoc, getDoc, doc, query, where, deleteDoc, setDoc } = require('firebase/firestore');

//get all questions generated by ai by user_id
const getQuestionsByUserIdFromDB = async (uid) => {
    console.log("checking if i am hitting getQuestionsByUserIdFromDB: ")
    try {
        // Reference to the ai_generated_requests subcollection
        const userRef = doc(db, 'users', uid);

        const aiGeneratedRequestsRef = collection(userRef, 'ai_generated_requests');

        // Get the documents
        const aiGeneratedRequestsSnapshot = await getDocs(aiGeneratedRequestsRef);

        // Extract the data from the documents
        const aiGeneratedRequestsData = aiGeneratedRequestsSnapshot.docs.map(doc => doc.data());

        const userAllQuestions = [];
        aiGeneratedRequestsData.forEach(doc => {
            userAllQuestions.push(doc.question);
        });

        console.log("userAllQuestions: ", userAllQuestions)
        return userAllQuestions;

    } catch (error) {
        throw new Error('Error adding question: ' + error.message);
    }

}



const addQuestionsToDB = async (userId, { questionData }) => {
    try {
        const userRef = doc(db, 'users', userId);
        const aiGeneratedRequestsRef = collection(userRef, 'ai_generated_requests');
        // const deckRef = doc(db, 'decks', userId);
        // const aiGeneratedRequestsRef = collection(deckRef, "ai_generated_requests");
        const newDocRef = doc(aiGeneratedRequestsRef); // Create a new document reference

        // Add the question data to the new document in the collection
        newQuestions = {
            questionData,
            createdAt: new Date()
        }
        await setDoc(newDocRef, newQuestions);

        return newDocRef.id
        // return newQuestions;
    } catch (error) {
        throw new Error('Error adding questions to DB: ' + error.message);
    }
}


//original
//ai generate question
// const addQuestionsToDB = async (userId, { questionData }) => {
//     try {
//         const userRef = doc(db, 'users', userId);
//         const aiGeneratedRequestsRef = collection(userRef, 'ai_generated_requests');
//         // const deckRef = doc(db, 'decks', userId);
//         // const aiGeneratedRequestsRef = collection(deckRef, "ai_generated_requests");
//         const newDocRef = doc(aiGeneratedRequestsRef); // Create a new document reference

//         // Add the question data to the new document in the collection
//         await setDoc(newDocRef, {
//             questionData,
//             createdAt: new Date()
//         });

//         return newDocRef.id; // Return the ID of the newly created document
//     } catch (error) {
//         throw new Error('Error adding questions to DB: ' + error.message);
//     }
// }





module.exports = { addQuestionsToDB, getQuestionsByUserIdFromDB };
