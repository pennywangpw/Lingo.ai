const {
  getUserByIdFromDB,
  getUsersFromDB,
  getProgressFromDB,
  updateUserInDB,
  addUserToDB,
  updateUserProgressFromDB,
} = require("../services/userService");

const {
  getUserAttemptByIDFromDB,
  AddUserAttemptToDB,
  updateUserAttemptInDB,
  getUserAttemptsFromDB,
  checkAnswerInDB,
  checkAttemptInDB,
} = require("../services/attemptService");

const getUsers = async (req, res) => {
  console.log("get users route is hit");
  console.log("req.body: ", req.body);
  try {
    const users = await getUsersFromDB();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserById = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, native_language } = req.body;
  try {
    const updated = await updateUserInDB(id, {
      first_name,
      last_name,
      native_language,
    });
    res.status(200).json({ message: "User updated", updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a user by user id from DB
const getUserById = async (req, res) => {
  console.log("get user by id route is hit");
  const { id } = req.params;
  try {
    const user = await getUserByIdFromDB(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user progress
const getUserProgress = async (req, res) => {
  const { id } = req.params;
  try {
    const progress = await getProgressFromDB(id);
    res.status(200).json({ progress });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to get user progress", details: error.message });
  }
};

const updateUserProgress = async (req, res) => {
  const { id } = req.params;
  console.log("update user progress route is hit", id);
  try {
    await updateUserProgressFromDB(id);
    const progress = await getProgressFromDB(id);
    res
      .status(200)
      .json({ message: "User progress updated successfully", progress });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user progress", error: error.message });
  }
};

// View user attempts
const getUserAttempts = async (req, res) => {
  const { id } = req.params;
  console.log("uid: ", id);
  try {
    const attempts = await getUserAttemptsFromDB(id);
    res.status(200).json(attempts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user attempts", error: error.message });
  }
};

//view user attempt by id
const getUserAttemptById = async (req, res) => {
  const { userId, attemptId } = req.params;
  console.log("userId: ", userId, "attemptId: ", attemptId);
  try {
    const attempt = await getUserAttemptByIDFromDB(userId, attemptId);
    res.status(200).json({ userId, attempt });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user attempt", error: error.message });
  }
};
const checkUserAttempt = async (req, res) => {
  //use this route to check if user attempt's score is 80% or greater than total questions
  const { userId, attemptId } = req.params;
  console.log("userId: ", userId, "attemptId: ", attemptId);
  try {
    const checkAttempt = await checkAttemptInDB(userId, attemptId);
    res.status(200).json({ message: "User attempt checked", checkAttempt });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error checking user attempt", error: error.message });
  }
};

// Start new user attempt
const addUserAttempt = async (req, res) => {
  const { id } = req.params;
  const {
    deckId,
    passes = 0,
    totalQuestions = 3,
    createdAt = new Date().toISOString(),
  } = req.body;
  console.log("id: ", id);
  try {
    const attemptData = { deckId, passes, totalQuestions, createdAt };
    const newAttemptId = await AddUserAttemptToDB(attemptData, id);
    res.status(200).json({ message: "User attempt started", newAttemptId });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error starting user attempt", error: error.message });
  }
};

const updateUserAttempt = async (req, res) => {
  const { userId, attemptId } = req.params;
  const { deckId, id, answer } = req.body;
  console.log(
    "userId: ",
    userId,
    "attemptId: ",
    attemptId,
    "deckId: ",
    deckId,
    "id: ",
    id, //index of the answer they selected
    "answer: ",
    answer
  );
  try {
    const checkAttempt = await checkAnswerInDB(
      userId,
      id,
      attemptId,
      answer,
      deckId
    );
    res.status(200).json({ message: "User attempt updated", id, checkAttempt });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user attempt", error: error.message });
  }
};

module.exports = {
  getUserAttemptById,
  checkUserAttempt,
  getUsers,
  getUserProgress,
  getUserById,
  updateUserById,
  updateUserProgress,
  getUserAttempts,
  addUserAttempt,
  updateUserAttempt,
};
