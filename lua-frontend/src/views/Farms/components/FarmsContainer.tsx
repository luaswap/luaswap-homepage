import React from 'react'
import { Route, Switch, useRouteMatch } from 'react-router-dom'
import { useWallet } from 'use-wallet'

import Luas from '../../../assets/img/luas-icon.svg'

import Button from '../../../components/Button'
import Page from '../../../components/Page'
import PageHeader from '../../../components/PageHeader'
import WalletProviderModal from '../../../components/WalletProviderModal'

import useModal from '../../../hooks/useModal'

import Farm from '../../Farm'

import FarmCards from './FarmCards'


const FarmsContainer: React.FC = () => {
  const { path } = useRouteMatch()
  // const { account } = useWallet()
  // const [onPresentWalletProviderModal] = useModal(<WalletProviderModal />)
  
  return <>
    <Route exact path={path}>
      <PageHeader
        icon={<img src={Luas} height="120" />}
        subtitle="Earn LUA tokens by staking LuaSwap SPL Tokens."
        title="Select Your Favorite Dishes"
      />
      <FarmCards />
    </Route>
    <Route path={`${path}/:farmId`}>
      <Farm />
    </Route>
  </>
  // return (
  //   <Page>
  //     {!!account ? (
  //       <>
  //         <Route exact path={path}>
  //           <PageHeader
  //             icon={<img src={Luas} height="120" />}
  //             subtitle="Earn LUA tokens by staking LuaSwap SPL Tokens."
  //             title="Select Your Favorite Dishes"
  //           />
  //           <FarmCards />
  //         </Route>
  //         <Route path={`${path}/:farmId`}>
  //           <Farm />
  //         </Route>
  //       </>
  //     ) : (
  //       <div
  //         style={{
  //           alignItems: 'center',
  //           display: 'flex',
  //           flex: 1,
  //           justifyContent: 'center',
  //         }}
  //       >
  //         <Button variant="secondary"
  //           onClick={onPresentWalletProviderModal}
  //           text="🔓 Unlock Wallet To Continue"
  //         />
  //       </div>
  //     )}
  //   </Page>
  // )
}

export default FarmsContainer
