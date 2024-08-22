import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Box, Button, Container, Grid, LinearProgress, Typography } from '@mui/material'
import { NavLink } from "react-router-dom";
import { fetchUserConcepts } from '../store/concepts';
import { fetchUserProgress } from '../store/users';
import { useTheme } from '@emotion/react';
// import CheckIcon from '@mui/icons-material/Check';
import LockIcon from '@mui/icons-material/Lock';

function IntermediateConcepts({ user, concepts }) {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(true);
    const theme = useTheme();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await dispatch(fetchUserConcepts(user.uid));
            // await dispatch(fetchUserProgress(user.uid))
            setLoading(false);
        };

        fetchData();
    }, [dispatch, user.uid]);

    // const combinedConcepts = concepts.map(concept => {
    //     const progressData = progress?.[0].concepts.find(p => p.id === concept.id);

    //     return {
    //         ...concept,
    //         progress: progressData?.status
    //     };
    // });

    // console.log("concepts", combinedConcepts);
    // const sortedConcepts = combinedConcepts.sort((a, b) => b.concept_name.localeCompare(a.concept_name));

    const currentConcepts = concepts?.filter(concept =>
        concept.level === "Intermediate"
    ).sort((a, b) => b.concept_name.localeCompare(a.concept_name));

    let conceptCount = 0;

    currentConcepts?.map(concept => {
        if (concept.status === true) conceptCount++
        return conceptCount
    })

    let conceptPercentage = (conceptCount / currentConcepts?.length) * 100

    if (loading) {
        return <LinearProgress />;
    }

    return (
        <Container>
            <Box>
                <Box display='flex' flexDirection='column' alignItems='center'>
                    {conceptPercentage === 100 ? (
                        <p>Congratulations! You've earned the Lingo.ai Intermediate Champion Badge.</p>
                    ) : (<p>Pass all the concepts to get your Lingo.ai Intermediate Champion Badge.</p>)
                    }
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
                    )
                ))}
            </Grid>
        </Container >
    )
}

export default IntermediateConcepts
