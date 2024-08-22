const { getUserLevelFromDB, getAllUserLevelsFromDB } = require('../services/levelService');

const getAllUserLevels = async (req, res) => {
    try {
        const userLevels = await getAllUserLevelsFromDB();
        res.status(200).json({ user_levels: userLevels });
    } catch (error) {
        res.status(500).json({ message: `Error fetching user levels: ${error.message}` });
    }
}

const getUserLevel = async (req, res) => {
    const { uid } = req.params;
    console.log('uid: ', uid);
    try {
        const userLevel = await getUserLevelFromDB(uid);
        if(!userLevel) {
            res.status(404).json({ message: 'User level not found' });
            return;
        }
        res.status(200).json(userLevel);
    } catch (error) {
        res.status(500).json({ message: `Error fetching user level: ${error.message}` });
    }
};


module.exports = {
    getUserLevel,
    getAllUserLevels
}
