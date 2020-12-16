import React, { useState } from "react";
import {
  Grid,
  makeStyles,
  Typography,
  ListItem,
  ListItemText,
  Popover,
  List,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    marginLeft: "auto",
    width: "fit-content",
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  menuBtn: {
    padding: "20px 60px 20px 0px",
    color: theme.color.text.main,
    cursor: "pointer",
    "&:hover": {
      color: theme.color.text.highlighted,
      transform: "translate(3px, 3px)",
      transition: "0.2s ease-out",
    },
  },
  popover: {
    pointerEvents: "none",
  },
}));

const ExtendedMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [subMenuId, setSubMenuId] = useState("");
  const classes = useStyles();

  const handleRedirectToUrl = (url) => {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleOpenPopover = (event, menuId) => {
    setAnchorEl(event.currentTarget);
    setSubMenuId(menuId);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setSubMenuId("");
  };

  return (
    <Grid container alignItems="center" className={classes.root}>
      <Grid
        item
        aria-owns="menu-products"
        aria-haspopup="true"
        onMouseEnter={(evt) => handleOpenPopover(evt, "menu-products")}
        onMouseLeave={handleClosePopover}
        className={classes.menuBtn}
      >
        <Typography>Products</Typography>
      </Grid>
      <Popover
        id="menu-products"
        open={subMenuId === "menu-products"}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        className={classes.popover}
      >
        <List component="nav" aria-label="Products Sub-Menu">
          <ListItem
            button
            aria-label="Products - App"
            onClick={handleRedirectToUrl}
          >
            <ListItemText
              primary="App"
              secondary="Swap tokens and supply liquidity"
            />
          </ListItem>
          <ListItem
            button
            aria-label="Products - Analytics"
            onClick={handleRedirectToUrl}
          >
            <ListItemText
              primary="Analytics"
              secondary="Luaswap analytics and historical data"
            />
          </ListItem>
          <ListItem
            button
            aria-label="Products - Token Lists"
            onClick={handleRedirectToUrl}
          >
            <ListItemText
              primary="Token Lists"
              secondary="A new Ethereum token list standard"
            />
          </ListItem>
          <ListItem
            button
            aria-label="Products - Lua Socks"
            onClick={handleRedirectToUrl}
          >
            <ListItemText
              primary="Lua Socks"
              secondary="Dynamically priced socks"
            />
          </ListItem>
          <ListItem
            button
            aria-label="Products - Luapig"
            onClick={handleRedirectToUrl}
          >
            <ListItemText primary="Luapig" secondary="Optimistic rollup demo" />
          </ListItem>
        </List>
      </Popover>
      <Grid
        item
        aria-owns="menu-governance"
        aria-haspopup="true"
        onMouseEnter={(evt) => handleOpenPopover(evt, "menu-governance")}
        onMouseLeave={handleClosePopover}
        className={classes.menuBtn}
      >
        <Typography>Governance</Typography>
      </Grid>
      <Popover
        id="menu-governance"
        open={subMenuId === "menu-governance"}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        className={classes.popover}
      >
        <List component="nav" aria-label="Governance Sub-Menu">
          <ListItem
            button
            aria-label="Governance - LUA Token"
            onClick={handleRedirectToUrl}
          >
            <ListItemText primary="LUA Token" />
          </ListItem>
        </List>
      </Popover>
      <Grid
        item
        aria-owns="menu-faq"
        aria-haspopup="true"
        onMouseEnter={(evt) => handleOpenPopover(evt, "menu-faq")}
        onMouseLeave={handleClosePopover}
        className={classes.menuBtn}
      >
        <Typography>FAQ</Typography>
      </Grid>
      <Popover
        id="menu-faq"
        open={subMenuId === "menu-faq"}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        className={classes.popover}
      >
        <List component="nav" aria-label="FAQ Sub-Menu">
          <ListItem
            button
            aria-label="FAQ - Documentation"
            onClick={handleRedirectToUrl}
          >
            <ListItemText primary="Documentation" />
          </ListItem>
        </List>
      </Popover>
    </Grid>
  );
};

export default ExtendedMenu;
