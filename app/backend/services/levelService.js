const { db } = require('../firebase/firebaseConfig');
const { collection, addDoc, getDocs, updateDoc, getDoc, doc, query, where } = require('firebase/firestore');

const getAllUserLevelsFromDB = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'users'));

        const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return users.map(user => {
            return { id: user.id, level: user.level };
        })
    } catch (error) {
        throw new Error('Error fetching user levels: ' + error.message);
    }
}

const getUserLevelFromDB = async (uid) => {
    try {
        const userDocRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userDocRef);
        return { id: uid, username: userDoc.data().username, level: userDoc.data().level };

    } catch (error) {
        throw new Error('Error fetching user level: ' + error.message);
    }
}

module.exports = { getAllUserLevelsFromDB, getUserLevelFromDB };
