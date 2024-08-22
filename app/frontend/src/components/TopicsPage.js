import {
  Box,
  Button,
  Container,
  Grid,
  LinearProgress, Typography
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { fetchUserProgress } from '../store/users';
import { useTheme } from "@emotion/react";
import CheckIcon from '@mui/icons-material/Check';
import { fetchTopicsThroughProgress } from "../store/topics";
import { fetchUserConcepts } from "../store/concepts";

function TopicsPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.session.user)
  const userId = user.uid;
  const { conceptId } = useParams();
  const [loading, setLoading] = useState(true);
  const topics = useSelector((state) => state.topics);
  const progressState = useSelector((state) => state.users.progress);
  const progress = progressState && Object.values(progressState)
  const concepts = Object.values(useSelector((state) => state.concepts));

  const theme = useTheme()

  const currentConcept = progress?.[0]?.concepts?.find(concept =>
    conceptId === concept.id
  );

  console.log("CC", currentConcept);

  const currConcept = concepts.find(concept => conceptId === concept.id);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // await dispatch(fetchOneConcept(conceptId));
      // await dispatch(fetchTopicsByConcept(conceptId));
      await dispatch(fetchUserProgress(userId))
      await dispatch(fetchTopicsThroughProgress(userId))
      await dispatch(fetchUserConcepts(userId))

      setLoading(false);
    };

    fetchData();
  }, [dispatch, userId]);

  const combinedTopics = currentConcept?.topics?.map(topic => {
    const progressData = currConcept?.topics?.find(p => topic.id === p.id)
    return {
      ...topic,
      topic_name: progressData?.topic_name,
      description: progressData?.description
    }
  })

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Container>
      <Box>
        <Box display="flex" flexDirection="column" alignItems="center">
          <h1>Select a {currentConcept?.concept_name} Topic</h1>
          <p>
            Select any topic to begin. In order to pass a topic, you must score
            at least 80% three times.
          </p>
          {currentConcept?.status === true ? (<p>Congratulations! You've completed this concept.</p>) : (<p>Pass all the topics to unlock the next concept.</p>)}
        </Box>
        {/* <Box px={50}>
          <LinearProgress
            variant="determinate"
            value={currentConcept?.topics_passed_fraction * 100}
            sx={{ height: 25 }}
          />
        </Box> */}
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
              value={currentConcept?.topicsPassed * 100}
              sx={{ height: 25, width: '100%', borderRadius: '3px' }}
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
              <Typography fontSize="small" fontWeight="bold" color="textSecondary">{`${Math.round(currentConcept?.topicsPassed * 100)}%`}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={10} justifyContent='center' py={5}>
        {combinedTopics?.map(topic => (
          <Grid item key={topic.id}>
            <Button component={NavLink}
              to={`/concepts/${conceptId}/topics/${topic.id}/decks`}
              sx={{
                backgroundColor: `${theme.palette.primary.main}`,
                color: `${theme.palette.text.main}`,
              }}>
              <Box display='flex' flexDirection='column'
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignContent: "center",
                  padding: "0px 20px",
                  width: "400px",
                  height: "200px"
                }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    alignSelf: "start",
                    height: "80px"
                  }}>
                  <h3>{topic.topic_name}</h3>
                  {/* {topic.passes === 3 && <CheckIcon sx={{
                    ml: 1,
                    color: `${theme.palette.completion.good}`,
                  }} />} */}
                </Box>
                <Box
                  sx={{
                    height: "50px"
                  }}>
                  {topic.description ? (<p>{topic.description}</p>) : (<p>&nbsp;</p>)}
                </Box>
                <Box sx={{ position: 'relative', display: 'inline-flex', width: '100%', margin: 'auto' }}>
                  <LinearProgress
                    variant="determinate"
                    value={(topic.passes / 3) * 100}
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
                    <Typography fontSize="small" fontWeight="bold" color="textSecondary">{`${Math.round((topic.passes / 3) * 100)}%`}</Typography>
                  </Box>
                </Box>
              </Box>
            </Button>
          </Grid>
        ))}
      </Grid>

    </Container>
  );
}

export default TopicsPage;
