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
import { createUserAttempt } from "../../store/attempt";
import { fetchUserConcepts } from "../../store/concepts";
import { useTheme } from "@mui/material/styles";

function DeckPage() {
  const dispatch = useDispatch();
  const history = useHistory();
  const { decks } = useSelector((state) => state.decks);
  const { conceptId, topicId } = useParams();
  const topic = useSelector((state) => state.topics[topicId]);
  const user = useSelector((state) => state.session.user);
  const [loading, setLoading] = useState(false);
  const concepts = Object.values(useSelector((state) => state.concepts));
  const conceptFilter = concepts.find((concept) => conceptId === concept.id);
  const decksFilter = decks?.filter((deck) => topicId === deck.topic_id);
  const theme = useTheme();


  useEffect(() => {
    if (user && topicId) {
      setLoading(true);
      dispatch(fetchDecks(user.uid, topicId)).finally(() => setLoading(false));
      dispatch(fetchOneTopic(topicId));
      dispatch(fetchUserConcepts(user.uid));
    }
  }, [dispatch, user, topicId]);

  const handleGenerateQuestions = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(
        addQuestions(
          conceptFilter.concept_name,
          topic.topic_name,
          user.native_language,
          conceptFilter.level,
          topicId,
          user.uid
        )
      );
      dispatch(fetchDecks(user.uid, topicId));
    } catch (error) {
      console.log("Error generating questions:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAttempt = async (deckId) => {
    try {
      const userId = user.uid;
      const result = await dispatch(createUserAttempt(userId, deckId));
      const newAttemptId = result.payload;
      history.push({
        pathname: `/decks/${deckId}`,
        state: { attemptId: newAttemptId },
      });
      console.log("Attempt started successfully:", newAttemptId);
    } catch (error) {
      console.error("Error starting attempt:", error);
    }
  };

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
          <h3 style={{ marginTop: 0 }}>{conceptFilter?.level}</h3>
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
                          onClick={() => handleStartAttempt(deck.id)}
                        >
                          <h3>{`Deck ${deck.deck_name}
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
                          <h3>{`Deck ${deck.deck_name
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
