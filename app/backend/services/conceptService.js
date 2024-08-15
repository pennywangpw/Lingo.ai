const { db } = require('../firebase/firebaseConfig');
const { deleteDoc, doc, collection, addDoc, getDocs, query, where, getDoc, updateDoc } = require('firebase/firestore');

// Service to get concepts
const getConceptsFromDB = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'concepts'));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        throw new Error('Error fetching concepts: ' + error.message);
    }
};

const checkUserConceptsPassed = async (uid) => {
    //checks to see if all concepts have status passed
    try {
        const querySnapshot = await getDocs(query(collection(db, 'progress'), where('uid', '==', uid)));
        return
    } catch (error) {
        throw new Error('Error fetching concepts: ' + error.message);
    }
}
// Get all topic by concept id
const getTopicsByConceptId = async (conceptId) => {
    try {
        const querySnapshot = await getDocs(query(collection(db, 'topics'), where('concept_id', '==', conceptId)));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        throw new Error('Error fetching topics: ' + error.message);
    }
};

// Get all concepts by difficulty level
const getConceptsByLevel = async (level) => {
    try {
        const querySnapshot = await getDocs(query(collection(db, 'concepts'), where('level', '==', level)));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        throw new Error('Error fetching concepts: ' + error.message);
    }
};

// Service to add a concept
const addConceptToDB = async (conceptData) => {
    try {
        const docRef = await addDoc(collection(db, 'concepts'), conceptData);
        return docRef.id;
    } catch (error) {
        throw new Error('Error adding concept: ' + error.message);
    }
};

// Service to update a concept
const updateConceptInDB = async (conceptId, updatedData) => {
    try {
        const conceptRef = doc(db, 'concepts', conceptId);
        console.log('conceptRef: ', conceptRef);
        await updateDoc(conceptRef, updatedData);
        return true;
    } catch (error) {
        throw new Error('Error updating concept: ' + error.message);
    }
};

// Service to get a concept by id
const getConceptByIdFromDB = async (conceptId) => {
    try {
        const conceptRef = doc(db, 'concepts', conceptId);
        const conceptSnap = await getDoc(conceptRef);
        if (conceptSnap.exists()) {
            return { id: conceptSnap.id, ...conceptSnap.data() };
        } else {
            throw new Error('Concept not found');
        }
    } catch (error) {
        throw new Error('Error fetching concept: ' + error.message);
    }
}

// Service to remove a concept
const removeConceptFromDB = async (conceptId) => {
    try {
        const conceptRef = doc(db, 'concepts', conceptId);
        await deleteDoc(conceptRef);
        return true;
    } catch (error) {
        throw new Error('Error removing concept: ' + error.message);
    }
}

module.exports = {
    getConceptsFromDB,
    addConceptToDB,
    updateConceptInDB,
    getConceptByIdFromDB,
    removeConceptFromDB,
    getTopicsByConceptId,
    getConceptsByLevel,
    getConceptByIdFromDB
}
