import React from 'react'
import { Route, Switch, useRouteMatch } from 'react-router-dom'
import FarmCards from './FarmCards'


const FarmsContainer: React.FC = () => {
  const { path } = useRouteMatch()
  return <>
    <Route exact path={path}>
      <FarmCards />
    </Route>
  </>
}

export default FarmsContainer
