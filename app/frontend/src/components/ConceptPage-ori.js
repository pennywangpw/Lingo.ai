import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Box, Button, Container, Grid, LinearProgress, Collapse, IconButton, Divider, Typography } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { NavLink } from "react-router-dom";
import { fetchUserConcepts } from '../store/concepts';
// import { fetchUserProgress } from '../store/users';
import { useTheme } from '@emotion/react';
import LockIcon from '@mui/icons-material/Lock';
// import CheckIcon from '@mui/icons-material/Check';
import BeginnerConcepts from './ConceptsPage-Beginner';
import IntermediateConcepts from './ConceptsPage-Intermediate';

function ConceptPage() {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.session.user)
  const concepts = Object.values(useSelector((state) => state.concepts));
  // const progressState = useSelector((state) => state.users.progress);
  // const progress = progressState && Object.values(progressState)
  // const concepts = Object.values(useSelector((state) => state.concepts.concepts));
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const [showBeginner, setShowBeginner] = useState(false);
  const [showIntermediate, setShowIntermediate] = useState(false);

  const handleBeginnerToggle = () => {
    setShowBeginner(!showBeginner);
  };

  const handleIntermediateToggle = () => {
    setShowIntermediate(!showIntermediate);
  };



  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      await dispatch(fetchUserConcepts(user?.uid));
      // await dispatch(fetchUserProgress(user.uid))
      setLoading(false);
    };

    fetchData();
  }, [dispatch, user.uid]);

  // const combinedConcepts = concepts.map(concept => {
  //   const progressData = progress?.[0].concepts.find(p => p.id === concept.id);

  //   return {
  //     ...concept,
  //     progress: progressData?.status
  //   };
  // });

  // const sortedConcepts = combinedConcepts.sort((a, b) => b.concept_name.localeCompare(a.concept_name));

  const currentConcepts = concepts.filter(concept =>
    concept.level === user.level
  ).sort((a, b) => b.concept_name.localeCompare(a.concept_name));

  let conceptCount = 0;
  let topicsCount = 0;
  let passedConcepts = 0

  currentConcepts?.map(concept => {
    if (concept.status === true) conceptCount++
    concept.topics.map(topic => {
      if (topic.passes === 3) topicsCount++
    })
    return conceptCount
  })

  if (topicsCount === 4) passedConcepts = 1

  console.log("TOPICC", topicsCount);

  let conceptPercentage = (conceptCount / currentConcepts?.length) * 100

  console.log(currentConcepts);
  if (loading) {
    return <LinearProgress />;
  }

  // user should see avail concepts section if user is intermediate or advanced.
  // user should see beginner concept if user is intermediate or advanced
  // user should see intermediate if user is advanced


  // // intermediate should see beginner if:
  // if level is intermediate and badge is empty => signed up as intermediate ==> see beginner
  // if level is intermediate and badge has Bronze => user completed beginner ==> see beginner
  // // advanced should see
  // if level is advanced and badge is empty => signed up as advanced ==> see beginner, intermediate
  // if level is advanced and badge has Bronze and Silver => user completed beginner, intermediate ==> see beginner, intermediate
  // if level is advanced and bage has Bronze, Silver, Gold => user completed beginner, intermediate, advanced ==> see beginner, intermediate, advanced

  return (
    <Container>
      <Box>
        <Box display='flex' flexDirection='column' alignItems='center'>
          <h1>Select a {user.level} Concept</h1>
          <p>
            These are the recommended concepts based on your current
            proficiency level.
          </p>
          {conceptPercentage === 100 ? (
            <p>Congratulations! You've earned the Lingo.ai {user.level} Champion Badge.</p>
          ) : (
            user.level !== "Advanced" ? (<p>Pass all the concepts to unlock the next proficiency level.</p>)
              : (<p>Pass all the concepts to get your Lingo.ai Advanced Champion Badge.</p>)
          )}
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <Box sx={{ position: 'relative', display: 'inline-flex', width: '75%', margin: 'auto' }}>
            <LinearProgress
              variant="determinate"
              value={conceptPercentage}
              sx={{ height: 25, width: '100%', borderRadius: '3px' }}
              color='secondary'
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography fontSize="small" fontWeight="bold" color="textSecondary">{`${Math.round(conceptPercentage)}%`}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      <Grid container justifyContent='center' py={5} spacing={5}>
        {currentConcepts?.map(concept => (
          concept.status === true || concept.concept_name === "Vocabulary" ? (
            <Grid item key={concept.id}>
              <Button component={NavLink} to={`/concepts/${concept.id}`}
                sx={{
                  backgroundColor: `${theme.palette.secondary.main}`,
                  color: `${theme.palette.secondary.contrastText}`,
                }}>
                <Box display='flex' flexDirection='column'
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignContent: "center",
                    padding: "10px 20px",
                    width: "250px",
                    height: "200px",
                  }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "start",
                      height: "100px"
                    }}>
                    <Box
                      sx={{
                        width: "fit-content",
                        display: "flex",
                        alignItems: "center"
                      }}>

                      <h3>{concept.concept_name}</h3>
                      {/* {concept.progress === true &&
                        <CheckIcon sx={{
                          ml: 1,
                          color: `${theme.palette.completion.good}`,
                        }} />
                      } */}
                    </Box>
                  </Box>
                  <p>{concept.level}</p>
                  {/* <LinearProgress
                    variant='determinate'
                    value={concept.topicsPassed * 100}
                    sx={{ height: 15 }}
                    color='divider'
                  /> */}
                  <Box sx={{ position: 'relative', display: 'inline-flex', width: '100%', margin: 'auto' }}>
                    <LinearProgress
                      variant="determinate"
                      value={concept.topicsPassed * 100}
                      sx={{ height: 25, width: '100%', borderRadius: '3px' }}
                      color='divider'
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography fontSize="small" fontWeight="bold" color="textSecondary">{`${Math.round(concept.topicsPassed * 100)}%`}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Button>
            </Grid>
          ) : (
            <Grid item key={concept.id}>
              <Button sx={{
                textAlign: "left",
                // backgroundColor: `${theme.palette.text.disabled}`,
                color: `${theme.palette.text.disabled}`,
                "&:hover": {
                  cursor: "default",
                },
              }}>
                <Box display='flex' flexDirection='column'
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignContent: "center",
                    padding: "10px 20px",
                    width: "250px",
                    height: "200px"
                  }}>
                  <Box
                    sx={{
                      height: "100px"
                    }}>
                    <h3>{concept.concept_name}</h3>
                  </Box>
                  <p>{concept.level}</p>
                  {/* <LinearProgress
                    variant='determinate'
                    value={0}
                    sx={{
                      height: 15
                    }}
                    color="text"
                  /> */}
                  <Box sx={{ position: 'relative', display: 'inline-flex', width: '100%', margin: 'auto' }}>
                    <LinearProgress
                      variant="determinate"
                      value={0}
                      sx={{ height: 25, width: '100%', borderRadius: '3px' }}
                      color='text'
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >

                    </Box>
                  </Box>
                </Box>
                <LockIcon sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: `${theme.palette.text.secondary}`,
                }} />
              </Button>
            </Grid>
          )))}
      </Grid>
      {
        (user?.level === "Intermediate" || user?.level === "Advanced") &&
        <>
          <Divider />
          <Box>
            <h2 style={{ textAlign: "center" }}>Available Concept Levels</h2>


            {user?.level === "Advanced" &&
              <>
                <Box display="flex" alignItems="center" onClick={handleIntermediateToggle} sx={{ cursor: 'pointer' }}>
                  <Box>
                    <h3>Intermediate</h3>
                  </Box>
                  <IconButton size="small">
                    <ExpandMoreIcon />
                  </IconButton>
                </Box>
                <Collapse in={showIntermediate}>
                  <Box>
                    <IntermediateConcepts user={user} concepts={concepts} />
                  </Box>
                </Collapse>
              </>
            }
            <Box display="flex" alignItems="center" onClick={handleBeginnerToggle} sx={{ cursor: 'pointer' }}>
              <Box>
                <h3>Beginner</h3>
              </Box>
              <IconButton size="small">
                <ExpandMoreIcon />
              </IconButton>
            </Box>
            <Collapse in={showBeginner}>
              <Box>
                <BeginnerConcepts user={user} concepts={concepts} />
              </Box>
            </Collapse>
          </Box>
        </>
      }

    </Container >
  )
}

export default ConceptPage;
