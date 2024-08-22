import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import MaterialIcon from "material-icons-react";
import {
  Menu,
  Box,
  Container,
  MenuItem,
  Typography,
} from "@mui/material";
import { styled } from "@mui/styles";
import LogoutButton from "./auth/LogoutButton";
import { useTheme } from '@mui/material/styles';


const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "right",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color:
      theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
    // boxShadow:
    //   "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
    boxShadow: `
      ${theme.palette.mode
        === 'light' ? '0px 2px 4px rgba(0, 0, 0, 0.1)' : 'inset 0 0 0 1px rgba(255, 255, 255, 0.2)'}
    `,
    "& .MuiMenu-list": {
      padding: "10px 0 14px 0",
    },
    "& .MuiMenuItem-root:hover": {
      // target hover state
      backgroundColor: "transparent", // remove background on hover
      cursor: "default",
    },
    "& .MuiMenuItem-root": {
      "& .MuiSvgIcon-root": {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
    },
  },
}));

const NoHoverMenuItem = styled(MenuItem)(({ theme }) => ({
  "&:hover": {
    backgroundColor: "transparent",
    cursor: "default",
  },
}));

const NavBar = () => {
  const theme = useTheme();
  const user = useSelector((state) => state.session.user);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <nav>
      <Container
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "2vw",
        }}
      >
        <NavLink to="/" exact={true} activeClassName="active">
          <img
            src="/logo.png"
            alt="Lingo.ai"
            style={{ width: "200px", height: "auto" }}
          />
        </NavLink>
        <Box
          sx={{
            display: "flex",
            columnGap: "10px",
            alignItems: "center",
            padding: "10px",
            borderRadius: "5px",
            backgroundColor: "#a8716f",
            border: `1.5px solid ${theme.palette.mode === 'light' ? '#160e0e' : '#bababa'}`,
            "&:hover": {
              cursor: "pointer",
            },
          }}
          id="demo-customized-button"
          aria-controls={open ? "demo-customized-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          variant="contained"
          disableelevation="true"
          onClick={handleClick}
        >
          <MaterialIcon icon="menu" size="medium" color="#f4f4f4" />
          <MaterialIcon icon="account_circle" size="medium" color="#f4f4f4" />
        </Box>
        <StyledMenu
          id="demo-customized-menu"
          MenuListProps={{
            "aria-labelledby": "demo-customized-button",
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
        >
          {user ? (
            <Box>
              <NoHoverMenuItem>
                <Typography sx={{ fontWeight: "bold" }}>
                  Hello, {user.username}!
                </Typography>
              </NoHoverMenuItem>
              <MenuItem component={NavLink} to="/">
                <Typography color="primary">Profile</Typography>
              </MenuItem>
              <MenuItem component={NavLink} to="/concepts">
                <Typography color="primary">Concepts</Typography>
              </MenuItem>
              <NoHoverMenuItem>
                <LogoutButton />
              </NoHoverMenuItem>
            </Box>
          ) : (
            <Box>
              <MenuItem component={NavLink} to="/login">
                <Typography color="primary">Log In</Typography>
              </MenuItem>
              <MenuItem component={NavLink} to="/sign-up">
                <Typography color="primary">Sign Up</Typography>
              </MenuItem>
            </Box>
          )}
        </StyledMenu>
      </Container>
    </nav>
  );
};

export default NavBar;
