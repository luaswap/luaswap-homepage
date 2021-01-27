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
      // transform: 'translate(3px, 3px)',
      // transition: '0.2s ease-out',
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
      <Grid
        item
        aria-owns="menu-products"
        aria-haspopup="true"
        onClick={(evt) => handleOpenPopover(evt, 'menu-products')}
        className={classes.menuBtn}
      >
        <Typography style={{ marginRight: 10 }}>Products</Typography>
        <ArrowDropDownIcon />
      </Grid>
      <Menu
        id="menu-products"
        open={subMenuId === 'menu-products'}
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
        <MenuItem
          aria-label="Products - App"
          onClick={() => redirectToUrl('https://app.luaswap.org/#/swap')}
        >
          <ListItemText primary="App" secondary="Swap LUA to other tokens" />
        </MenuItem>
        <MenuItem
          aria-label="Products - Pool"
          onClick={() => redirectToUrl('https://app.luaswap.org/#/pool')}
        >
          <ListItemText
            primary="Pool"
            secondary="Deposit into liquidity pool to get rewards"
          />
        </MenuItem>
        <MenuItem
          aria-label="Products - Farming"
          onClick={() => redirectToUrl('https://app.luaswap.org/#/farming')}
        >
          <ListItemText
            primary="Farming"
            secondary="Stake to variety of pool & earn LUA"
          />
        </MenuItem>
        <MenuItem
          aria-label="Products - Lua Safe"
          onClick={() => redirectToUrl('https://app.luaswap.org/#/lua-safe')}
        >
          <ListItemText
            primary="LuaSafe"
            secondary="Stake LUA to get xLUA & swap to other tokens"
          />
        </MenuItem>
      </Menu>
      <Grid
        item
        aria-owns="menu-governance"
        aria-haspopup="true"
        onClick={(evt) => handleOpenPopover(evt, 'menu-governance')}
        className={classes.menuBtn}
      >
        <Typography style={{ marginRight: 10 }}>Governance</Typography>
        <ArrowDropDownIcon />
      </Grid>
      <Menu
        id="menu-governance"
        open={subMenuId === 'menu-governance'}
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
        <MenuItem
          aria-label="Governance - LUA"
          onClick={() =>
            redirectToUrl('https://snapshot.luaswap.org/#/luaswap')
          }
        >
          <ListItemText primary="LUA" />
        </MenuItem>
        <MenuItem
          aria-label="Governance - xLUA"
          onClick={() => redirectToUrl('https://snapshot.luaswap.org/#/xlua')}
        >
          <ListItemText primary="xLUA" />
        </MenuItem>
      </Menu>
      <Grid
        item
        aria-owns="menu-faq"
        aria-haspopup="true"
        onClick={(evt) => handleOpenPopover(evt, 'menu-faq')}
        className={classes.menuBtn}
      >
        <Typography style={{ marginRight: 10 }}>FAQ</Typography>
        <ArrowDropDownIcon />
      </Grid>
      <Menu
        id="menu-faq"
        open={subMenuId === 'menu-faq'}
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
        <MenuItem aria-label="FAQ - Documentation" onClick={redirectToUrl}>
          <ListItemText primary="Documentation" />
        </MenuItem>
      </Menu>
    </Grid>
  )
}

export default ExtendedMenu
