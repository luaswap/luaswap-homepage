import React from 'react'
import { Switch, useRouteMatch } from 'react-router-dom'
import { useWallet } from 'use-wallet'
import WalletProviderModal from '../../components/WalletProviderModal'

import useModal from '../../hooks/useModal'

import FarmsContainer from './components/FarmsContainer'


const Converts: React.FC = () => {
  return (
    <Switch>
      <FarmsContainer />
    </Switch>
  )
}

export default Converts
