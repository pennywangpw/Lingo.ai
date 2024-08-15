const { createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { auth } = require('../firebase/firebaseConfig');
const { addUserToDB, setUserLevel } = require('../services/userService');
const { initializeUserProgress } = require('../services/userService');

// Register user
const registerUser = async (req, res) => {
        const { email, password, username, first_name, last_name, native_language, level } = req.body;

        // Validate level
        const validLevels = ['Beginner', 'Intermediate', 'Advanced'];
        if (!validLevels.includes(level)) {
        return res.status(400).json({ message: 'Invalid level. Must be one of: Beginner, Intermediate, Advanced.' });
        }

        try {
        // Create user with Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;
        console.log('userCredential: ', userCredential, userId);
        // Save additional user data to Firestore
        await addUserToDB({ uid: userId, email, username, first_name, last_name, native_language, level });

        // Set user level in Firestore
        await setUserLevel(userId, level);

        // Initialize user progress
        await initializeUserProgress(userId);

        res.status(201).json({ message: 'User registered', uid: userId, loginCredential: userCredential });
        } catch (error) {
        res.status(500).json({ message: error.message });
        }
    };

// Login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        res.status(200).json({ message: 'User logged in', uid: userCredential.user.uid });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser };
