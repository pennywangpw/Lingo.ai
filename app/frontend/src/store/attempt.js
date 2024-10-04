import {
  AddUserAttemptToDB,
  checkAnswerInDB,
} from "../services/attemptService";
import { getAttemptByDeckIdFromDB } from "../services/deckService";

// Action Types

const { db } = require("../firebase/firebaseConfig");
const { collection, getDocs, getDoc, doc, addDoc, updateDoc } = require("firebase/firestore");

export const LOAD_USER_ATTEMPT = "userAttempts/LOAD_USER_ATTEMPT";
export const ADD_USER_ATTEMPT = "userAttempts/ADD_USER_ATTEMPT";
export const UPDATE_USER_ATTEMPT = "userAttempts/UPDATE_USER_ATTEMPT";
export const LOAD_FIRST_USER_ATTEMPT = "userAttempts/LOAD_FIRST_USER_ATTEMPT";

// Action Creators
const loadUserAttempt = (allAttempts) => ({
  type: LOAD_USER_ATTEMPT,
  allAttempts,
});

// Add User Attempt
const addUserAttempt = (newAttempt) => ({
  type: ADD_USER_ATTEMPT,
  newAttempt,
});

const updateUserAttempt = (id, checkAttempt) => ({
  type: UPDATE_USER_ATTEMPT,
  id,
  checkAttempt,
});

const loadFirstUserAttempt = (newAttemptId) => ({
  type: LOAD_FIRST_USER_ATTEMPT,
  newAttemptId
})

// Thunk Actions
export const fetchUserAttempt = (userId) => async (dispatch) => {
  try {
    const response = await fetch(`/api/users/${userId}/attempts`)
    const allAttempts = await response.json()
    console.log("Fetched all attempts:", allAttempts); // Log fetched data
    dispatch(loadUserAttempt(allAttempts || {})); // Handle empty attempts
  } catch (error) {
    console.error("Error fetching user attempt:", error);
  }
};
// //original user attempt
// export const fetchUserAttempt = (deckId) => async (dispatch) => {
//   try {
//     const attempt = await getAttemptByDeckIdFromDB(deckId);
//     console.log("Fetched attempt:", attempt); // Log fetched data
//     dispatch(loadUserAttempt(attempt || {})); // Handle empty attempts
//   } catch (error) {
//     console.error("Error fetching user attempt:", error);
//   }
// };

// Add User Attempt Thunk
// export const startUserAttempt = (userId, deckId, passes = 0, totalQuestions = 3, createdAt = new Date().toISOString()) => async (dispatch) => {
//   try {
//       const attemptData = { deckId, passes, totalQuestions, createdAt };
//       const newAttemptId = await AddUserAttemptToDB(attemptData, userId); // API call

//       dispatch(addUserAttempt(newAttemptId));

//       // Return the new attempt ID
//       return { payload: newAttemptId };
//   } catch (error) {
//       console.error("Error creating user attempt:", error);
//       throw error; // Throw the error to handle it where the thunk is called
//   }
// };

//initial user attempt

