import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import { useHistory } from "react-router-dom";
import "./Header.css";

const Header = ({ children, hasHiddenAuthButtons }) => {
  const history = useHistory();
  const handleClickLogout = () => {
    localStorage.clear();
    history.push("/")
    window.location.reload();
  }
    
  return (
      
    <Box className="header">
      <Box className="header-title">
        <img src="logo_light.svg" alt="Qkart-icon"></img>
      </Box>
      
      {children}
      {hasHiddenAuthButtons ?
      
        <Button className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={() => { history.push("/") }}>
          back to explore
        </Button> 
    :
        
          localStorage.getItem("token")!==null ?
            <Stack direction="row" spacing={2}>
              <Avatar src="../../public/avatar.png" alt={localStorage.getItem("username")} />
              <div>{localStorage.getItem("username")}</div>
              <Button onClick={handleClickLogout}
                variant="text">LOGOUT</Button>
            </Stack> :
            <Stack direction="row"
              spacing={2}>
              <Button variant="text" onClick={() => { history.push("/login", { from: "Register" }) }}>LOGIN</Button>
              <Button variant="contained" onClick={() => { history.push("/register", { from: "Register" }) }}>REGISTER</Button>
            </Stack>
        
    
      }
    </Box>
  )

};

export default Header;
