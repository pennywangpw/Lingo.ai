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

    dispatch(loadUserAttempt(allAttempts || {})); // Handle empty attempts
  } catch (error) {
    console.error("Error fetching user attempt:", error);
  }
};


//initial user attempt

export const InitialUserAttempt = (userId, deckId, passes, totalQuestions, createdAt) => async (dispatch) => {
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




export const modifyUserAttempt = (userId, questionId, attemptId, answer, deckId, needResetPasses) => async (dispatch) => {
  // let payload = {userId, questionId, attemptId, answer, deckId}
  let payload = { deckId, questionId, answer, attemptId, needResetPasses }
  try {
    const response = await fetch(`/api/users/${userId}/attempts/${attemptId}/update`, {
      method: 'PUT',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    if (response.ok) {
      const updatedUserAttempt = await response.json()
      dispatch(updateUserAttempt(attemptId, updatedUserAttempt.checkAttempt));
      // dispatch(updateUserAttempt(attemptId, response));
      return updatedUserAttempt.checkAttempt;

    }
  } catch (error) {
    console.error("Error updating user attempt:", error);
  }
};


const initialState = {
  attempts: [],
  loading: false,
  error: null,
  message: null
};

// Reducer
const userAttemptsReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_USER_ATTEMPT: {
      const newState = { ...state }


      // Initialize newState.attempts as an array if it's not already
      if (!Array.isArray(newState.attempts)) {
        newState.attempts = [];
      }

      // Append action.allAttempts to the existing newState.attempts
      // newState.attempts = [...newState.attempts, ...action.allAttempts];
      newState.attempts = [...action.allAttempts];


      return newState;

    }

    case LOAD_FIRST_USER_ATTEMPT:
      return {
        ...state,
        message: action.newAttemptId
      };
    case ADD_USER_ATTEMPT:
      return {
        ...state,
        attempts: [...state.attempts, action.newAttempt],
      };
    case UPDATE_USER_ATTEMPT:
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
