import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
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

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(rootReducer, /* preloadedState, */ composeEnhancers(

    applyMiddleware(thunk)
));


export default store;

// Create and configure the store with middleware
// const store = createStore(
//     rootReducer,
//     applyMiddleware(thunk)
// );



// export default store;
