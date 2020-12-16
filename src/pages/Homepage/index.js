import React, { useState, useEffect } from "react";
import { Box, Typography, makeStyles, Button } from "@material-ui/core";
import { Helmet } from "react-helmet";
import * as Service from "../../services";
import homepageImg from "../../assets/images/homepage.png";
import liquidityIcon from "../../assets/images/liquidity.png";
import volumeIcon from "../../assets/images/volume.png";
import transactionIcon from "../../assets/images/transaction.png";
import { reduceFractionDigit, reduceLongNumber } from "../../utils";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "flex-start",
    color: theme.color.text.main,
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      margin: "20px 20px 100px 20px",
    },
    [theme.breakpoints.up("md")]: {
      margin: "100px 80px 0px 80px",
    },
    [theme.breakpoints.up("lg")]: {
      margin: "155px 135px 0px 135px",
    },
  },
  titleContainer: {
    marginBottom: 65,
  },
  introText: {
    fontSize: 40,
    fontWeight: 800,
    [theme.breakpoints.down("sm")]: {
      fontSize: 32,
    },
  },
  statContainer: {
    flexWrap: "wrap",
    marginBottom: 100,
    gap: 95,
    [theme.breakpoints.down("sm")]: {
      marginBottom: 65,
    },
    [theme.breakpoints.down("md")]: {
      gap: 75,
    },
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  statIcon: {
    width: 40,
    height: 40,
    marginBottom: 20,
  },
  statLabel: {
    marginBottom: 5,
    color: theme.color.text.main,
    fontSize: 16,
    fontWeight: 600,
  },
  statValue: {
    color: theme.color.text.highlighted,
    fontSize: 24,
    fontWeight: 700,
  },
  launchBtn: {
    padding: "14px 20px",
    width: 230,
    height: 48,
    borderRadius: 8,
    backgroundColor: theme.color.primary.main,
    color: theme.color.text.dark,
    fontSize: 16,
    fontWeight: 800,
    textTransform: "none",
    "&:hover": {
      backgroundColor: theme.color.primary.dark,
    },
    [theme.breakpoints.down("sm")]: {
      margin: 20,
      width: "calc(100vw - 40px)",
    },
  },
  homepageImg: {
    width: "100%",
    height: "auto",
    [theme.breakpoints.up("md")]: {
      width: 400,
      maxWidth: "50%",
    },
    [theme.breakpoints.up("lg")]: {
      width: 500,
    },
  },
  highlightedText: {
    color: theme.color.text.primary1,
    fontSize: "inherit",
    fontWeight: 800,
  },
  mobileLaunchContainer: {
    display: "inline",
    [theme.breakpoints.down("sm")]: {
      position: "fixed",
      bottom: 0,
      left: 0,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.color.background.light,
    },
  },
}));

const Homepage = () => {
  const [totalLiquidity, setTotalLiquidity] = useState(0);
  const [volume, setVolume] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);
  const classes = useStyles();

  useEffect(() => {
    Service.getTotalLiquidityData().then((data) => {
      setTotalLiquidity(data.totalLiquidity);
      setVolume(data.volume);
    });
    Service.getTotalSupply().then((value) => {
      setTotalSupply(value);
    });
  }, []);

  return (
    <>
      <Helmet>
        <title>{"Welcome to LuaSwap"}</title>
      </Helmet>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        className={classes.root}
      >
        <Box mr={[0, 4, 5]}>
          <Box className={classes.titleContainer}>
            <Typography component="div" className={classes.introText}>
              {"Multi-chain liquidity protocol for "}
              <Typography component="div" className={classes.highlightedText}>
                {"emerging token projects"}
              </Typography>
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
                {"Total Liquidity"}
              </Typography>
              <Typography component="div" className={classes.statValue}>
                {`${reduceLongNumber(totalLiquidity)} USD`}
              </Typography>
            </Box>
            <Box className={classes.statItem}>
              <img
                alt="Volume 24h"
                src={volumeIcon}
                className={classes.statIcon}
              />
              <Typography component="div" className={classes.statLabel}>
                {"Volume 24h"}
              </Typography>
              <Typography component="div" className={classes.statValue}>
                {`${reduceLongNumber(volume)} USD`}
              </Typography>
            </Box>
            <Box className={classes.statItem}>
              <img
                alt="Total Transactions"
                src={transactionIcon}
                className={classes.statIcon}
              />
              <Typography component="div" className={classes.statLabel}>
                {"Total Supply"}
              </Typography>
              <Typography component="div" className={classes.statValue}>
                {reduceFractionDigit(totalSupply, 2)}
              </Typography>
            </Box>
          </Box>
          <Box className={classes.mobileLaunchContainer}>
            <Button variant="contained" className={classes.launchBtn}>
              {"Launch App"}
            </Button>
          </Box>
        </Box>
        <img alt="Homepage" src={homepageImg} className={classes.homepageImg} />
      </Box>
    </>
  );
};

export default Homepage;