export const InitialUserAttempt = (userId, deckId, passes, totalQuestions, createdAt) => async (dispatch) => {
  console.log("傳進來的deckId應該是新generated question deckId: ", deckId)
  let payload = {
    deckId,
    passes,
    totalQuestions,
    createdAt
  }
  try {
    const response = await fetch(`/api/users/${userId}/attempts/new`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    if (response.ok) {
      const newAttemptId = await response.json()
      console.log("newAttemptId in store: ", newAttemptId)

      dispatch(loadFirstUserAttempt(newAttemptId));
      return newAttemptId
    }
  } catch (error) {
    console.error("Error creating user attempt:", error);
    throw error; // Throw the error to handle it where the thunk is called
  }
}



//應該是變更isattempted
export const createUserAttempt = (userId, attemptId) => async (dispatch) => {
  try {
    const response = await fetch(`/api/users/${userId}/attempts/${attemptId}/update`)
    // if (response.ok) {
    //   const alldecks = await response.json()

    //   dispatch(loadDecks(alldecks.decks));
    // }
  } catch (error) {
    console.error("Error creating user attempt:", error);
    throw error; // Throw the error to handle it where the thunk is called
  }
}

//original createUserAttempt
// export const createUserAttempt = (userId, deckId) => async (dispatch) => {
//   try {
//       const userDocRef = doc(db, 'users', userId);
//       const userAttemptsRef = collection(userDocRef, 'attempts')

//       // Create the attempt data (you'll need to define this structure)
//       const attemptData = {
//         deckId,
//       };

//        // Add the attempt document to the attempts collection
//     const docRef = await addDoc(userAttemptsRef, attemptData);

//     // Get the new attempt ID (document ID)
//     const newAttemptId = docRef.id;

//     // Update the deck's attemptId field
//     const deckDocRef = doc(userDocRef, 'decks', deckId);
//     await updateDoc(deckDocRef, { attemptId: newAttemptId });

//     // Dispatch the action to add the attempt to your Redux store
//     dispatch(addUserAttempt(newAttemptId));
//     return { payload: newAttemptId };
//   } catch (error) {
//     console.error("Error creating user attempt:", error);
//     throw error; // Throw the error to handle it where the thunk is called
//   }
// }




export const modifyUserAttempt = (userId, questionId, attemptId, answer, deckId, needResetPasses) => async (dispatch) => {
  // let payload = {userId, questionId, attemptId, answer, deckId}
  let payload = { deckId, questionId, answer, attemptId, needResetPasses }
  console.log("是我的payload有傳錯嗎? ", payload)
  try {
    const response = await fetch(`/api/users/${userId}/attempts/${attemptId}/update`, {
      method: 'PUT',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    if (response.ok) {
      const updatedUserAttempt = await response.json()
      console.log("modifyUserAttempt.checkAttempt : ", updatedUserAttempt.checkAttempt)
      dispatch(updateUserAttempt(attemptId, updatedUserAttempt.checkAttempt));
      // dispatch(updateUserAttempt(attemptId, response));
      return updatedUserAttempt.checkAttempt;

    }
  } catch (error) {
    console.error("Error updating user attempt:", error);
  }
};
// //original modifyUserAttempt
// export const modifyUserAttempt = (userId, id, attemptId, answer, deckId) => async (dispatch) => {
//   try {
//     const checkAttempt = await checkAnswerInDB(userId, id, attemptId, answer, deckId); // API call
//     dispatch(updateUserAttempt(attemptId, checkAttempt));
//     return checkAttempt;
//   } catch (error) {
//     console.error("Error updating user attempt:", error);
//   }
// };

const initialState = {
  attempts: [],
  loading: false,
  error: null,
};

// Reducer
const userAttemptsReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_USER_ATTEMPT: {
      console.log("just for testing... ", action.allAttempts)
      const newState = { ...state }
      console.log("testing newState: ", newState)

      // Initialize newState.attempts as an array if it's not already
      if (!Array.isArray(newState.attempts)) {
        newState.attempts = [];
      }

      // Append action.allAttempts to the existing newState.attempts
      // newState.attempts = [...newState.attempts, ...action.allAttempts];
      newState.attempts = [...action.allAttempts];


      console.log("Updated newState: ", newState);

      // action.attempt.forEach((attempt) => {
      //   console.log("每一個attempt :", attempt)
      //   console.log("newState ...", newState)
      //   // newState["attempts"].push(attempt)

      // }
      // )
      return newState;

    }
    // case LOAD_USER_ATTEMPT:
    //   return {
    //     ...state,
    //     attempts: state.attempts.map(attempt =>
    //       attempt.deckId === action.attempt.deckId
    //         ? { ...action.attempt }
    //         : attempt
    //     ),
    //   };
    case LOAD_FIRST_USER_ATTEMPT:
      return {
        ...state,
        attempts: action.newAttemptId
      };
    case ADD_USER_ATTEMPT:
      return {
        ...state,
        attempts: [...state.attempts, action.newAttempt],
      };
    case UPDATE_USER_ATTEMPT:
      console.log("----attempt傳回來", state.attempts, action)
      return {
        ...state,
        attempts: state.attempts.map((attempt) =>
          attempt.id === action.id
            ? { ...attempt, checkAttempt: action.checkAttempt }
            : attempt
        ),
      };
    default:
      return state;
  }
};

export default userAttemptsReducer;
