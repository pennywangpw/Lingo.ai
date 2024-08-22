import {
  Container,
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Grid,
  Card,
  Button,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import {
  useParams,
  useLocation,
} from "react-router-dom/cjs/react-router-dom.min";
import { useDispatch, useSelector } from "react-redux";
import { fetchOneDeck } from "../../store/decks";
import { fetchUserAttempt, modifyUserAttempt } from "../../store/attempt";

function CardPage() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { deckId } = useParams();
  const location = useLocation();
  const user = useSelector((state) => state.session.user);
  const deck = useSelector((state) => state.decks.selectedDeck);
  const cards = deck?.cards?.[0]?.questionData?.jsonData || [];
  const attempt = useSelector((state) => state.attempts);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  //const attemptId = useSelector((state) => state.userAttempts);
  const { attemptId } = location.state || {};
  const topicName = deck?.cards?.[0]?.questionData?.topic;
  const topicLevel = deck?.level;

  console.log("cards", cards);

  useEffect(() => {
    dispatch(fetchOneDeck(deckId));
  }, [dispatch, deckId, attemptId]);

  const handleAnswerChange = async (cardIndex, optionIndex, questionId) => {
    const selectedOption = cards[cardIndex].options[optionIndex];
    try {
      // Update local state
      setSelectedAnswers((prevAnswers) => ({
        ...prevAnswers,
        [cardIndex]: optionIndex,
      }));

      const checkAttempt = await dispatch(
        modifyUserAttempt(
          user.uid,
          questionId,
          attemptId,
          selectedOption,
          deckId
        )
      );

      console.log("checkAttempt: ", checkAttempt);

      if (checkAttempt && checkAttempt.message === "Answer is correct!") {
        setFeedback({ cardIndex, isCorrect: true });
      } else if (
        checkAttempt &&
        checkAttempt.message === "Answer is incorrect."
      ) {
        setFeedback({
          cardIndex,
          isCorrect: false,
          correctAnswer: checkAttempt.correctAnswer,
        });
      }
    } catch (error) {
      console.error("Error modifying user attempt:", error);
    }
  };

  return (
    <>
      <h1 style={{ textAlign: "center", marginBottom: 0 }}>{topicName}</h1>
      <h3 style={{ textAlign: "center", marginTop: 0 }}>{topicLevel}</h3>
      <Container
        sx={{
          display: "grid",
          justifyContent: "space-evenly",
          height: "100vh",
          p: 2,
        }}
      >
        <Grid container spacing={2}>
          {cards.map((card, cardIndex) => (
            <React.Fragment key={card.id}>
              {/* QUESTION CARD */}
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "300px",
                    height: "450px",
                    borderRadius: "3px",
                    border: `1.5px solid ${
                      theme.palette.mode === "light" ? "#160e0e" : "#f1e9e9"
                    }`,
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: `${theme.palette.divider.main}`,
                      height: "300px",
                      padding: "20px",
                      overflow: "auto",
                    }}
                  >
                    <h2 style={{ margin: "0" }}>{card.question}</h2>
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: `${theme.palette.background.main}`,
                      height: "150px",
                      padding: "10px",
                      borderTop: `1.5px solid ${
                        theme.palette.mode === "light" ? "#160e0e" : "#f1e9e9"
                      }`,
                      overflow: "auto",
                      display: "flex",
                      alignContent: "center",
                    }}
                  >
                    <FormControl>
                      <RadioGroup
                        row
                        aria-labelledby="demo-row-radio-buttons-group-label"
                        name="row-radio-buttons-group"
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)", // Two columns layout
                          gridAutoFlow: "row",
                          gap: "10px",
                          alignItems: "center",
                          height: "100%",
                        }}
                        onChange={(e) =>
                          handleAnswerChange(
                            cardIndex,
                            parseInt(e.target.value),
                            card.id
                          )
                        }
                      >
                        {card.options.map((option, optionIndex) => (
                          <FormControlLabel
                            key={optionIndex}
                            value={optionIndex} // Set the index as the value
                            control={
                              <Radio
                                sx={{ color: theme.palette.primary.main }}
                              />
                            }
                            label={option}
                            sx={{
                              margin: 0,
                              width: "100%", // Ensure each label takes the full width of the grid cell
                              display: "flex",
                              alignItems: "center", // Vertically centers content within each grid cell
                              justifyContent: "flex-start",
                              height: "100%",
                            }}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </Box>
                </Card>
              </Grid>

              {/* CORRECT ANSWER */}
              {feedback.cardIndex === cardIndex && feedback.isCorrect && (
                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      width: "300px",
                      height: "450px",
                      borderRadius: "3px",
                      border: `1.5px solid ${
                        theme.palette.mode === "light" ? "#160e0e" : "#f1e9e9"
                      }`,
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: `${theme.palette.secondary.main}`,
                        height: "300px",
                        padding: "20px",
                        overflow: "auto",
                      }}
                    >
                      <h2 style={{ margin: "0" }}>{card.question}</h2>
                      <FormLabel disabled>
                        <Typography
                          sx={{ color: theme.palette.text.primary, mt: 2 }}
                        >
                          Correct!
                          <p>{card.explanation}</p>
                        </Typography>
                      </FormLabel>
                    </Box>
                    <Box
                      sx={{
                        backgroundColor: `${theme.palette.background.main}`,
                        height: "150px",
                        padding: "10px",
                        borderTop: `1.5px solid ${
                          theme.palette.mode === "light" ? "#160e0e" : "#f1e9e9"
                        }`,
                        overflow: "auto",
                        display: "flex",
                        alignContent: "center",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <CheckIcon
                          sx={{ color: theme.palette.completion.good }}
                        />
                        <Typography sx={{ ml: 2 }}>{card.answer}</Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              )}

              {/* INCORRECT ANSWER */}
              {feedback.cardIndex === cardIndex && !feedback.isCorrect && (
                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      width: "300px",
                      height: "450px",
                      borderRadius: "3px",
                      border: `1.5px solid ${
                        theme.palette.mode === "light" ? "#160e0e" : "#f1e9e9"
                      }`,
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: `${theme.palette.primary.main}`,
                        height: "300px",
                        padding: "20px",
                        overflow: "auto",
                      }}
                    >
                      <h2 style={{ margin: "0" }}>{card.question}</h2>
                      <FormLabel disabled>
                        <Typography
                          sx={{ color: theme.palette.text.primary, mt: 2 }}
                        >
                          Incorrect!
                          <p>{card.explanation}</p>
                        </Typography>
                      </FormLabel>
                    </Box>
                    <Box
                      sx={{
                        backgroundColor: `${theme.palette.background.main}`,
                        height: "150px",
                        padding: "10px",
                        borderTop: `1.5px solid ${
                          theme.palette.mode === "light" ? "#160e0e" : "#f1e9e9"
                        }`,
                        overflow: "auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column"
                      }}
                    >
                        {/* <Typography sx={{ ml: 2 }}>
                          {feedback.correctAnswer}
                          </Typography> */}
                          <CloseIcon
                            sx={{ color: theme.palette.completion.poor }}
                            />
                        <p>Correct answer: {feedback.correctAnswer}</p>
                    </Box>
                  </Card>
                </Grid>
              )}
            </React.Fragment>
          ))}
        </Grid>
      </Container>
    </>
  );
}

export default CardPage;
