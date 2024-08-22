import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { FormattedMessage } from "react-intl";
import { useHistory } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { login, signUp } from "../../store/session";

const SignUpForm = ({ locale, setLocale }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [level, setLevel] = useState("");
  const dispatch = useDispatch();
  const history = useHistory();

  const handleLanguageChange = (event) => {
    setLocale(event.target.value);
  };

  const handleLevelChange = (event) => {
    const value = event.target.value;
    setLevel(value);
  };

  const handleDemoClick = async (e) => {
    e.preventDefault();

    const credential = "plzwork1232@email.com";
    const password = "password";

    await dispatch(login(credential, password));

  };

  const onSignUp = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        signUp(email, password, username, first_name, last_name, locale, level)
      );
      console.log("Signed up successfully");
      history.push("/home");
    } catch (error) {
      console.log("SIGNUP", email, password, username, first_name, last_name, locale, level);
      console.error("Error signing up:", error.message);
    }
  };

  const defaultMessages = {
    email: "Email",
    password: "Password",
    username: "Username",
    firstName: "First Name",
    lastName: "Last Name",
    signUp: "Sign Up",
    logIn: "Log In",
    createYourAccount: "Create your Account",
    confirmPassword: "Confirm Password",
    nativeLanguage: "Native Language",
    englishProficiency: "English Proficiency Level",
  };

  const getFieldLabel = (id) => {
    const defaultMessage = defaultMessages[id] || id;

    return (
      <Box display="flex" flexDirection="column">
        <Typography sx={{ fontWeight: "bold", px: 1 }}>
          <FormattedMessage id={id} defaultMessage={defaultMessage} />
        </Typography>
        {locale !== "en" && (
          <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
            {defaultMessage}
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <form onSubmit={onSignUp}>
      <Container
        maxWidth="xs"
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          border: "1px solid black",
          p: 2,
          borderRadius: 10,
        }}
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          mb="10px"
        >
          <Typography
            variant="h1"
            m={2}
            sx={{
              // color: "primary.main",
              fontSize: "2rem",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            Create your Account
          </Typography>
        </Box>

        <Box display="flex" flexDirection="row" p={1}>
          <Box display="flex" flexDirection="column">
            {getFieldLabel("firstName")}
            <TextField
              id="outlined-firstName-input"
              type="text"
              autoComplete="given-name"
              onChange={(e) => setFirstName(e.target.value)}
              size="small"
              InputProps={{ sx: { borderRadius: 100 } }}
              required
            />
          </Box>
          <Box display="flex" flexDirection="column">
            {getFieldLabel("lastName")}

            <TextField
              id="outlined-lastName-input"
              type="text"
              autoComplete="family-name"
              onChange={(e) => setLastName(e.target.value)}
              size="small"
              InputProps={{ sx: { borderRadius: 100 } }}
              required
            />
          </Box>
        </Box>

        <Box display="flex" flexDirection="column" p={1}>
          {getFieldLabel("username")}
          <TextField
            id="outlined-username-input"
            type="text"
            autoComplete="username"
            onChange={(e) => setUsername(e.target.value)}
            size="small"
            InputProps={{ sx: { borderRadius: 100 } }}
            required
          />
        </Box>

        <Box display="flex" flexDirection="column" p={1}>
          {getFieldLabel("email")}
          <TextField
            id="outlined-email-input"
            type="email"
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            size="small"
            InputProps={{ sx: { borderRadius: 100 } }}
            required
          />
        </Box>

        <Box display="flex" flexDirection="column" p={1}>
          {getFieldLabel("password")}
          <TextField
            id="outlined-password-input"
            type="password"
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
            size="small"
            InputProps={{ sx: { borderRadius: 100 } }}
            required
          />
        </Box>

        <Box display="flex" flexDirection="column" p={1}>
          {getFieldLabel("confirmPassword")}
          <TextField
            id="outlined-confirm-password-input"
            type="password"
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
            size="small"
            InputProps={{ sx: { borderRadius: 100 } }}
            required
          />
        </Box>

        <Box display="flex" flexDirection="column" p={1}>
          {getFieldLabel("nativeLanguage")}
          <Select
            value={locale}
            onChange={handleLanguageChange}
            sx={{ borderRadius: 10 }}
            size="small"
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="fr">Français</MenuItem>
            <MenuItem value="ko">한국어</MenuItem>
            <MenuItem value="es">Español</MenuItem>
            <MenuItem value="ja">日本語</MenuItem>
            <MenuItem value="vi">Tiếng Việt</MenuItem>
            <MenuItem value="zh">中文</MenuItem>
            <MenuItem value="hi">हिंदी</MenuItem>
          </Select>
        </Box>

        <Box display="flex" flexDirection="column" p={1}>
          <Box display="flex">
            {getFieldLabel("englishProficiency")}
            <Tooltip
              title={
                <Typography>
                  Beginner: Start here if you need to learn basic words, simple
                  sentences, and everyday phrases.
                  {
                    <Typography my={1}>
                      Intermediate: Choose this if you can understand and use
                      common phrases and need to improve grammar and vocabulary.
                    </Typography>
                  }
                  {
                    <Typography>
                      Advanced: Select this if you are comfortable with complex
                      sentences and want to master fluency and Advanced topics.
                    </Typography>
                  }
                </Typography>
              }
              arrow
            >
              <InfoIcon color="divider" />
            </Tooltip>
          </Box>
          <Select
            value={level}
            onChange={handleLevelChange}
            sx={{ borderRadius: 10 }}
            size="small"
          >
            <MenuItem value="Beginner">1: Beginner</MenuItem>
            <MenuItem value="Intermediate">2: Intermediate</MenuItem>
            <MenuItem value="Advanced">3: Advanced</MenuItem>
          </Select>
          <Button
            variant="contained"
            type="submit"
            color="primary"
            sx={{
              borderRadius: 100,
              mt: 2,
              fontWeight: "500",
            }}
          >
            <FormattedMessage id="signUp" defaultMessage="Sign Up" />
          </Button>
          <Button onClick={handleDemoClick} type="submit" sx={{
            borderRadius: 100,
            mt: 1,
          }}>
            Demo
          </Button>
        </Box>
      </Container>
    </form>
  );
};

export default SignUpForm;
