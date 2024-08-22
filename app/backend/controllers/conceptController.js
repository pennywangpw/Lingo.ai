const {
    getConceptsFromDB,
    addConceptToDB,
    updateConceptInDB,
    getConceptByIdFromDB,
    removeConceptFromDB,
    getTopicsByConceptId
} = require('../services/conceptService');

// Controller to get all concepts
const getConcepts = async (req, res) => {
    try {
        const concepts = await getConceptsFromDB();
        res.status(200).json(concepts);
    } catch (error) {
        res.status(500).json({ message: `Error fetching concepts: ${error.message}` });
    }
};

// Controller to get a specific concept by id
const getConcept = async (req, res) => {
    const { conceptId } = req.params;
    try {
        const concept = await getConceptByIdFromDB(conceptId);
        res.status(200).json(concept);
    } catch (error) {
        res.status(500).json({ message: `Error fetching concept: ${error.message}` });
    }
};

//Controller for getting all topics by concept id
const getTopicsByConcept = async (req, res) => {
    const { conceptId } = req.params;
    try {
        const topics = await getTopicsByConceptId(conceptId);
        res.status(200).json({ topics });
    } catch (error) {
        res.status(500).json({ message: `Error fetching topics: ${error.message}` });
    }
}

// Controller to add a new concept
const addConcept = async (req, res) => {
    const { concept_name, level, status } = req.body;
    try {
        const conceptId = await addConceptToDB({ concept_name, level, status });
        res.status(201).json({ message: 'Concept added', conceptId });
    } catch (error) {
        res.status(500).json({ message: `Error adding concept: ${error.message}` });
    }
};

// Controller to update an existing concept
const updateConcept = async (req, res) => {
    const { conceptId } = req.params;
    const { concept_name, level, status } = req.body;
    try {
        await updateConceptInDB(conceptId, { concept_name, level, status });
        res.status(200).json({ message: 'Concept updated' });
    } catch (error) {
        res.status(500).json({ message: `Error updating concept: ${error.message}` });
    }
};

// Controller to get a specific concept by id
const getConceptById = async (req, res) => {
    const { conceptId } = req.params;
    try {
        const concept = await getConceptByIdFromDB(conceptId);
        res.status(200).json(concept);
    } catch (error) {
        res.status(500).json({ message: `Error fetching concept: ${error.message}` });
    }
};

// Controller to remove a concept
const removeConcept = async (req, res) => {
    const { conceptId } = req.params;
    try {
        await removeConceptFromDB(conceptId);
        res.status(200).json({ message: 'Concept removed' });
    } catch (error) {
        res.status(500).json({ message: `Error removing concept: ${error.message}` });
    }
};

module.exports = {
    getConcepts,
    addConcept,
    updateConcept,
    getConceptById,
    removeConcept,
    getTopicsByConcept,
    getConceptById
};
