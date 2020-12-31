import React from "react";
import { Router, Route } from "react-router-dom";
import { createBrowserHistory } from "history";
import { ThemeProvider } from "@material-ui/core";
import Homepage from "../Homepage";
import MyTheme from "../../styles/theme";
import ROUTE from "../../constants/routes";
import NavBar from "../../components/NavBar";
import "../../styles/common.scss";

const history = createBrowserHistory();

const App = () => {
  return (
    <ThemeProvider theme={MyTheme}>
      <NavBar />
      <Router history={history}>
        <Route exact path={ROUTE.HOMEPAGE} component={Homepage} />
      </Router>
    </ThemeProvider>
  );
};

export default App;
