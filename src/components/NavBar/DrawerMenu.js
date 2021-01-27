import React, { useState } from 'react'
import {
  SwipeableDrawer,
  IconButton,
  makeStyles,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Box,
} from '@material-ui/core'
import {
  ViewHeadline as ViewHeadlineIcon,
  Close as CloseIcon,
} from '@material-ui/icons'
import { redirectToUrl } from '../../utils'

const useStyles = makeStyles((theme) => ({
  root: {
    marginLeft: 'auto',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  triggerBtn: {
    color: theme.color.text.main,
  },
  menuItem: {
    fontSize: '18px !important',
  },
  subMenuItem: {
    paddingLeft: 30,
  },
}))

const DrawerMenu = () => {
  const [open, setOpen] = useState(false)
  const [expandedId, setExpandedId] = useState('')
  const classes = useStyles()

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
            onClick={() => setExpandedId('menu-products')}
            className={classes.menuItem}
          >
            <ListItemText primary="Products" />
          </ListItem>
          <Collapse in={expandedId === 'menu-products'} timeout="auto">
            <List component="div" disablePadding>
              <ListItem
                button
                className={classes.subMenuItem}
                onClick={() => redirectToUrl('https://app.luaswap.org/#/swap')}
              >
                <ListItemText
                  primary="App"
                  secondary="Swap LUA to other tokens"
                />
              </ListItem>
              <ListItem
                button
                className={classes.subMenuItem}
                onClick={() => redirectToUrl('https://app.luaswap.org/#/pool')}
              >
                <ListItemText
                  primary="Pool"
                  secondary="Deposit into liquidity pool to get rewards"
                />
              </ListItem>
              <ListItem
                button
                className={classes.subMenuItem}
                onClick={() =>
                  redirectToUrl('https://app.luaswap.org/#/farming')
                }
              >
                <ListItemText
                  primary="Farming"
                  secondary="Stake to variety of pool & earn LUA"
                />
              </ListItem>
              <ListItem
                button
                className={classes.subMenuItem}
                onClick={() =>
                  redirectToUrl('https://app.luaswap.org/#/lua-safe')
                }
              >
                <ListItemText
                  primary="LuaSafe"
                  secondary="Stake LUA to get xLUA & swap to other tokens"
                />
              </ListItem>
            </List>
          </Collapse>
          <ListItem
            button
            onClick={() => setExpandedId('menu-governance')}
            className={classes.menuItem}
          >
            <ListItemText primary="Governance" />
          </ListItem>
          <Collapse in={expandedId === 'menu-governance'} timeout="auto">
            <List component="div" disablePadding>
              <ListItem
                button
                className={classes.subMenuItem}
                onClick={() =>
                  redirectToUrl('https://snapshot.luaswap.org/#/luaswap')
                }
              >
                <ListItemText primary="LUA" />
              </ListItem>
              <ListItem
                button
                className={classes.subMenuItem}
                onClick={() =>
                  redirectToUrl('https://snapshot.luaswap.org/#/xlua')
                }
              >
                <ListItemText primary="xLUA" />
              </ListItem>
            </List>
          </Collapse>
          <ListItem
            button
            onClick={() => setExpandedId('menu-faq')}
            className={classes.menuItem}
          >
            <ListItemText primary="FAQ" />
          </ListItem>
          <Collapse in={expandedId === 'menu-faq'} timeout="auto">
            <List component="div" disablePadding>
              <ListItem button className={classes.subMenuItem}>
                <ListItemText primary="Documentation" />
              </ListItem>
            </List>
          </Collapse>
        </List>
      </SwipeableDrawer>
    </div>
  )
}

export default DrawerMenu
