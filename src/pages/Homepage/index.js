import React, { useState, useEffect } from 'react'
import { Box, Typography, makeStyles, Button, Link } from '@material-ui/core'
import { Helmet } from 'react-helmet'
import * as Service from '../../services'
import liquidityIcon from '../../assets/images/liquidity.png'
import volumeIcon from '../../assets/images/volume.png'
import starterIcon from '../../assets/images/starter.jpg'
import eventIcon from '../../assets/images/event-btn.png'
import avtNotiIcon from '../../assets/images/avt-noti.png'
import { reduceLongNumber, redirectToUrl } from '../../utils'
import '../../'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'flex-start',
    // minHeight: '100vh',
    color: theme.color.text.main,
    fontFamily: '"Nunito Sans", sans-serif !important',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      margin: '20px 20px 100px 20px',
    },
    [theme.breakpoints.up('md')]: {
      margin: '100px 80px 0px 80px',
    },
    [theme.breakpoints.up('lg')]: {
      margin: '85px 135px 0px 135px',
    },
  },
  titleContainer: {
    marginBottom: 65,
  },
  introText: {
    fontSize: 40,
    fontWeight: 800,
    [theme.breakpoints.down('sm')]: {
      fontSize: 32,
    },
  },
  statContainer: {
    flexWrap: 'wrap',
    marginBottom: 100,
    gap: 95,
    [theme.breakpoints.down('sm')]: {
      marginBottom: 65,
    },
    [theme.breakpoints.down('md')]: {
      gap: 75,
    },
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  statIcon: {
    width: 40,
    height: 40,
    marginBottom: 20,
  },
  statLabel: {
    marginBottom: 5,
    color: theme.color.text.main,
    fontSize: 20,
    fontWeight: 600,
  },
  statValue: {
    color: theme.color.text.highlighted,
    fontSize: 28,
    fontWeight: 700,
  },
  launchBtn: {
    padding: '14px 20px',
    width: 230,
    height: 48,
    borderRadius: 8,
    backgroundColor: theme.color.primary.main,
    color: theme.color.text.dark,
    fontSize: 18,
    fontWeight: 800,
    textTransform: 'none',
    '&:hover': {
      backgroundColor: theme.color.primary.dark,
    },
    [theme.breakpoints.down('sm')]: {
      margin: 20,
      width: 'calc(100vw - 40px)',
    },
  },
  homepageImg: {
    width: '100%',
    height: 'auto',
    [theme.breakpoints.up('md')]: {
      width: 400,
      maxWidth: '50%',
    },
    [theme.breakpoints.up('lg')]: {
      width: 500,
    },
  },
  highlightedText: {
    color: theme.color.text.primary1,
    fontSize: 'inherit',
    fontWeight: 800,
  },
  mobileLaunchContainer: {
    display: 'inline',
    [theme.breakpoints.down('sm')]: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.color.background.light,
    },
  },
  socialLink: {
    color: theme.color.text.main,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    '&:not(:first-child)': {
      marginLeft: 50,
    },
    [theme.breakpoints.down('sm')]: {
      '&:not(:first-child)': {
        marginLeft: 0,
      },
    },
  },

  eventBtn: {
    textAlign: 'center',
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    transition: 'all 0.5s ease-in-out',
    '&:hover': {
      transform: 'scale(1.1)',
      transition: 'all 0.5s ease-in-out'
    },

    [theme.breakpoints.down('sm')]: {
      bottom: '120px',
    }
  }
}))

