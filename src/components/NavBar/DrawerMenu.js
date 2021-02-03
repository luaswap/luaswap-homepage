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
import { MENU } from '../../constant/menu'

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
          {MENU.map((menu) => {
            return (
              <>
                <ListItem
                  button
                  onClick={() => setExpandedId(menu.id)}
                  className={classes.menuItem}
                >
                  <ListItemText primary={menu.label} />
                </ListItem>
                <Collapse in={expandedId === menu.id} timeout="auto">
                  <List component="div" disablePadding>
                    {menu.items &&
                      menu.items.map((item) => {
                        return (
                          <ListItem
                            button
                            className={classes.subMenuItem}
                            onClick={() => redirectToUrl(item.url)}
                          >
                            <ListItemText
                              primary={item.label}
                              secondary={item.subLabel}
                            />
                          </ListItem>
                        )
                      })}
                  </List>
                </Collapse>
              </>
            )
          })}
        </List>
      </SwipeableDrawer>
    </div>
  )
}

export default DrawerMenu
