const { GoogleGenerativeAI } = require("@google/generative-ai");
const { sendEmailVerification } = require("firebase/auth");
// Access your API key as an environment variable (see "Set up your API key" above)
const { API_KEY } = process.env;

const genAI = new GoogleGenerativeAI(API_KEY);


//generate questions from ai based on different topic
async function generateQuestionsByAI(concept_name, topic, native_language, level, topic_id) {
    console.log("am i hitting generateVocabularyQuestionsByAI functions and check the user level: ", concept_name, topic, native_language, level)
    // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });

    let picked_concept = concept_name.toLowerCase().split(" ").join("")
    let picked_topic = topic.toLowerCase().split(" ").join("")
    let role = `You're an English teacher.`
    let jsonschema = `JSON schema: { "type":"array", "properties": {"id": "integer", "question": "string",  "options": "array",  "answer": "string",  "explanation":"string", "isAttempted": false }}.`
    const vocabulary_nouns_content = {
        "Beginner": "Everyday objects like house, car, book...",
        "Intermediate": "Workplace objects, hobby-related items, travel essentials",
        "Advanced": "Specialized vocabulary like legal, medical, or technical terms"
    }

    const vocabulary_verbs_content = {
        "Beginner": "To be, to have, to do, to go, to eat verbs",
        "Intermediate": "can, could, might, should, would and phrasal verbs (take off, put on)",
        "Advanced": "Advanced verbs and their nuances (e.g., to undertake, to facilitate)"
    }

    const vocabulary_adjectives_content = {
        "Beginner": "Colors, sizes, shapes, basic emotions",
        "Intermediate": "Comparative and superlative forms, more descriptive adjectives (e.g., fascinating, terrible)",
        "Advanced": "Advanced descriptive language (e.g., intricate, minuscule)"
    }

    const vocabulary_pronouns_content = {
        "Beginner": "Basic pronouns (I, you, he, she, it, we, they)",
        "Intermediate": "Reflexive pronouns (myself, yourself) and relative pronouns (who, which)",
        "Advanced": " Indefinite pronouns (someone, anybody) and complex relative pronouns (whomever, whichever)"
    }

    const grammar_sentence_structure_question = {
        "Beginner": "Simple SVO (Subject-Verb-Object) order",
        "Intermediate": "Compound and complex sentences, For example: I ___ home because it ___ raining or She __ to the store, and she __ some milk.",
        "Advanced": "Use of subordinate clauses and participle clauses. For example: In each sentence below, identify the subordinate clause. Even though it was late, they continued working on the project."
    }
    const grammar_tense_question = {
        "Beginner": "Present Simple Tense: Simple statements, negatives, and questions ",
        "Intermediate": "Past Tense: Past Simple, past continuous , past perfect and past perfect continuous, For example: I ______ (watch) TV when the phone rang. ",
        "Advanced": "Future Tense: Future simple, future continuous, future perfect and future perfect continuous "

    }
    const grammar_prepositions_question = {
        "Beginner": "Simple prepositions (in, on, at, under, over, beside)",
        "Intermediate": "Prepositional phrases and more complex prepositions (despite, during, among)",
        "Advanced": "Advanced prepositional use in idiomatic expressions and phrasal verbs"
    }

    const grammar_articles_question = {
        "Beginner": "Basic use of a, an, the",
        "Intermediate": "Specific and general use of articles, omission of articles",
        "Advanced": "Nuanced article usage, such as in academic writing"
    }
    const everyday_situations_introductions_question = {
        "Beginner": "Basic self-introductions (name, age, where you’re from).",
        "Intermediate": "Detailed personal introductions, talking about hobbies and interests.",
        "Advanced": "Professional introductions, networking, and formal settings "
    }

    const everyday_situations_familyandfriends_question = {
        "Beginner": "Describing family members and close friends.",
        "Intermediate": "Discussing relationships, family traditions, and friend dynamics.",
        "Advanced": "Complex family structures, nuanced discussions about relationships."
    }
    const everyday_situations_dailyroutines_question = {
        "Beginner": "Simple descriptions of daily activities and times of day ",
        "Intermediate": "Detailed routines, discussing habits and frequency",
        "Advanced": "Complex schedules, discussing productivity and time management"
    }
    const everyday_situations_shopping_question = {
        "Beginner": "Asking for prices, describing items ",
        "Intermediate": "Bargaining, asking for recommendations, and product details",
        "Advanced": "Discussing consumer rights, returning items, and making complaints "
    }
    // Default prompt
    let prompt = role + `there're 3 student levels Beginner, Intermediate, Advanced. Give me 3 unique fill-in-the-blank questions for ${topic} and 4 choices in english,answer and explaination in ${native_language} for ${level} learner using this` + jsonschema

    // check concept_name (Vocabulary,Grammar,Everyday Situations)
    try {
        //common nouns, verbs, adj, common phrases (Vocabulary)
        if (picked_concept === "vocabulary") {
            if (picked_topic === "nouns") {
                prompt = role + ` there are 3 levels :beginner, intermediate, advanced. create 3 unique fill-in-the-blank questions for the topic ${vocabulary_nouns_content[level]} suitable for ${level} learners.
                Each question should have 4 answer options in the following format:
                - Option in English (Translation in ${native_language})

                For example:
                Question: The weather is very __ today.
                Options:
<<<<<<< HEAD
                A) hot (mainit)
                B) warm (mainit-init)
                C) cold (malamig)
                D) rainy (maulan)
=======
                hot (${native_language})
                warm (${native_language})
                cold (${native_language})
                rainy (${native_language})
>>>>>>> origin/vu-redux
                Ensure that the explanation for the correct answer is also provided in ${native_language} using this` + jsonschema

            }
            else if (picked_topic === "verbs") {
                prompt = role + `there're 3 levels :Beginner, Intermediate, Advanced. Give me 3 unique verbs questions to test if ${level} learner understand ${vocabulary_verbs_content[level]} and 4 choices in english,answer and explaination in ${native_language} using this` + jsonschema

            }
            else if (picked_topic === "adjectives") {
                prompt = role + `there're 3 levels :beginner, intermediate, advanced. Give me 3 unique fill-in-the-blank Adjectives questions to test if ${level} learner understand ${vocabulary_adjectives_content[level]}, and 4 choices in english,answer and explaination in ${native_language} using this` + jsonschema


            }
            else if (picked_topic === "pronouns") {
                prompt = role + `there're 3 levels :Beginner, Intermediate, Advanced. Give me 3 unique fill-in-the-blank pronouns questions to test if ${level} learner understand ${vocabulary_pronouns_content[level]} and 4 choices in english,answer and explaination in ${native_language}. Using` + jsonschema

            }


        }


        //present simple tense,sentence structure, prepositions, possessive pronouns (Grammar)
        else if (picked_concept === "grammar") {

            if (picked_topic === "tense") {
                prompt = role + `there're 3 levels Beginner, Intermediate, Advanced. Give me 3 unique fill-in-the-blank questions for ${grammar_tense_question[level]} and 4 choices in english,answer and explaination in ${native_language} for ${level} learner using this` + jsonschema

            }
            else if (picked_topic === "sentencestructure") {
                prompt = role + ` There are 3 levels: Beginner, Intermediate, and Advanced. Create 3 questions about ${grammar_sentence_structure_question[level]} for ${level} learners with 4 options in english, answer and explanation in ${native_language} for ${level} learners using this` + jsonschema


            }
            else if (picked_topic === "prepositions") {
                prompt = role + ` There are 3 levels: Beginner, Intermediate, and Advanced. Create 3 questions about ${grammar_prepositions_question[level]} for ${level} learners with 4 options in English, answer and explanation in ${native_language} using this` + jsonschema


            }

            else if (picked_topic === "articles") {
                prompt = role + ` There are 3 levels: Beginner, Intermediate, and Advanced. Create 3 quesitons about ${grammar_articles_question[level]} for ${level} learners.
                 Each question should have 4 answer options in the following format:
                - Option in English

                For example:
                Question: Choose the sentence that uses the indefinite article \"a\" correctly:
                Options:
<<<<<<< HEAD
                A)"The professor gave a lecture on philosophy.",
                B)"Professor gave lecture on philosophy.",
                C)"A professor gave a lecture on philosophy."
                D)"The professor gave the lecture on a philosophy."
=======
                "The professor gave a lecture on philosophy.",
                "Professor gave lecture on philosophy.",
                "A professor gave a lecture on philosophy."
                "The professor gave the lecture on a philosophy."
>>>>>>> origin/vu-redux

                Ensure that the explanation for the correct answer is also provided in ${native_language} using this` + jsonschema


            }
        }

        //family and friends, daily routines,shopping , food and drink (Everyday Situations)
        else if (picked_concept === "everydaysituations") {

            // prompt = role + `there're 3 levels :Beginner, Intermediate, Advanced. Give me 3 unique questions about  ${topic} to test if  ${level} learner understand how to response or ask the question and 4 choices in english,answer and explaination in ${native_language}. using this` + jsonschema

            if (picked_topic === "introductions") {
                prompt = role + `there're 3 levels Beginner, Intermediate, Advanced. Give me 3 unique fill-in-the-blank questions about ${everyday_situations_introductions_question[level]} in English
                Each question should have 4 answer options in the following format:
                - Option in English

                For example:
                Question: Hello, I’m Emily , a Project Manager at Tech, Inc. I ______ leading cross-functional teams to develop innovative software solutions.
                Options:
<<<<<<< HEAD
                A)"specialize in",
                B)"good at",
                C)"expert on"
                D)"good on"
=======
                "specialize in",
                "good at",
                "expert on"
                "good on"
>>>>>>> origin/vu-redux

                Ensure that the explanation for the correct answer is also provided in ${native_language} using this` + jsonschema

            }
            else if (picked_topic === "familyandfriends") {
                // prompt = role + `there're 3 levels Beginner, Intermediate, Advanced. Give me 3 unique fill-in-the-blank questions for ${everyday_situations_familyandfriends_question[level]}

                prompt = role + `there're 3 levels Beginner, Intermediate, Advanced. Create 3 questions, each question is a short conversations between 2 people about the topic:
                ${everyday_situations_familyandfriends_question[level]} in English.
                there're 3 levels Beginner, Intermediate, Advanced.Create 3 questions, each question is a short conversation between 2 people about the topic:${everyday_situations_dailyroutines_question[level]}.
                each question includes question with Select the most suitable answer for the blank on the top, 4 options in english, answer and explaination test ${level} learner to select the most suitable response or request for the conversation.
                For example:

                    Question:

                    Select the most suitable answer for the blank.

                    Person A: Do you have any siblings?

                    Person B: Yes, I have a brother. _______________

                    Person A: That’s nice! How old is he?

                    Options:

<<<<<<< HEAD
                    A) His name is John.

                    B) He lives in New York.

                    C) He is my best friend.

                    D) He is very funny.
=======
                     His name is John.

                     He lives in New York.

                     He is my best friend.
                     
                     He is very funny.
>>>>>>> origin/vu-redux



                ensure answer and explaination in ${native_language} using this` + jsonschema




            }
            else if (picked_topic === "dailyroutines") {
                // prompt = role + `there're 3 levels Beginner, Intermediate, Advanced. Give me 3 unique fill-in-the-blank questions for ${everyday_situations_dailyroutines_question[level]} and 4 choices in english,answer and explaination in ${native_language} for ${level} learner using this` + jsonschema
                prompt = role + `there're 3 levels Beginner, Intermediate, Advanced.Create 3 questions, each question is a short conversation between 2 people about the topic:${everyday_situations_dailyroutines_question[level]}.
                each question includes question with Select the most suitable answer for the blank on the top, 4 options in english, answer and explaination test ${level} learner to select the most suitable response or request for the conversation.
                For example:

                    Question:
                    Select the most suitable answer for the blank.

                    Person A: What do you do every morning?

                    Person B: I wake up at 7 AM and then I _______________.

                    Options:
<<<<<<< HEAD
                    A) watch TV
                    B) go to bed
                    C) read a book
                    D) eat breakfast
=======
                     watch TV
                     go to bed
                     read a book
                     eat breakfast
>>>>>>> origin/vu-redux
                ensure answer and explaination in ${native_language} using this` + jsonschema

            }
            else if (picked_topic === "shopping") {
                prompt = role + `there're 3 levels Beginner, Intermediate, Advanced.Create 3 questions, each question is a short conversation between 2 people about the topic:${everyday_situations_shopping_question[level]}.
                each question includes question with Select the most suitable answer for the blank on the top, 4 options in english, answer and explaination test ${level} learner to select the most suitable response or request for the conversation.
                For example:

                    Question:
                    Select the most suitable answer for the blank.

                    Shopper: Hi, can you help me?

                    Shop Assistant: Of course! What are you looking for?

                    Shopper: I am looking for a blue jacket.

                    Shop Assistant: We have some blue jackets over here. Would you like to see them?

                    Shopper: Yes, please. __________________________

                    Shop Assistant: That jacket is $55.

                    Options:

<<<<<<< HEAD
                    A) How much is this one?

                    B) What color is it?

                    C) How tall is it?

                    D) Where is the fitting room?
=======
                     How much is this one?

                     What color is it?

                     How tall is it?
                     Where is the fitting room?
>>>>>>> origin/vu-redux

                ensure answer and explaination in ${native_language} using this` + jsonschema

            }


        }
    } catch (error) {
        return error
    }


    try {

        const result = await model.generateContent(prompt);
        console.log('result: ', result);
        const jsonString = result.response.text();


        console.log("------------------------------")
        let jsonData = JSON.parse([jsonString])
        console.log('topic: ', topic)
        return { topic_id, topic, level, jsonData }
    } catch (error) {
        console.error('Error generating content:', error);
    }
}


module.exports = {
    generateQuestionsByAI

};
