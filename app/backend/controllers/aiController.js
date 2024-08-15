const { addQuestionsToDB, getQuestionsByUserIdFromDB } = require('../services/aiService');
// const { generateQuestionsByAI } = require('../models/aiModel');
const { generateQuestionsByAI } = require('../models/aiModel3');

const { options } = require('../routes/userRoutes');
const { db } = require('../firebase/firebaseConfig');

const { doc, getDoc } = require('firebase/firestore');




//the place i assebly ai model AND ai service
// user can get all questions he/she had
const getAllQuestionsbyAI = async (req, res) => {
    const { userId } = req.params;
    try {
        const allQuestions = await getQuestionsByUserIdFromDB(userId);
        res.status(200).json(allQuestions);
    } catch (error) {
        res.status(500).json({ message: `Error fetching user>ai_generated: ${error.message}` });
    }
}


// get question from AI and store in db
const addCardQuestions = async (req, res) => {
    console.log("am i hitting get ai questions route: ", req.body)
    const { topic_id, user_native_language, user_level, userId } = req.body


    //check if topic belongs to an existing concept
    const topicRef = doc(db, 'topics', topic_id);
    console.log("topicRef: ", topicRef)
    const topicDoc = await getDoc(topicRef);
    console.log("topicDoc: ", topicDoc)
    if (!topicDoc.exists()) {
        throw new Error("Topic does not exist!");
    }

    const topicData = topicDoc.data();
    const topic_name = topicData.topic_name
    console.log("topicData: ", topicData);

    if (!topicData.concept_id) {
        throw new Error("Invalid topic due to concept_id is empty!!")
    }

    try {

        let questionData = await generateQuestionsByAI(topic_name, user_native_language, user_level, topic_id);
        console.log("questionData: ", questionData)

        if (questionData) {
            const question_from_ai = await addQuestionsToDB(userId, { questionData });

            res.status(201).json({ message: `questions generated from ai added to db successfully!`, question_from_ai });
        } else {
            res.status(400).json({ message: `Error : ${error.message}` });
        }
    } catch (error) {
        res.status(500).json({ message: `Error adding questions: ${error.message}` });
    }


};
// const addCardQuestions = async (req, res) => {
//     console.log("am i hitting get ai questions route")
//     const { concept, topic, user_native_language, user_level, userId } = req.body
//     // get data from aiModel based on different cocept
//     try {
//         let questionData;
//         if (concept === "Basic Vocabulary") {
//             console.log("the learner is clicking Basic Vocabulary~~");
//             //check topic if topic.concept_id exists and if it matches concept's id
//             questionData = await generateVocabularyQuestionsByAI(topic, user_native_language, user_level);
//         } else if (concept === "Basic Grammar") {
//             console.log("the learner is clicking Basic Grammar~~");
//             questionData = await generateGrammerQuestionsByAI(topic, user_native_language, user_level);
//         } else if (concept === "Everyday Situations") {
//             console.log("the learner is clicking Everyday Situations~~");
//             questionData = await generateScenarioQuestionsByAI(topic, user_native_language, user_level)
//         }

//         if (questionData) {
//             const question_from_ai = await addQuestionsToDB(userId, { questionData });
//             res.status(201).json({ message: `questions generated from ai added to db successfully!`, question_from_ai });
//         } else {
//             res.status(400).json({ message: `Invalid concept: ${concept}` });
//         }
//     } catch (error) {
//         res.status(500).json({ message: `Error adding questions: ${error.message}` });
//     }


// };


module.exports = {
    addCardQuestions,
    getAllQuestionsbyAI
};
