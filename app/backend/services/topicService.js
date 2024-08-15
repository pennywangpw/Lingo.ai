const { db } = require('../firebase/firebaseConfig');
const { collection, addDoc, getDocs, updateDoc, getDoc, doc, query, where , deleteDoc } = require('firebase/firestore');

//service to view topics
const getTopicsFromDB = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'topics'));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        throw new Error('Error fetching topics: ' + error.message);
    }
};

const getTopicByIdFromDB = async (topicId) => {
    try {
        const topicRef = doc(db, 'topics', topicId);
        const topicSnap = await getDoc(topicRef);
        if (topicSnap.exists()) {
            return { id: topicSnap.id, ...topicSnap.data() };
        } else {
            throw new Error('Topic not found');
        }
    } catch (error) {
        throw new Error('Error fetching topic: ' + error.message);
    }
}

//service to check topic progression
const checkTopicProgression = async (uid, topicId, isPassing, currentLevel) => {
    try {
        const userProgressRef = doc(db, 'progress', uid);
        const conceptsCollectionRef = collection(userProgressRef, 'concepts');

        // Fetch all concepts for the user
        const conceptsSnapshot = await getDocs(conceptsCollectionRef);

        if (conceptsSnapshot.empty) {
            throw new Error('No concepts found for this user');
        }

        // Iterate through concepts to find the one containing the specified topicId
        let conceptDoc;
        for (const doc of conceptsSnapshot.docs) {
            const conceptData = doc.data();
            if (conceptData.topics.some(topic => topic.id === topicId)) {
                conceptDoc = doc;
                break;
            }
        }

        if (!conceptDoc) {
            throw new Error('Concept for the given topic not found');
        }

        const conceptData = conceptDoc.data();

        // Update the passes count for the specific topic
        const updatedTopics = conceptData.topics.map(topic => {
            if (topic.id === topicId) {
                //topic.passes = isPassing ? 3 : topic.passes + 1;
                topic.passes += 1;
                if (topic.passes >= 3) {
                    topic.status = true;
                }
            }
            return topic;
        });

        // Check if all topics within this concept are passed
        const topicsPassedDecimal = updatedTopics.every(topic => topic.status) ? 1.0 : conceptData.topicsPassed;

        // Update the concept document with the modified topics
        await updateDoc(conceptDoc.ref, {
            topics: updatedTopics,
            topicsPassed: topicsPassedDecimal
        });

        // Log the result for debugging
        console.log('Updated topics for concept:', conceptData.concept_name);

    } catch (error) {
        throw new Error('Error updating topic: ' + error.message);
    }
};



// const checkTopicProgression = async (topicId, passes) => {
//     //use this service to check curr_passes and update status
//     //calling this means
//     try {
//         const topicRef = doc(db, 'topics', topicId);
//         const topicDoc = await getDoc(topicRef);

//         // Check if the document exists before updating
//         // if (!topicDoc.exists()) {
//         //     throw new Error(`Topic document with ID ${topicId} does not exist`);
//         // }

//         // Update the passes field
//         await updateDoc(topicRef, { passes });

//         // Fetch the updated document
//         const updatedTopic = await getDoc(topicRef);
//         const curr_passes = updatedTopic.data().passes;

//         // Check if the passes have reached 3 and update the status
//         if (curr_passes === 3) {
//             await updateDoc(topicRef, { status: true });
//             console.log('Topic status updated to true');
//         }

//         console.log('Topic passes:', curr_passes);

//     } catch (error) {
//         throw new Error('Error updating topic: ' + error.message);
//     }
    // console.log(topicId, 'passes: ', passes)
    // try {
    //     const topicRef = doc(db, 'topics', topicId);
    //     await updateDoc(topicRef, { passes });
    //     const topic = await getDoc(topicRef);
    //     console.log('passes: ', topic.data().passes)
    //     const curr_passes = topic.data().passes
    //     if (curr_passes === 3) {
    //         await updateDoc(topicRef, { status: true });
    //     }

    // } catch (error) {
    //     throw new Error('Error updating topic: ' + error.message);
    // }
//}


const addTopicToDB = async (topicData) => {
    try {
        const docRef = await addDoc(collection(db, 'topics'), topicData);
        return docRef.id;
    } catch (error) {
        throw new Error('Error adding topic: ' + error.message);
    }
}

const updateTopicInDB = async (topicId, updatedData) => {
    try {
        const topicRef = doc(db, 'topics', topicId);
        await updateDoc(topicRef, updatedData);
        return true;
    } catch (error) {
        throw new Error('Error updating topic: ' + error.message);
    }
}

const removeTopicFromDB = async (topicId) => {
    try {
        const topicRef = doc(db, 'topics', topicId);
        await deleteDoc(topicRef);
        return true;
    } catch (error) {
        throw new Error('Error removing topic: ' + error.message);
    }
}

module.exports = { getTopicByIdFromDB, getTopicsFromDB, addTopicToDB, updateTopicInDB, removeTopicFromDB, getTopicByIdFromDB, checkTopicProgression };
