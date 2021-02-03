import React, { useState } from 'react'
import {
  Grid,
  makeStyles,
  Typography,
  ListItemText,
  Menu,
  MenuItem,
} from '@material-ui/core'
import { redirectToUrl } from '../../utils'
import { ArrowDropDown as ArrowDropDownIcon } from '@material-ui/icons'
import { MENU } from '../../constant/menu'

const useStyles = makeStyles((theme) => ({
  root: {
    marginLeft: 'auto',
    width: 'fit-content',
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  menuBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px 60px 20px 0px',
    color: theme.color.text.main,
    cursor: 'pointer',
    '&:hover': {
      color: theme.color.text.highlighted,
    },
  },
}))

const ExtendedMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [subMenuId, setSubMenuId] = useState('')
  const classes = useStyles()

  const handleOpenPopover = (event, menuId) => {
    console.log('handleOpenPopover', menuId)
    setAnchorEl(event.currentTarget)
    setSubMenuId(menuId)
  }

  const handleClosePopover = () => {
    setAnchorEl(null)
    setSubMenuId('')
  }

  return (
    <Grid container alignItems="center" className={classes.root}>
      {MENU.map((menu) => {
        return (
          <>
            <Grid
              item
              aria-owns={menu.id}
              aria-haspopup="true"
              onClick={(evt) => handleOpenPopover(evt, menu.id)}
              className={classes.menuBtn}
            >
              <Typography style={{ marginRight: 10 }}>{menu.label}</Typography>
              {menu.items && menu.items.length > 0 && <ArrowDropDownIcon />}
            </Grid>
            <Menu
              id={menu.id}
              open={subMenuId === menu.id}
              anchorEl={anchorEl}
              getContentAnchorEl={null}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              onClose={handleClosePopover}
              className={classes.popover}
            >
              {menu.items &&
                menu.items.map((item) => {
                  return (
                    <MenuItem
                      aria-label={item.ariaLabel}
                      onClick={() => redirectToUrl(item.url)}
                    >
                      <ListItemText
                        primary={item.label}
                        secondary={item.subLabel}
                      />
                    </MenuItem>
                  )
                })}
            </Menu>
          </>
        )
      })}
    </Grid>
  )
}

export default ExtendedMenu
