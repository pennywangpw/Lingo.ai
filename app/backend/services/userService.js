const { db } = require('../firebase/firebaseConfig');
const { collection, addDoc, getDocs, updateDoc, getDoc, doc, query, where, setDoc } = require('firebase/firestore');
const { getConceptsByLevel, getTopicsByConceptId } = require('./conceptService');
const { checkTopicProgression } = require('./topicService');
// Service to add a user
const addUserToDB = async ({ uid, email, username, first_name, last_name, native_language, level, badges = [] }) => {

    await setDoc(doc(db, 'users', uid), {
        email,
        username,
        first_name,
        last_name,
        native_language,
        level,
        badges,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    console.log('database', db)
};

const setUserLevel = async (uid, level) => {
    await setDoc(doc(db, 'users', uid), {
        level,
        updatedAt: new Date().toISOString()
    }, { merge: true });
};

// Service to get users from DB
const getUsersFromDB = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        throw new Error('Error fetching users: ' + error.message);
    }
};

// Service to update a user
const updateUserInDB = async (uid, updatedData) => {
    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, updatedData);
        return true;
    } catch (error) {
        throw new Error('Error updating user: ' + error.message);
    }
};

// Service to get a user by id
const getUserByIdFromDB = async (id) => {
    try {
        const userRef = doc(db, 'users', id);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return { id: userSnap.id, ...userSnap.data() };
        } else {
            throw new Error('User not found');
        }
    } catch (error) {
        throw new Error('Error fetching user: ' + error.message);
    }
};

// Service to get user progress
const getProgressFromDB = async (uid) => {
    console.log('get progress route is hit', uid);
    try {
        const progressDocRef = doc(db, 'progress', uid);
        const userDocRef = doc(db, 'users', uid);

        const userDoc = await getDoc(userDocRef);

        // Access the 'concepts' subcollection
        const conceptsCollectionRef = collection(progressDocRef, 'concepts');
        const conceptsSnapshot = await getDocs(conceptsCollectionRef);
        console.log('Concepts snapshot:', conceptsSnapshot);
        const concepts = conceptsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Concepts:', concepts);
        return { uid, username: userDoc.data().username, level: userDoc.data().level, concepts };
    } catch (error) {
        throw new Error('Error fetching progress: ' + error.message);
    }
};

