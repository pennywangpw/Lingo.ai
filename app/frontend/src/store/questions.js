import { addQuestionsToDB } from "../services/aiService";
import { addCardsToDeckInDB, createDeckInDB } from "../services/deckService";
import { generateQuestionsByAI } from '../links/aiModel4';


const { db } = require("../firebase/firebaseConfig");
const { collection, getDoc, doc, getDocs } = require("firebase/firestore");
// const { generateQuestionsByAI } = require(aiModel4)
// const { generateQuestionsByAI } = require("../models/aiModel");
// const { generateQuestionsByAI } = require("../models/aiModel2");
// const { generateQuestionsByAI } = require("../models/aiModel3");
// const { generateQuestionsByAI } = require("../../../backend/models/aiModel4");




export const LOAD_QUESTIONS = () => "questions/LOAD_QUESTIONS";
export const ADD_QUESTION = () => "questions/ADD_QUESTION";

const load = (questions) => ({
  type: LOAD_QUESTIONS,
  questions,
});

const add = (question) => ({
  type: ADD_QUESTION,
  question,
});

//original addQuestions
// export const addQuestions =
//   (concept_name, topic_name, user_native_language, concept_level, topicId, userId) => async (dispatch) => {
//     try {
//       let questionData = await generateQuestionsByAI(
//         concept_name,
//         topic_name,
//         user_native_language,
//         concept_level,
//         topicId
//       );
//       console.log("questionData: ", questionData);

//       dispatch(
//         add({
//           concept_name,
//           topic_name,
//           user_native_language,
//           concept_level,
//           topicId,
//         })
//       );

//       if (questionData) {
//         const question_from_ai = await addQuestionsToDB(userId, {
//           questionData,
//         });
//         console.log("Created questions successfully:", question_from_ai);


//         // Create a new deck in the database
//         const deck = await createDeckInDB({
//           userId,
//           topic_id: topicId,
//           createdAt: new Date(),
//           archived: false,
//         });

//         console.log("Deck created successfully:", deck);

//         // Add the generated questions as cards to the deck
//         const cardsAdded = await addCardsToDeckInDB(deck.id, userId, question_from_ai);

//         console.log("Cards added to deck successfully:", cardsAdded);

//         return cardsAdded;
//       }
//     } catch (error) {
//       console.error("Error during sign up:", error);
//       throw error;
//     }
//   };

export const addQuestions =
  (concept_name, topic_id, user_native_language, user_level, userId) => async (dispatch) => {
    console.log("payload for ai: ", concept_name, topic_id, user_native_language, user_level, userId)
    let payload = {
      concept_name: concept_name,
      topic_id: topic_id,
      user_native_language: user_native_language,
      user_level: user_level,
      userId: userId
    }
    console.log("payload is here : ", payload)
    try {
      const response = await fetch(`/api/ai/create-questions`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const generatedQuestionId = await response.json()
        console.log("我拿到了 generatedQuestionId: ", generatedQuestionId)
        dispatch(add(generatedQuestionId))
      }

    } catch (error) {
      console.error("Error during add question:", error);
      throw error;
    }
  };

const initialState = {};

const questionsReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_QUESTION:
      console.log("這裡是存入redux store裡面的 ...state, user: action.payload: ", action)
      return { ...state, user: action.question };
    default:
      return state;
  }
};

export default questionsReducer;
