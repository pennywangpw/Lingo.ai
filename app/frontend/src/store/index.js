import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import sessionReducer from './session';
import usersReducer from './users';
import conceptsReducer from './concepts';
import topicsReducer from './topics';
import questionsReducer from './questions';
import decksReducer from './decks';
import userAttemptsReducer from './attempt';

// Import your reducers


// Combine reducers
const rootReducer = combineReducers({
    session: sessionReducer,
    users: usersReducer,
    concepts: conceptsReducer,
    topics: topicsReducer,
    questions: questionsReducer,
    decks: decksReducer,
    attempts: userAttemptsReducer
    // cards: cardsReducer,
});

// Create and configure the store with middleware
const store = createStore(
    rootReducer,
    applyMiddleware(thunk)
);

export default store;