const initializeUserProgress = async (uid, level = null) => {
    console.log('initialize user progress route is hit', uid);
    try {
        const userDocRef = doc(db, 'progress', uid);
        const userInfoRef = doc(db, 'users', uid);
        const userInfoSnap = await getDoc(userInfoRef);

        if (!userInfoSnap.exists()) {
            throw new Error('User not found');
        }
        // Create the 'concepts' subcollection
        const conceptsCollectionRef = collection(userDocRef, 'concepts');
        console.log('Concepts collection ref:', conceptsCollectionRef);
        const userInfo = userInfoSnap.data();
        console.log('User info:', userInfo);
        const currentLevel = level || userInfo.level;

        // Fetch existing concepts progress
        const existingConceptsSnapshot = await getDocs(conceptsCollectionRef);
        console.log('Existing concepts snapshot:', existingConceptsSnapshot);
        const existingConcepts = existingConceptsSnapshot.docs.reduce((acc, doc) => {
            acc[doc.id] = doc.data();
            return acc;
        }, {});
        console.log('Existing concepts:', existingConcepts);
        let concepts = [];
        if (currentLevel === 'Advanced') {
            const [AdvancedConcepts, IntermediateConcepts, BeginnerConcepts] = await Promise.all([
                getConceptsByLevel('Advanced'),
                getConceptsByLevel('Intermediate'),
                getConceptsByLevel('Beginner')
            ]);
            concepts = [...AdvancedConcepts, ...IntermediateConcepts, ...BeginnerConcepts];
        } else if (currentLevel === 'Intermediate') {
            const [IntermediateConcepts, BeginnerConcepts] = await Promise.all([
                getConceptsByLevel('Intermediate'),
                getConceptsByLevel('Beginner')
            ]);
            concepts = [...IntermediateConcepts, ...BeginnerConcepts];
        } else {
            concepts = await getConceptsByLevel(currentLevel);
        }

        // Initialize concepts and topics based on the current level
        for (const concept of concepts) {
            const topics = await getTopicsByConceptId(concept.id);
            const conceptDocRef = doc(conceptsCollectionRef, concept.id);

            const existingConcept = existingConcepts[concept.id];
            let topicsPassedCount = 0;

            const updatedTopics = topics.map(topic => {
                const existingTopic = existingConcept?.topics.find(t => t.id === topic.id);
                if (existingTopic?.status) {
                    topicsPassedCount++;
                }
                return existingTopic
                    ? existingTopic // Preserve existing topic progress
                    : {
                        id: topic.id || '',
                        topic_name: topic.topic_name || '',
                        conceptId: topic.concept_id || '',
                        topic_description: topic.description || '',
                        status: false,
                        passes: 0
                    };
            });
            const topicsPassedDecimal = topics.length > 0 ? topicsPassedCount / topics.length : 0;

            await setDoc(conceptDocRef, {
                status: existingConcept ? existingConcept.status : false,
                concept_name: concept.concept_name || '',
                level: concept.level || '',
                topics: updatedTopics,
                topicsPassed: topicsPassedDecimal // New field to track passed topics
            }, { merge: true });
        }
    } catch (error) {
        throw new Error('Error initializing user progress: ' + error.message);
    }
}
const updateUserProgressFromDB = async (uid, topic_id) => {
    try {
        const userProgressRef = doc(db, 'progress', uid);
        const userDocRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            throw new Error('User not found');
        }

        const conceptsCollectionRef = collection(userProgressRef, 'concepts');
        const conceptsSnapshot = await getDocs(conceptsCollectionRef);

        let allConceptsPassed = true;
        let currentLevelPassed = true;  // This tracks if all concepts at the current level are passed
        const currentLevel = userDoc.data().level;

        // Iterate through each concept to find the matching topic_id
        for (const conceptDoc of conceptsSnapshot.docs) {
            const conceptData = conceptDoc.data();
            let topicsUpdated = false;
            let topicsPassedCount = 0;

            const updatedTopics = conceptData.topics.map(topic => {
                if (topic.status) {
                    topicsPassedCount++;
                }

                if (topic.id === topic_id && topic.passes >= 3 && !topic.status) {
                    console.log("User has passed this topic.");
                    topic.status = true;
                    topicsUpdated = true;
                    topicsPassedCount++;
                }
                return topic;
            });

            const topicsPassedDecimal = conceptData.topics.length > 0
                ? parseFloat((topicsPassedCount / conceptData.topics.length).toFixed(1))
                : 0.0;

            // Update if any changes detected
            if (topicsUpdated || topicsPassedDecimal !== conceptData.topicsPassed) {
                await updateDoc(conceptDoc.ref, {
                    topics: updatedTopics,
                    topicsPassed: topicsPassedDecimal
                });
                console.log("Updated concept with topicsPassed:", topicsPassedDecimal);
            }

            const conceptPassed = updatedTopics.every(topic => topic.status);
            if (conceptPassed && conceptData.status !== true) {
                await updateDoc(conceptDoc.ref, { status: true });
                console.log("Concept status updated successfully in Firestore");
            }

            // Track if all concepts are passed
            allConceptsPassed = allConceptsPassed && conceptPassed;

            // Specifically check if the current level's concepts are all passed
            if (conceptData.level === currentLevel) {
                currentLevelPassed = currentLevelPassed && conceptPassed;
            }
        }

        // Call checkTopicProgression after updating the topics
        await checkTopicProgression(uid, topic_id, currentLevelPassed, currentLevel);

        const badges = userDoc.data().badges || [];

        // Badge assignment logic based on completed levels
        if (currentLevel === "Beginner" && currentLevelPassed && !badges.includes('Bronze')) {
            badges.push('Bronze');
            await updateDoc(userDocRef, { badges });
            console.log("Bronze badge assigned");
        }

        if (currentLevel === "Intermediate" && currentLevelPassed && !badges.includes('Silver')) {
            badges.push('Silver');
            await updateDoc(userDocRef, { badges });
            console.log("Silver badge assigned");
        }

        if (currentLevel === "Advanced" && currentLevelPassed && !badges.includes('Gold')) {
            badges.push('Gold');
            await updateDoc(userDocRef, { badges });
            console.log("Gold badge assigned");
        }

        // Level up logic only if all concepts of the current level are passed
        const levels = ["Beginner", "Intermediate", "Advanced"];
        const new_level = levels[Math.min(levels.indexOf(currentLevel) + 1, levels.length - 1)];

        if (new_level !== currentLevel && currentLevelPassed) {
            console.log("New level:", new_level);
            await updateDoc(userDocRef, { level: new_level });
            await initializeUserProgress(uid, new_level);
        }

        console.log('User progress updated successfully');
    } catch (error) {
        console.error('Error updating user progress:', error);
    }
};



