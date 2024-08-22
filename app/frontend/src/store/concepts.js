const { db } = require("../firebase/firebaseConfig");
const { collection, getDocs, getDoc, doc } = require("firebase/firestore");

// Action Types
export const LOAD_CONCEPTS = "concepts/LOAD_CONCEPTS";
export const LOAD_ONE_CONCEPT = "concepts/LOAD_ONE_CONCEPT";
export const LOAD_TOPICS_BY_CONCEPT = "concepts/LOAD_TOPICS_BY_CONCEPT";

// Action Creators
const loadConcepts = (concepts) => ({
  type: LOAD_CONCEPTS,
  concepts
});

const loadOneConcept = (concept) => ({
  type: LOAD_ONE_CONCEPT,
  concept,
});

const loadConceptTopics = (conceptId, topics) => ({
  type: LOAD_TOPICS_BY_CONCEPT,
  payload: { conceptId, topics },
});

// Thunk Actions
// export const fetchConcepts = (userLevel) => async (dispatch) => {
//   try {
//     const conceptsCollectionRef = collection(db, "concepts");
//     const conceptsSnapshot = await getDocs(conceptsCollectionRef);

//     const conceptsData = conceptsSnapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     }));

//     dispatch(loadConcepts(conceptsData, userLevel)); // Update Redux state with concepts data
//   } catch (error) {
//     console.error("Error fetching concepts:", error);
//     // Dispatch error action or handle error appropriately
//   }
// };

export const fetchUserConcepts = (userId) => async (dispatch) => {
  try {

    const progressDocRef = doc(db, "progress", userId);

    const conceptRef = collection(progressDocRef, 'concepts');

    const conceptDoc = await getDocs(conceptRef);

    const concepts = conceptDoc.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    console.log("concept ", concepts)

    dispatch(loadConcepts(concepts));
  } catch (error) {
    throw new Error("Error fetching progress: " + error.message);
  }
};

export const fetchOneConcept = (conceptId) => async (dispatch) => {
  try {
    const response = await fetch(`/api/concepts/${conceptId}`);

    if (response.ok) {
      const concept = await response.json();
      dispatch(loadOneConcept(concept));
      return concept;
    } else {
      console.error("Response failed:", response.statusText);
    }
  } catch (error) {
    console.error("Error fetching concept:", error);
    // Dispatch error action or handle error appropriately
  }
};

export const fetchTopicsByConcept = (conceptId) => async (dispatch) => {
  console.log("CONCEPTIDHERE", conceptId);
  try {
    const response = await fetch(`/api/concepts/${conceptId}/topics`);
    console.log("CONCEPTID", response);
    if (response.ok) {
      const topics = await response.json();
      dispatch(loadConceptTopics(conceptId, topics));
      return topics;
    } else {
      console.error("Response failed:", response.statusText);
    }
  } catch (error) {
    console.error("Error fetching topics:", error);
    // Dispatch error action or handle error appropriately
  }
};

// Initial State
const initialState = {
  // concepts: {}, // Store concepts by ID
  // topics: {}, // Store topics by concept ID
};

// Reducer
const conceptsReducer = (state = initialState, action) => {
  switch (action.type) {
    // case LOAD_CONCEPTS: {
    //   const filteredConcepts = action.concepts
    //     .filter((concept) => concept.level === action.userLevel)
    //     .reduce((acc, concept) => {
    //       acc[concept.id] = concept;
    //       return acc;
    //     }, {});

    //   return {
    //     ...state,
    //     concepts: filteredConcepts,
    //   };
    case LOAD_CONCEPTS: {
      console.log("ACTION", action)
      const newState = { ...state };
      action.concepts.forEach((concept) => {
        newState[concept.id] = concept;
      });
      return newState;
    }
    case LOAD_ONE_CONCEPT: {
      const { concept } = action;
      return {
        ...state,
        concepts: {
          ...state.concepts,
          [concept.id]: concept,
        },
      };
    }
    case LOAD_TOPICS_BY_CONCEPT: {
      const { conceptId, topics } = action.payload;

      return {
        ...state,
        topics: {
          ...state.topics,
          [conceptId]: topics, // Replace topics for the specific concept
        },
      };
    }
    default:
      return state;
  }
};

export default conceptsReducer;
