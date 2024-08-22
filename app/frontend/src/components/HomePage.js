import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Container,
  Grid,
  LinearProgress,
  Link,
  Typography,
  Tooltip,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { fetchUserProgress } from "../store/users";
import { useTheme } from "@mui/material/styles";

function HomePage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.session.user);
  const progressState = useSelector((state) => state.users.progress);
  const progress = progressState && Object.values(progressState);
  const theme = useTheme();

  useEffect(() => {
    if (user.uid) dispatch(fetchUserProgress(user.uid));
  }, [dispatch, user.uid]);

  let proficiencyCount = 0;

  if (user?.badges?.length === 1) proficiencyCount = 1;
  if (user?.badges?.length === 2) proficiencyCount = 2;
  if (user?.badges?.length === 3) proficiencyCount = 3;

  let proficiencyPercentage = (proficiencyCount / 3) * 100;

  const currentConcepts = progress?.[0].concepts.filter(
    (concept) => concept.level === user.level
  );

  let conceptCount = 0;

  currentConcepts?.map((concept) => {
    if (concept.status === true) conceptCount++;
    return conceptCount;
  });

  let conceptPercentage = (conceptCount / currentConcepts?.length) * 100;

  const data = [
    {
      left: "Current English Proficiency Level",
      right: `${user.level}`,
    },
    {
      left: (
        <>
          <Box display="flex" alignItems="center">
            Proficiency Level Progress
            <Tooltip
              title={
                <Typography>
                  Unlock the next proficiency level by completing concepts for
                  the current level.
                </Typography>
              }
              arrow
            >
              <InfoIcon color="action" sx={{ mt: -1, fontSize: 16 }} />
            </Tooltip>
            :
          </Box>
        </>
      ),
      right: (
        // <LinearProgress
        //   variant="determinate"
        //   value={proficiencyPercentage}
        //   sx={{ height: 25 }}
        // />
        <Box
          sx={{ position: "relative", display: "inline-flex", width: "100%" }}
        >
          <LinearProgress
            variant="determinate"
            value={proficiencyPercentage}
            sx={{ height: 25, width: "100%", borderRadius: "3px" }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              fontSize="small"
              fontWeight="bold"
              color="textSecondary"
            >{`${Math.round(proficiencyPercentage)}%`}</Typography>
          </Box>
        </Box>
      ),
    },
    // {
    //   left: 'Current Concept:',
    //   right: `${user.current_level} - Basic Nouns`
    // },
    {
      left: (
        <>
          <Box display="flex" alignItems="center">
            Concept Progress
            <Tooltip
              title={
                <Typography>
                  Progress toward mastering your concepts for the current level
                  by completing all the topics.
                </Typography>
              }
              arrow
            >
              <InfoIcon color="action" sx={{ mt: -1, fontSize: 16 }} />
            </Tooltip>
            :
          </Box>
        </>
      ),
      right: (
        <Box
          sx={{ position: "relative", display: "inline-flex", width: "100%" }}
        >
          <LinearProgress
            variant="determinate"
            value={conceptPercentage}
            sx={{ height: 25, width: "100%", borderRadius: "3px" }}
            color="secondary"
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              fontSize="small"
              fontWeight="bold"
              color="textSecondary"
            >
              {" "}
              {isNaN(conceptPercentage)
                ? "0%"
                : `${Math.round(conceptPercentage)}%`}
            </Typography>
          </Box>
        </Box>
      ),
      // <LinearProgress
      //   variant="determinate"
      //   value={conceptPercentage}
      //   sx={{ height: 25 }}
      //   color='secondary'
      // />
    },
    // {
    //   left: 'Topics Progress:',
    //   right: <LinearProgress
    //     variant="determinate"
    //     value={50}
    //     sx={{ height: 25 }}
    //   />
    // },
    {
      left: (
        <>
          <Box display="flex" alignItems="center">
            Badges
            <Tooltip
              title={
                <Typography>
                  Earn a Lingo.ai Champion Badge for each level you complete.
                </Typography>
              }
              arrow
            >
              <InfoIcon color="action" sx={{ mt: -1, fontSize: 16 }} />
            </Tooltip>
            :
          </Box>
        </>
      ),
      right: (
        <>
          {!user.badges && <span>No badges yet!</span>}

          <Box
            sx={{
              display: "flex",
              columnGap: "20px",
            }}
          >
            {user.badges?.includes("Bronze") && (
              <img
                src="/assets/badges/beginner-badge.png"
                alt="Lingo.ai Beginner Champion Badge"
                style={{
                  width: "25%",
                  borderRadius: "3.5px",
                  boxShadow: `0 0 2.5px ${theme.palette.mode === "light" ? "#160e0e" : "#f1e9e9"
                    }`,
                }}
              />
            )}

            {user.badges?.includes("Silver") && (
              <img
                src="/assets/badges/intermediate-badge.png"
                alt="Lingo.ai Intermediate Champion Badge"
                style={{
                  width: "25%",
                  borderRadius: "3.5px",
                  boxShadow: `0 0 2.5px ${theme.palette.mode === "light" ? "#160e0e" : "#f1e9e9"
                    }`,
                }}
              />
            )}

            {user.badges?.includes("Gold") && (
              <img
                src="/assets/badges/advanced-badge.png"
                alt="Lingo.ai Advanced Champion Badge"
                style={{
                  width: "25%",
                  borderRadius: "3.5px",
                  boxShadow: `0 0 2.5px ${theme.palette.mode === "light" ? "#160e0e" : "#f1e9e9"
                    }`,
                }}
              />
            )}
          </Box>
        </>
      ),
    },
  ];

  // if (user.level === 'Advanced') {
  //   data.splice(5, 0, {
  //     left: (
  //       <>
  //         <Box display="flex" alignItems="center">
  //           Supplementary Learning
  //           <Tooltip
  //             title={
  //               <Typography>
  //                 Available level(s) to reinforce your knowledge. Completing these will earn you the corresponding badges, if you haven't already.
  //               </Typography>
  //             }
  //             arrow
  //           >
  //             <InfoIcon color="action" sx={{ mt: -1, fontSize: 16 }} />
  //           </Tooltip>:
  //         </Box>
  //       </>
  //     ),
  //     right: 'Beginner • Intermediate'
  //   });
  // }

  return (
    <Container>
      <Box>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <h1>Welcome, {user.username}!</h1>
          <Link href="/concepts">
            <Button
              variant="contained"
              color="primary"
              sx={{
                borderRadius: "3px",
                border: `1.5px solid ${theme.palette.mode === "light" ? "#160e0e" : "#f1e9e9"
                  }`,
              }}
            >
              Start Learning Now
            </Button>
          </Link>
          <h2 style={{ padding: "16px 0px" }}>Your Latest Lingo.ai Progress</h2>
        </Box>
        {user.badges?.length === 3 && (
          <Box
            sx={{
              display: "grid",
              justifyContent: "center",
              justifyItems: "center",
              padding: "0px 0px 20px 0px",
              backgroundColor: `${theme.palette.secondary.main}`,
              borderRadius: "5px",
              width: "100%",
            }}
          >
            <h3> Congratulations! You're the ultimate Lingo.ai champ.</h3>
            <span>
              The Lingo.ai team is working on adding more content. Stay tuned!
            </span>
          </Box>
        )}
        <Grid
          container
          rowSpacing={4}
          sx={{ display: "flex", justifyContent: "center", paddingTop: "20px" }}
        >
          {data.map((row, index) => (
            <React.Fragment key={index}>
              <Grid item xs={4}>
                <Typography fontWeight="bold">{row.left}</Typography>
              </Grid>
              <Grid item xs={6}>
                {row.right}
              </Grid>
            </React.Fragment>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}

export default HomePage;
