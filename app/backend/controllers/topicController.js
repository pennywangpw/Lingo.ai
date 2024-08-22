const { getTopicByIdFromDB, getTopicsFromDB, addTopicToDB, updateTopicInDB, removeTopicFromDB } = require('../services/topicService');

const getTopics = async (req, res) => {
    try {
        const topics = await getTopicsFromDB();
        res.status(200).json(topics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getTopicById = async (req, res) => {
    const { topicId } = req.params;
    try {
        const topic = await getTopicByIdFromDB(topicId);
        res.status(200).json(topic);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const addTopic = async (req, res) => {
    const { topic_name, status, concept_id} = req.body;
    //we need to check if topic_id and concept_id exist in the database
    try {
        const topic = await addTopicToDB({ topic_name, status, concept_id });
        res.status(201).json({ message: 'Topic added', topic });
    } catch (error) {
        res.status(500).json({ message: `Error adding topic: ${error.message}` });
    }
};

const updateTopic = async (req, res) => {
    const { topicId } = req.params;
    const { topic_name, status, concept_id } = req.body;
    try {
        await updateTopicInDB(topicId, { topic_name, status, concept_id });
        res.status(200).json({ message: 'Topic updated' });
    } catch (error) {
        res.status(500).json({ message: `Error updating topic: ${error.message}` });
    }
};

const removeTopic = async (req, res) => {
    const { topicId } = req.params;
    try {
        await removeTopicFromDB(topicId);
        res.status(200).json({ message: 'Topic removed' });
    } catch (error) {
        res.status(500).json({ message: `Error removing topic: ${error.message}` });
    }
};

module.exports = { getTopics, addTopic, updateTopic, removeTopic, getTopicById };
