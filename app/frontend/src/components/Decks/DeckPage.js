import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDecks } from "../../store/decks";
import { useParams } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
  LinearProgress
} from "@mui/material";
import { addQuestions } from "../../store/questions";
import { fetchOneTopic } from "../../store/topics";
import { NavLink, useHistory } from "react-router-dom";
import { createUserAttempt, InitialUserAttempt, fetchUserAttempt } from "../../store/attempt";
import { fetchUserConcepts } from "../../store/concepts";
import { fetchUserProgress } from '../../store/users';
import { createDeck } from '../../store/decks';

import { useTheme } from "@mui/material/styles";
let findAttemptRecord = null
let currentAttemptId = ""
let decksFilter = null

function DeckPage() {
  //1.get all decks under the current user and current topic (get all decks then filter decks.topic_id == topic_id)
  //2.get user progress in order to get concept_level
  //3.get user in order to get language
  const dispatch = useDispatch();
  const history = useHistory();
  const { conceptId, topicId } = useParams();
  const [loading, setLoading] = useState(false);
  const [deckId, setDeckId] = useState("")
  const theme = useTheme();

  //get currentUser
  const user = useSelector((state) => state.session.user)
  const userId = user.uid;

  //get all decks from store
  //get all attempts from store
  const { decks } = useSelector((state) => state.decks);
  const attempts = useSelector((state) => state.attempts);


  //get all decks under the current user and current topic (get all decks then filter decks.topic_id == topic_id)
  //同一個topic下有很多個decks
  decksFilter = decks?.filter((deck) => userId == deck.userId && topicId === deck.topic_id);
  console.log("decksFilter 需要deck id: ", decksFilter)
  // Sort the decks by createdAt in descending order (latest deck first)
  const sortedDecks = decksFilter?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Get the latest deck (first item in the sorted array)
  const latestDeck = sortedDecks?.[0];

  console.log("Latest deck:", latestDeck);


  //get CurrentUser progress to get current concept
  const progressState = useSelector((state) => state.users.progress);
  const progress = progressState && Object.values(progressState)
  const currentConcept = progress?.[0].concepts.filter(concept => concept.id == conceptId)


  //get current topic
  const topic = useSelector((state) => state.topics[topicId]);

  //get new generated questions id
  const newQuestionId = useSelector((state) => state.questions.questionId)
  console.log("我拿出來的question : ", newQuestionId)


  useEffect(() => {
    if (user && topicId) {
      setLoading(true);
      dispatch(fetchDecks(user.uid, topicId)).finally(() => setLoading(false));
      dispatch(fetchUserProgress(userId))
      dispatch(fetchOneTopic(topicId));

    }
  }, [dispatch, user, topicId]);

  // Use useEffect to monitor changes in newQuestionId, create a new deck once newQuestionId is generated
  useEffect(() => {
    if (newQuestionId) {
      console.log("是否有進入這個條件~");
      dispatch(createDeck(user.uid, newQuestionId)).then(() => {
        dispatch(fetchDecks(user.uid, topicId));
      });
    }
  }, [newQuestionId, dispatch, user.uid, topicId]);


  //因為attempt 資料裡面有紀載DeckId,而deckId又是獨一無二,拿到所有的attempt用deckId找出attempt紀錄
  useEffect(() => {
    dispatch(fetchUserAttempt(user.uid))
  }, []);

  //initial
  let passes = 0
  let totalQuestions = 3
  let createdAt = ""
  let newAttemptId = ""


  const handleGenerateQuestions = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(
        addQuestions(
          currentConcept[0].concept_name,
          topic.id,
          user.native_language,
          currentConcept[0].level,
          userId
        )
      );





    } catch (error) {
      console.log("Error generating questions:", error.message);
    } finally {
      setLoading(false);
    }
  };
  // //original handleGenerateQuestions
  // const handleGenerateQuestions = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   try {
  //     await dispatch(
  //       addQuestions(
  //         currentConcept.concept_name,
  //         topic.topic_name,
  //         user.native_language,
  //         currentConcept.level,
  //         topicId,
  //         user.uid
  //       )
  //     );
  //     dispatch(fetchDecks(user.uid, topicId));
  //   } catch (error) {
  //     console.log("Error generating questions:", error.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  //這裡應該是要開始attempt,所以是變更attempt,但會在interact with card時變更attempt
  //initial attempt OR try to find attempt record
  //redirect to card page
  const handleRedirectToCards = async (deckId) => {
    try {
      //try to find attemptId for selected deck (fetch get all user attempts) find the one where deckId === deck.id
      if (attempts) {
        console.log("拿到Store裡面的attempts: ", attempts)
        findAttemptRecord = attempts.attempts.filter(
          (attempt) => attempt.deckId === deckId
        );
      }
      console.log("在redirect前先進到這 findAttemptRecord: ", findAttemptRecord)

      //if CAN NOT find the attempt record
      if (findAttemptRecord.length === 0) {
        console.log("在redirect前先進到這")
        newAttemptId = await dispatch(
          InitialUserAttempt(
            userId,
            latestDeck.id,
            passes,
            totalQuestions,
            createdAt
          )
        );
        console.log("測試看看newAttemptId: ", newAttemptId)

      }


      try {

        history.push({
          pathname: `/decks/${deckId}`,
          state: { userId: userId },

          // state: { attemptId: newAttemptId, userId: userId },
        });
        console.log("Redirect......", newAttemptId);

      } catch (error) {
        console.error("Error starting attempt:", error);
      }
    } catch (error) {
      console.error("Error in InitialUserAttempt:", error.message);
    }


  };
  // const handleStartAttempt = async (deckId) => {
  //   try {
  //     const userId = user.uid;
  //     // const result = await dispatch(createUserAttempt(userId, newAttemptId));

  //     // const result = await dispatch(createUserAttempt(userId, deckId));
  //     // const newAttemptId = result.payload;
  //     history.push({
  //       pathname: `/decks/${deckId}`,
  //       state: { attemptId: newAttemptId, userId: userId },
  //     });
  //     console.log("Attempt started successfully:", newAttemptId);
  //   } catch (error) {
  //     console.error("Error starting attempt:", error);
  //   }
  // };

  const handleResumeAttempt = (deckId, attemptId) => {
    history.push({
      pathname: `/decks/${deckId}`,
      state: { attemptId },
    });
  };

  const getAllDecks = () => {
    return decksFilter?.filter((deck) => !deck.attemptId && !deck.isArchived) || [];
  };

  const getInProgressDecks = () => {
    return decksFilter?.filter((deck) => deck.attemptId && !deck.archived) || [];
  };

  const getArchivedDecks = () => {
    return decksFilter?.filter((deck) => deck.archived) || [];
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      flexDirection="column"
      minHeight="100vh"
    >
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Check if topic is loaded before trying to access topic_name */}
          <h1 style={{ marginBottom: 0 }}>{topic ? topic.topic_name : "Loading topic..."}</h1>
          <h3 style={{ marginTop: 0 }}>{currentConcept?.level}</h3>
          <Container sx={{
            display: "grid",
            justifyContent: "center"
          }}>
            <Box px={50}
              sx={{
                display: "flex",
                justifyContent: "center"
              }}>
              <Button
                color="primary"
                onClick={handleGenerateQuestions}
                variant="contained"


                // fullWidth
                // size="large"
                sx={{
                  borderRadius: "3px",
                  border: `1.5px solid ${theme.palette.mode === "light" ? "#160e0e" : "#f1e9e9"
                    }`,
                }}
              >
                Generate New Deck
              </Button>
            </Box>
            <Box display="flex" flexDirection="row" width="100%" mt={2} columnGap="20px">
              {/* New Column */}
              <Box flex={1} p={2}>
                <h2>
                  New
                </h2>
                {getAllDecks().length > 0 ? (
                  <Grid container spacing={2}>
                    {getAllDecks().map((deck, index) => (
                      <Grid item key={deck.id} xs={12} sm={6} md={4}>
                        <Button
                          component={NavLink}
                          to={`/decks/${deck.id}`}
                          variant="contained"
                          color="primary"
                          sx={{
                            width: "150px",
                            height: "225px",
                            borderRadius: "3px",
                            border: `1.5px solid ${theme.palette.mode === "light" ? "#160e0e" : "#f1e9e9"
                              }`,
                          }}
                          // onClick={() => handleStartAttempt(deck.id)}
                          onClick={() => handleRedirectToCards(deck.id)}

                        >
                          <h3>{`Deck #${deck.deck_name}
                            `}</h3>
                          {/* <Typography variant="body1">
                            {deck.deckName}
                          </Typography>{" "} */}
                          {/* Update with your deck field */}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography>You currently do not have any new decks (decks with zero attempts).</Typography>
                )}
              </Box>

              <Box flex={1} p={2}>
                <h2>
                  In Progress
                </h2>
                {getInProgressDecks().length > 0 ? (
                  <Grid container spacing={2}>
                    {getInProgressDecks().map((deck, index) => (
                      <Grid item key={deck.id} xs={12} sm={6} md={4}>
                        <Button
                          component={NavLink}
                          to={`/decks/${deck.id}`}
                          variant="contained"
                          color="secondary"
                          sx={{
                            width: "150px",
                            height: "225px",
                            borderRadius: "3px",
                            border: `1.5px solid ${theme.palette.mode === "light" ? "#160e0e" : "#f1e9e9"
                              }`,
                          }}
                          onClick={() =>
                            handleResumeAttempt(deck.id, deck.attemptId)
                          }
                        >
                          <h3>{`Deck #${deck.deck_name
                            }`}</h3>
                          {/* <Typography variant="body1">
                            {deck.deckName}
                          </Typography>{" "} */}
                          {/* Update with your deck field */}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography>You currently do not have any decks in progress (decks with at least one attempt).</Typography>
                )}
              </Box>
            </Box>
            <Box>
              <Box flex={1} p={2} paddingTop="20px">
                <h2>
                  Archived Decks
                </h2>
                {getArchivedDecks().length > 0 ? (
                  <Grid container spacing={2}>
                    {getArchivedDecks().map((deck, index) => (
                      <Grid item key={deck.id} xs={12} sm={6} md={4}>
                        <Button
                          component={NavLink}
                          to={`/decks/${deck.id}`}
                          variant="contained"
                          color="divider"
                          sx={{
                            width: "150px",
                            height: "225px",
                            borderRadius: "3px",
                            border: `1.5px solid ${theme.palette.mode === "light" ? "#160e0e" : "#f1e9e9"
                              }`,
                          }}
                        >
                          <Typography variant="h6">{`Deck #${deck.deck_name}`}</Typography>
                          <h3>{`Deck #${deck.deck_name
                            }`}</h3>
                          {/* Update with your deck field */}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography>You currently do not have any archived decks (completed decks).</Typography>
                )}
              </Box>
            </Box>
          </Container>
        </>
      )}
    </Box>
  );
}

export default DeckPage;
