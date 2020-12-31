import React from "react";
import { AppBar, Avatar, makeStyles } from "@material-ui/core";
import logoSrc from "../../assets/images/logo.png";
import ExtendedMenu from "./ExtendedMenu";
import DrawerMenu from "./DrawerMenu";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    height: 70,
    backgroundColor: theme.color.background.light,
    [theme.breakpoints.down("sm")]: {
      paddingLeft: 20,
      paddingRight: 20,
    },
    [theme.breakpoints.up("md")]: {
      paddingLeft: 80,
      paddingRight: 80,
    },
    [theme.breakpoints.up("lg")]: {
      paddingLeft: 135,
      paddingRight: 135,
    },
  },
  logoIcon: {
    cursor: "pointer",
  },
}));

const NavBar = () => {
  const classes = useStyles();

  return (
    <AppBar position="static" className={classes.root}>
      <img alt="LuaSwap" src={logoSrc} className={classes.logoIcon} />
      <ExtendedMenu />
      <DrawerMenu />
    </AppBar>
  );
};

export default NavBar;
