import { checkDeckIsInProgressFromDB } from "../services/deckService";

const { db } = require("../firebase/firebaseConfig");
const { collection, getDocs, doc, updateDoc, setDoc, getDoc, FieldValue } = require("firebase/firestore");

// Action Types
export const LOAD_DECKS = "concepts/LOAD_DECKS";
export const LOAD_ONE_DECK = "concepts/LOAD_ONE_DECK";

// Action Creators
const loadDecks = (decks) => ({
  type: LOAD_DECKS,
  decks,
});

const loadOneDeck = (deck) => ({
  type: LOAD_ONE_DECK,
  deck,
});


// Thunk Actions
export const fetchDecks = (userId, topicId) => async (dispatch) => {
  try {

    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
        throw new Error('User not found');
    }
    const userDecksCollectionRef = collection(userDocRef, 'decks');
    const userDecksSnapshot = await getDocs(userDecksCollectionRef);
    const userDecks = userDecksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    dispatch(loadDecks(userDecks));
  } catch (error) {
    console.error("Error fetching decks:", error);
  }
};





export const fetchOneDeck = (deckId) => async (dispatch) => {
  try {
    const deckDocRef = doc(db, "decks", deckId);
    const deckSnapshot = await getDoc(deckDocRef);

    if (deckSnapshot.exists()) {
      const deckData = { id: deckSnapshot.id, ...deckSnapshot.data() };
      dispatch(loadOneDeck(deckData));
    } else {
      console.log("No such deck found!");
    }
  } catch (error) {
    console.error("Error fetching deck:", error);
  }
};

export const updateDeckStatus = async (deckId, attemptId) => {
  try {
    const deckRef = doc(db, 'decks', deckId);
    await updateDoc(deckRef, {
      status: "in_progress",
      currentAttemptId: attemptId
    });
    console.log('Deck status updated to in_progress');
  } catch (error) {
    throw new Error('Error updating deck status: ' + error.message);
  }
};


export const createAttemptIfNotExists = (deckId, attemptId) => async (dispatch, getState) => {
  if (!attemptId) {
    console.error("Invalid attemptId:", attemptId);
    throw new Error("Attempt ID is undefined or invalid.");
  }

  const docRef = doc(db, "decks", deckId);

  try {
    await setDoc(docRef, { attemptId }, { merge: true });
    console.log("Attempt ID set successfully in deck:", deckId);
  } catch (error) {
    console.error("Error setting attempt ID:", error);
    throw error;
  }
};

export const updateAttemptId = (deckId, attemptId) => async (dispatch) => {
  try {
    const deckDocRef = doc(db, "decks", deckId);
    await updateDoc(deckDocRef, { attemptId });
    dispatch(fetchOneDeck(deckId)); // Optionally refresh the deck data
  } catch (error) {
    console.error("Error updating attempt ID:", error);
  }
};

const initialState = {
  decks: [],
};

const decksReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_DECKS:
      return {
        ...state,
        decks: action.decks,
      };
    case LOAD_ONE_DECK:
      return {
        ...state,
        selectedDeck: action.deck,
      };
    default:
      return state;
  }
};

export default decksReducer;
