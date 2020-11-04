import React, { useCallback, useEffect, useState } from 'react'
import { HashRouter as Router, Route, Switch } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { UseWalletProvider } from 'use-wallet'
import DisclaimerModal from './components/DisclaimerModal'
import MobileMenu from './components/MobileMenu'
import TopBar from './components/TopBar'
import FarmsProvider from './contexts/Farms'
import ModalsProvider from './contexts/Modals'
import TransactionProvider from './contexts/Transactions'
import SushiProvider from './contexts/SushiProvider'
import useModal from './hooks/useModal'
import theme from './theme'
import Farms from './views/Farms'
import Home from './views/Home'
import Stake from './views/Staking'
import config from './config'

const App: React.FC = () => {
  const [mobileMenu, setMobileMenu] = useState(false)

  const handleDismissMobileMenu = useCallback(() => {
    setMobileMenu(false)
  }, [setMobileMenu])

  const handlePresentMobileMenu = useCallback(() => {
    setMobileMenu(true)
  }, [setMobileMenu])

  return (
    <Providers>
      {/* <Router> */}
        <TopBar onPresentMobileMenu={handlePresentMobileMenu} />
        <MobileMenu onDismiss={handleDismissMobileMenu} visible={mobileMenu} />
        {/* <div style={{
          display: "flex", 
          height: '90vh',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: '#ffffff'
          }}>
          <div style={{padding: 10}}>
            <div>
              <svg id="Layer_5" enable-background="new 0 0 64 64" height="250" viewBox="0 0 64 64" width="250" xmlns="http://www.w3.org/2000/svg"><g><g><g><path d="m25.42 62h-21.42v-8.29c0-2.95 1.2-5.63 3.14-7.57.84-.84 1.82-1.54 2.9-2.06 1.41-.69 3-1.08 4.67-1.08.44 0 .87.03 1.29.08 2.82.34 5.34 1.78 7.05 3.92 1.18 1.46 1.98 3.23 2.26 5.2l.69 4.8.03.08 4.81-2.19 1.98 4.46-4.38 2c-.95.43-1.98.65-3.02.65z" fill="#fcd770"/></g><g><path d="m37.42 56.99c.55-1.15.58-1.35.58-1.56 0-1.34-1.09-2.43-2.43-2.43h-.04c-.35 0-.69.07-1.01.22l-1.2.54c1.04-1.71 2.91-2.76 4.92-2.76h1.76c.73 0 1.41.2 2 .54.3.17.58.39.83.63.72.73 1.17 1.73 1.17 2.83s-.9 2-2 2h-4.57z" fill="#b4dd7f"/></g><g><path d="m33.32 53.76-.01.01-1.31.59v-7.36h10v4.54c-.59-.34-1.27-.54-2-.54h-1.76c-2.01 0-3.88 1.05-4.92 2.76z" fill="#aab2bd"/></g><g><path d="m62 39v4c0 2.21-1.79 4-4 4h-6-10-10-8.95c-1.71-2.14-4.23-3.58-7.05-3.92v-3.08h-.32c.85 0 1.66-.34 2.25-.93l.07-.07z" fill="#ccd1d9"/></g><g><path d="m58 13h-20-16.05-.01c-.33 3.46-2.44 6.4-5.4 7.91.89.74 1.46 1.85 1.46 3.09h3c1.1 0 2 .89 2 2 0 .55-.22 1.05-.59 1.41-.36.37-.86.59-1.41.59h-3l.85 8.5c.01.1.01.21.01.31 0 .81-.3 1.59-.86 2.19h44v-22c0-2.21-1.79-4-4-4z" fill="#69d6f4"/></g><g><circle cx="48" cy="13" fill="#e6e9ed" r="10"/></g><g><path d="m27 29h8v6h-8z" fill="#fcd770"/></g><g><path d="m21.94 13c-.33 3.46-2.44 6.4-5.4 7.91-.69-.57-1.58-.91-2.54-.91h-4c-1.04 0-2.02.26-2.87.73-3.06-1.71-5.13-4.98-5.13-8.73 0-5.52 4.48-10 10-10s10 4.48 10 10c0 .34-.02.67-.06 1z" fill="#e6e9ed"/></g><g><path d="m10 35v5c-3.58-1.19-6-4.55-6-8.33v-3.67h6l-.94.94c-.68.68-1.06 1.6-1.06 2.56s.38 1.88 1.06 2.56z" fill="#656d78"/></g><g><path d="m18 24h-2.76c-.76 0-1.45.43-1.79 1.1l-1.45 2.9h-2-6v-2c0-2.27 1.27-4.25 3.13-5.27.85-.47 1.83-.73 2.87-.73h4c.96 0 1.85.34 2.54.91.89.74 1.46 1.85 1.46 3.09z" fill="#ff826e"/></g><g><path d="m21 24c1.1 0 2 .89 2 2 0 .55-.22 1.05-.59 1.41-.36.37-.86.59-1.41.59h-3-6l1.45-2.9c.34-.67 1.03-1.1 1.79-1.1h2.76z" fill="#fc6e51"/></g><g><path d="m35.57 53c1.34 0 2.43 1.09 2.43 2.43 0 .21-.03.41-.58 1.56-.22.28-.51.5-.85.66l-3.75 1.7-1.98-4.46 1.16-.53 1.31-.59.01-.01 1.2-.54c.32-.15.66-.22 1.01-.22z" fill="#f0d0b4"/></g><g><path d="m10 40v-5l-.94-.94c-.68-.68-1.06-1.6-1.06-2.56s.38-1.88 1.06-2.56l.94-.94h2 6l.85 8.5c.01.1.01.21.01.31 0 .81-.3 1.59-.86 2.19-.03.03-.05.05-.07.07-.59.59-1.4.93-2.25.93h.32v3.08c-.42-.05-.85-.08-1.29-.08-1.67 0-3.26.39-4.67 1.08l-.04-.08z" fill="#f0d0b4"/></g></g><g><path d="m13 10.162 1.279 3.838h4.721v-2h-3.279l-2.721-8.162-3.186 9.556-1.196-2.394h-3.618v2h2.382l2.804 5.606z"/><path d="m58 48c2.757 0 5-2.243 5-5v-26c0-2.43-1.744-4.456-4.046-4.904-.462-5.643-5.194-10.096-10.954-10.096-5.728 0-10.442 4.402-10.949 10h-14.051c0-6.065-4.935-11-11-11s-11 4.935-11 11c0 3.468 1.642 6.707 4.364 8.77-1.446 1.283-2.364 3.149-2.364 5.23v1.999 1 2.676c0 3.969 2.383 7.503 6 9.014v2.808c-3.575 2.007-6 5.831-6 10.214v9.289h22.856v-.023c1.037-.054 2.044-.288 2.994-.72l8.136-3.698c.317-.144.603-.334.856-.559h4.158c1.302 0 2.402-.839 2.816-2h15.184c1.654 0 3-1.346 3-3s-1.346-3-3-3h-6c-.552 0-1-.448-1-1v-1zm0-2h-34.512c-1.677-1.9-3.945-3.252-6.488-3.765v-1.47c.499-.167.959-.425 1.364-.765h42.636v3c0 1.654-1.346 3-3 3zm-18 4h-1.764c-2.049 0-3.998.95-5.236 2.476v-4.476h8v2.101c-.323-.066-.658-.101-1-.101zm-13.186 5.623-.51-3.568c-.209-1.46-.69-2.826-1.383-4.055h6.079v5.72zm-13.196-28.624.724-1.447c.17-.341.513-.553.895-.553h5.763c.552 0 1 .449 1 1s-.448 1-1 1zm34.382-22.999c4.963 0 9 4.038 9 9s-4.037 9-9 9-9-4.038-9-9 4.037-9 9-9zm-10.949 10c.507 5.598 5.221 10 10.949 10 5.672 0 10.353-4.316 10.937-9.835 1.194.396 2.063 1.51 2.063 2.835v21h-41.324c.152-.513.224-1.053.168-1.602l-.74-7.399h1.896c1.654 0 3-1.346 3-3s-1.346-3-3-3h-2.101c-.139-.68-.43-1.301-.815-1.851 2.495-1.656 4.176-4.228 4.712-7.148zm-34.051-2c0-4.962 4.037-9 9-9s9 4.038 9 9c0 3.207-1.689 6.106-4.422 7.726-.754-.457-1.633-.726-2.577-.726h-4.001c-.997 0-1.944.213-2.803.59-2.593-1.645-4.197-4.5-4.197-7.59zm2 14c0-2.757 2.243-5 5-5h4.001c1.304 0 2.415.835 2.827 1.999h-1.592c-1.144 0-2.172.635-2.684 1.658l-1.171 2.342h-6.381zm0 5.675v-2.676h2.741c-.479.74-.741 1.599-.741 2.501 0 1.216.493 2.407 1.354 3.268l.646.646v3.043c-2.434-1.353-4-3.921-4-6.782zm4.768 1.679c-.488-.488-.768-1.164-.768-1.854 0-.7.272-1.358.768-1.854l.647-.647h6.68l.76 7.6c.066.653-.163 1.296-.629 1.762-.406.406-.97.64-1.545.64h-2.681v2h2v1.013c-.097-.003-.192-.014-.289-.014-1.298 0-2.543.221-3.711.613v-8.027zm18.254 27.083c-.821.374-1.696.563-2.6.563-2.798 0-5.218-1.801-6.021-4.48l-1.442-4.807-1.916.574 1.442 4.807c.472 1.575 1.384 2.9 2.559 3.906h-15.044v-7.289c0-5.355 4.356-9.711 9.711-9.711 4.801 0 8.934 3.584 9.612 8.338l.593 4.147-1.33.605.828 1.82 5.921-2.692 1.171 2.634zm8.137-3.699-2.831 1.287-1.171-2.635 2.778-1.263c.184-.083.388-.127.631-.127.79 0 1.434.644 1.434 1.434 0 .56-.33 1.072-.841 1.304zm5.841-.738h-3.052c.032-.186.052-.374.052-.566 0-1.457-.915-2.696-2.216-3.194.466-.151.953-.24 1.452-.24h1.764c1.654 0 3 1.346 3 3 0 .552-.448 1-1 1zm12-4h6c.552 0 1 .448 1 1s-.448 1-1 1h-15.101c-.247-1.213-.946-2.253-1.899-2.974v-3.026h8v1c0 1.654 1.346 3 3 3z"/><path d="m57 42h2v2h-2z"/><path d="m53 42h2v2h-2z"/><path d="m49 42h2v2h-2z"/><path d="m42 8h2v2h-2z"/><path d="m46 8h8v2h-8z"/><path d="m42 12h2v2h-2z"/><path d="m46 12h8v2h-8z"/><path d="m42 16h2v2h-2z"/><path d="m46 16h8v2h-8z"/><path d="m36 28h-10v8h10zm-2 6h-6v-4h6z"/><path d="m26 24h10v2h-10z"/><path d="m26 20h10v2h-10z"/><path d="m26 16h10v2h-10z"/><path d="m38 34h2v2h-2z"/><path d="m42 34h17v2h-17z"/><path d="m38 30h21v2h-21z"/><path d="m38 26h21v2h-21z"/></g></g></svg>
            </div>
            <div style={{fontSize: 30, marginTop: 30, marginBottom: 15}}>
              The team is working on LuaSwap upgraded version!
            </div>
            <div style={{marginBottom: 15, color: '#58ce5d'}}>Your asset is safe in our <a style={{color: '#58ce5d'}} href="https://etherscan.io/address/0xb67d7a6644d9e191cac4da2b88d6817351c7ff62"><b>smart contract</b></a> and will remain the same after the upgrade</div>
            <div style={{opacity: 0.7}}>For more information: <a style={{color: '#ffffff'}} href="https://twitter.com/LuaSwap">Twitter</a></div>
          </div>
        </div> */}
        <Switch>
          <Route path="/" exact>
            <Home />
          </Route>
          <Route path="/farms">
            <Farms />
          </Route>
          { <Route path="/staking">
            <Stake />
          </Route> }
        </Switch>
      {/* </Router> */}
      <Disclaimer />
    </Providers>
  )
}

const Providers: React.FC = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <UseWalletProvider
        chainId={config.chainId}
        connectors={{
          walletconnect: { rpcUrl: config.rpc },
        }}
      >
        <SushiProvider>
          <TransactionProvider>
            <FarmsProvider>
              <Router>
              <ModalsProvider>{children}</ModalsProvider>
              </Router>
            </FarmsProvider>
          </TransactionProvider>
        </SushiProvider>
      </UseWalletProvider>
    </ThemeProvider>
  )
}

const Disclaimer: React.FC = () => {
  const markSeen = useCallback(() => {
    localStorage.setItem('disclaimer', 'seen')
  }, [])

  const [onPresentDisclaimerModal] = useModal(
    <DisclaimerModal onConfirm={markSeen} />,
  )

  useEffect(() => {
    const seenDisclaimer = true // localStorage.getItem('disclaimer')
    if (!seenDisclaimer) {
      onPresentDisclaimerModal()
    }
  }, [])

  return <div />
}

export default App
