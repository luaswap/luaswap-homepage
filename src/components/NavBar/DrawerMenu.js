import React, { useState } from "react";
import {
  SwipeableDrawer,
  IconButton,
  makeStyles,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Box,
} from "@material-ui/core";
import {
  ViewHeadline as ViewHeadlineIcon,
  Close as CloseIcon,
} from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  root: {
    marginLeft: "auto",
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
  triggerBtn: {
    color: theme.color.text.main,
  },
  menuItem: {
    fontSize: "18px !important",
  },
  subMenuItem: {
    paddingLeft: 30,
  },
}));

const DrawerMenu = () => {
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState("");
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <IconButton onClick={() => setOpen(true)} className={classes.triggerBtn}>
        <ViewHeadlineIcon />
      </IconButton>
      <SwipeableDrawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
      >
        <List>
          <ListItem className={classes.menuItem}>
            <Box display="flex" justifyContent="flex-end" width="100%">
              <IconButton onClick={() => setOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </ListItem>
          <ListItem
            button
            onClick={() => setExpandedId("menu-products")}
            className={classes.menuItem}
          >
            <ListItemText primary="Products" />
          </ListItem>
          <Collapse in={expandedId === "menu-products"} timeout="auto">
            <List component="div" disablePadding>
              <ListItem button className={classes.subMenuItem}>
                <ListItemText
                  primary="App"
                  secondary="Swap tokens and supply liquidity"
                />
              </ListItem>
              <ListItem button className={classes.subMenuItem}>
                <ListItemText
                  primary="Analytics"
                  secondary="Luaswap analytics and historical data"
                />
              </ListItem>
            </List>
          </Collapse>
          <ListItem
            button
            onClick={() => setExpandedId("menu-developers")}
            className={classes.menuItem}
          >
            <ListItemText primary="Developers" />
          </ListItem>
          <Collapse in={expandedId === "menu-developers"} timeout="auto">
            <List component="div" disablePadding>
              <ListItem button className={classes.subMenuItem}>
                <ListItemText primary="Documentation" />
              </ListItem>
              <ListItem button className={classes.subMenuItem}>
                <ListItemText primary="GitHub" />
              </ListItem>
            </List>
          </Collapse>
        </List>
      </SwipeableDrawer>
    </div>
  );
};

export default DrawerMenu;