const Homepage = () => {
  const [totalLiquidity, setTotalLiquidity] = useState(0)
  const [volume, setVolume] = useState(0)
  const [showNoti, setShowNoti] = useState(true)
  const classes = useStyles()

  useEffect(() => {
    Service.getTotalLiquidityData().then((data) => {
      setTotalLiquidity(data.totalLiquidity)
    })
    Service.get24hVolumeChange().then((data) => {
      setVolume(data.value)
    })
  }, [])

  return (
    <Box display="flex" flexDirection="column" minHeight="calc(100vh - 70px)" style={{ position: 'relative', }}>
      {/* <div className={classes.eventBtn}>
        <a target="__blank" href="http://luaturns2.luaswap.org/">
          <img src={eventIcon} style={{
            width: 200,
            borderRadius: 5,
          }} />
        </a>
      </div> */}
      <Helmet>
        <title>{'Welcome to LuaSwap'}</title>
      </Helmet>
      {/* <div style={{ textAlign: 'center' }}>
        <a target="__blank" href="https://luaturns2.luaswap.org/">
          <img src={starterIcon} style={{
            marginTop: 20,
            width: 800,
            maxWidth: '90%',
            borderRadius: 10
          }} />
        </a>

      </div> */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        className={classes.root}
      >
        <Box mr={[0, 4, 5]}>
          <Box className={classes.titleContainer}>
            <Typography component="div" className={classes.introText}>
              {'Multi-chain liquidity and exchange protocol'}
            </Typography>
          </Box>
          <Box
            display="flex"
            alignItems="flex-start"
            className={classes.statContainer}
          >
            <Box className={classes.statItem}>
              <img
                alt="Total Liquidity"
                src={liquidityIcon}
                className={classes.statIcon}
              />
              <Typography component="div" className={classes.statLabel}>
                {'Total Liquidity'}
              </Typography>
              <Typography component="div" className={classes.statValue}>
                {`${reduceLongNumber(totalLiquidity)} USD`}
              </Typography>
            </Box>
            <Box className={classes.statItem}>
              <img
                alt="24h Volume"
                src={volumeIcon}
                className={classes.statIcon}
              />
              <Typography component="div" className={classes.statLabel}>
                {'24h Volume'}
              </Typography>
              <Typography component="div" className={classes.statValue}>
                {`${reduceLongNumber(volume)} USD`}
              </Typography>
            </Box>
          </Box>
          <Box className={classes.mobileLaunchContainer}>
            <Button
              variant="contained"
              className={classes.launchBtn}
              onClick={() => redirectToUrl('https://app.luaswap.org/')}
            >
              {'Launch App'}
            </Button>
          </Box>
        </Box>
        <img
          alt="Homepage"
          src="https://raw.githubusercontent.com/tomochain/luaswap-homepage/gh-pages/static/media/homepage.1a9b09bf.png"
          className={classes.homepageImg}
        />
      </Box>
      <Box
        display="flex"
        justifyContent={['space-around', 'center']}
        mt="auto"
        mb={[13, 3]}
      >
        <Link
          onClick={() =>
            redirectToUrl('https://github.com/tomochain/luaswap-core')
          }
          className={classes.socialLink}
        >
          {'GitHub'}
        </Link>
        <Link
          onClick={() => redirectToUrl('https://twitter.com/luaswap')}
          className={classes.socialLink}
        >
          {'Twitter'}
        </Link>
        <Link
          onClick={() => redirectToUrl('https://t.me/luaswap')}
          className={classes.socialLink}
        >
          {'Telegram'}
        </Link>
        <Link
          onClick={() => redirectToUrl('https://medium.com/luaswap')}
          className={classes.socialLink}
        >
          {'Medium'}
        </Link>
      </Box>
      {
        showNoti && <Box style={{
          width: '300px',
          height: '80px',
          background: 'white',
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          borderRadius: '10px',
          padding: '15px',
          display: 'flex',
          zIndex: 10
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingRight: '15px',
          }}>
            <img
              alt="Noti"
              src={avtNotiIcon}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '4px'
              }}
            />
          </div>
          <div>
            <div style={{
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              Debonair Cat NFTs
            </div>

            <div style={{
              fontSize: '13px'
            }}>
              Debonair Cat NFTs will be claimable on <a style={{textDecoration: 'none', color: '#1ca9d9', fontWeight: 'bold'}} href='https://tezuka.io/' target='__blank'>Tezuka</a> for all <a style={{textDecoration: 'none', color: '#1ca9d9', fontWeight: 'bold'}} href='https://docs.google.com/spreadsheets/u/3/d/1FHW8VUrLln6Xbk27CQ5kNeEslVMEpPcEaMCNKxJu_N0/edit?usp=sharing' target='__blank'>whitelisted winners</a> and <a style={{textDecoration: 'none', color: '#1ca9d9', fontWeight: 'bold'}} href='https://docs.google.com/spreadsheets/d/183x1nfiWeCdxF_D75yuuLxDd8qLMMZQeeY76h9SISx4/edit#gid=0' target='__blank'>eligible LUA stakers</a>. Hurry up!
            </div>
          </div>
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '20px',
            height: '20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '18px',
            cursor: 'pointer'
          }} onClick={() => setShowNoti(false)}>x</div>
        </Box>
      }

    </Box>
  )
}

export default Homepage