// Service to update user progress
// const updateUserProgressFromDB = async (uid, topic_id) => {
//     try {
//         const userProgressRef = doc(db, 'progress', uid);
//         const userDocRef = doc(db, 'users', uid);
//         const userDoc = await getDoc(userDocRef);
//         if (!userDoc.exists()) {
//             throw new Error('User not found');
//         }

//         const conceptsCollectionRef = collection(userProgressRef, 'concepts');
//         const conceptsSnapshot = await getDocs(conceptsCollectionRef);

//         // Query to find the concept that contains the given topic_id
//         const conceptQuery = query(conceptsCollectionRef, where('topics', 'array-contains', { id: topic_id }));
//         const conceptSnapshot = await getDocs(conceptQuery);

//         if (conceptSnapshot.empty) {
//             throw new Error('Concept for the given topic not found');
//         }

//         let conceptDoc = conceptSnapshot.docs[0]; // Assuming topic_id is unique, so we take the first (and only) result
//         let conceptData = conceptDoc.data();

//         // Check if the concept is already passed
//         if (conceptData.topicsPassed === 1.0) {
//             throw new Error('This concept is already passed!');
//         }

//         let allConceptsPassed = true;
//         let currentLevelPassed = true;  // This tracks if all concepts at the current level are passed
//         const currentLevel = userDoc.data().level;

//         // Iterate through each concept to find the matching topic_id
//         for (const conceptDoc of conceptsSnapshot.docs) {
//             const conceptData = conceptDoc.data();
//             let topicsUpdated = false;
//             let topicsPassedCount = 0;

//             const updatedTopics = conceptData.topics.map(topic => {
//                 if (topic.status) {
//                     topicsPassedCount++;
//                 }

//                 if (topic.id === topic_id && topic.passes >= 3 && !topic.status) {
//                     console.log("User has passed this topic.");
//                     topic.status = true;
//                     topicsUpdated = true;
//                     topicsPassedCount++;
//                 }
//                 return topic;
//             });

//             const topicsPassedDecimal = conceptData.topics.length > 0
//                 ? parseFloat((topicsPassedCount / conceptData.topics.length).toFixed(1))
//                 : 0.0;

//             // Update if any changes detected
//             if (topicsUpdated || topicsPassedDecimal !== conceptData.topicsPassed) {
//                 await updateDoc(conceptDoc.ref, {
//                     topics: updatedTopics,
//                     topicsPassed: topicsPassedDecimal
//                 });
//                 console.log("Updated concept with topicsPassed:", topicsPassedDecimal);
//             }

//             const conceptPassed = updatedTopics.every(topic => topic.status);
//             if (conceptPassed && conceptData.status !== true) {
//                 await updateDoc(conceptDoc.ref, { status: true });
//                 console.log("Concept status updated successfully in Firestore");
//             }

//             // Track if all concepts are passed
//             allConceptsPassed = allConceptsPassed && conceptPassed;

//             // Specifically check if the current level's concepts are all passed
//             if (conceptData.level === currentLevel) {
//                 currentLevelPassed = currentLevelPassed && conceptPassed;
//             }
//         }

//         const badges = userDoc.data().badges || [];

//         // Badge assignment logic based on completed levels
//         if (currentLevel === "Beginner" && currentLevelPassed && !badges.includes('Bronze')) {
//             badges.push('Bronze');
//             await updateDoc(userDocRef, { badges });
//             console.log("Bronze badge assigned");
//         }

//         if (currentLevel === "Intermediate" && currentLevelPassed && !badges.includes('Silver')) {
//             badges.push('Silver');
//             await updateDoc(userDocRef, { badges });
//             console.log("Silver badge assigned");
//         }

//         if (currentLevel === "Advanced" && currentLevelPassed && !badges.includes('Gold')) {
//             badges.push('Gold');
//             await updateDoc(userDocRef, { badges });
//             console.log("Gold badge assigned");
//         }

//         // Level up logic only if all concepts of the current level are passed
//         const levels = ["Beginner", "Intermediate", "Advanced"];
//         const new_level = levels[Math.min(levels.indexOf(currentLevel) + 1, levels.length - 1)];

//         if (new_level !== currentLevel && currentLevelPassed) {
//             console.log("New level:", new_level);
//             await updateDoc(userDocRef, { level: new_level });
//             await initializeUserProgress(uid, new_level);
//         }

//         console.log('User progress updated successfully');
//     } catch (error) {
//         console.error('Error updating user progress:', error);
//     }
// };



module.exports = {
    addUserToDB,
    getUsersFromDB,
    updateUserInDB,
    getUserByIdFromDB,
    getProgressFromDB,
    updateUserProgressFromDB,
    setUserLevel,
    initializeUserProgress
};
