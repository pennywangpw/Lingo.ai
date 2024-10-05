import { checkDeckIsInProgressFromDB } from "../services/deckService";

const { db } = require("../firebase/firebaseConfig");
const { collection, getDocs, doc, updateDoc, setDoc, getDoc, FieldValue } = require("firebase/firestore");

// Action Types
export const LOAD_DECKS = "concepts/LOAD_DECKS";
export const LOAD_ONE_DECK = "concepts/LOAD_ONE_DECK";
export const CREATE_NEW_DECK = "concepts/CREATE_NEW_DECK";
export const UPDATE_DECK = "concepts/UPDATE_DECK";



// Action Creators

const createNewDeck = (deck) => ({
  type: CREATE_NEW_DECK,
  deck,
});

const loadDecks = (decks) => ({
  type: LOAD_DECKS,
  decks,
});

const loadOneDeck = (deck) => ({
  type: LOAD_ONE_DECK,
  deck,
});

const updateDeck = (deck) => ({
  type: UPDATE_DECK,
  deck

});

// //original fetchDecks
// export const fetchDecks = (userId, topicId) => async (dispatch) => {
//   try {
//     const userDocRef = doc(db, 'users', userId);
//     const userDoc = await getDoc(userDocRef);
//     if (!userDoc.exists()) {
//       throw new Error('User not found');
//     }
//     const userDecksCollectionRef = collection(userDocRef, 'decks');
//     const userDecksSnapshot = await getDocs(userDecksCollectionRef);
//     const userDecks = userDecksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

//     dispatch(loadDecks(userDecks));
//   } catch (error) {
//     console.error("Error fetching decks:", error);
//   }
// };


export const createDeck = (userId, aiGeneratedRequestId) => async (dispatch) => {
  console.log("----createDeck userId, aiGeneratedRequestId: ", userId, aiGeneratedRequestId)
  let payload = {
    userId,
    aiGeneratedRequestId
  }
  try {
    const response = await fetch(`/api/decks/new`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    if (response.ok) {
      const newdeck = await response.json()

      dispatch(createNewDeck(newdeck.decks));

      // const alldecks = await response.json()

      // dispatch(loadDecks(alldecks.decks));
      return newdeck
    }
  } catch (error) {
    console.error("Error fetching decks:", error);
  }
};

// Thunk Actions
export const fetchDecks = () => async (dispatch) => {
  try {
    const response = await fetch(`/api/decks/all`)
    if (response.ok) {
      const alldecks = await response.json()

      dispatch(loadDecks(alldecks.decks));
    }
  } catch (error) {
    console.error("Error fetching decks:", error);
  }
};




export const fetchOneDeck = (deckId) => async (dispatch) => {
  try {
    const response = await fetch(`/api/decks/${deckId}`)
    if (response.ok) {
      const deck = await response.json()

      dispatch(loadOneDeck(deck));
    } else {
      console.log("no....")
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

export const updateCardIsAttemtAttemptPasses = (userId, attemptId, deckId) => async (dispatch) => {
  let payload = { userId, attemptId }
  try {
    const response = await fetch(`/api/decks/updatecards/${deckId}`, {
      method: 'PUT',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }
    )
    if (response.ok) {
      //do something...
      const updateddeck = await response.json()
      console.log("看一下update :", updateddeck)
      dispatch(updateDeck(updateddeck)); // Optionally refresh the deck data


    }
  } catch (error) {
    console.log("Reset error- updateCardIsAttemtAttemptPasses ", error)
  }
}

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
    case CREATE_NEW_DECK:
      return {
        ...state,
        newDeck: action.deck,
      };
    default:
      return state;
  }
};

export default decksReducer;
