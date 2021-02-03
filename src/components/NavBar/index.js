import React from 'react'
import { AppBar, makeStyles, Box } from '@material-ui/core'
import logoSrc from '../../assets/images/logo.png'
import ExtendedMenu from './ExtendedMenu'
import DrawerMenu from './DrawerMenu'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: 70,
    backgroundColor: theme.color.background.light,
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 20,
      paddingRight: 20,
    },
    [theme.breakpoints.up('md')]: {
      paddingLeft: 80,
      paddingRight: 80,
    },
    [theme.breakpoints.up('lg')]: {
      paddingLeft: 135,
      paddingRight: 135,
    },
  },
  logoIcon: {
    width: 40,
    height: 'auto',
    cursor: 'pointer',
  },
  logoText: {
    marginLeft: 10,
    fontSize: 20,
    fontWeight: 'bold',
  },
}))

const NavBar = () => {
  const classes = useStyles()

  return (
    <AppBar position="static" className={classes.root}>
      <Box display="flex" alignItems="center">
        <img alt="LuaSwap" src={logoSrc} className={classes.logoIcon} />
        <span className={classes.logoText}>{'LuaSwap'}</span>
      </Box>
      <ExtendedMenu />
      <DrawerMenu />
    </AppBar>
  )
}

export default NavBar
