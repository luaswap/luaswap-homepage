import React, {useEffect, useMemo, useState} from 'react'
import {Route, Switch, useRouteMatch} from 'react-router-dom'
import {useWallet} from 'use-wallet'
import chef from '../../assets/img/logo.png'
import Button from '../../components/Button'
import styled from 'styled-components'
import Page from '../../components/Page'
import Label from '../../components/Label'
import Spacer from '../../components/Spacer'
import PageHeader from '../../components/PageHeader'
import WalletProviderModal from '../../components/WalletProviderModal'
import useModal from '../../hooks/useModal'
import StakeXSushi from "../StakeXSushi";
import useSushi from '../../hooks/useSushi'
import {getXLuaAddress, getXSushiSupply} from "../../sushi/utils";
import {getBalanceNumber} from "../../utils/formatBalance";
import BigNumber from "bignumber.js";

const Staking: React.FC = () => {
  const {path} = useRouteMatch()
  const {account} = useWallet()
  const [onPresentWalletProviderModal] = useModal(<WalletProviderModal/>)
  const sushi = useSushi()
  const [totalSupply, setTotalSupply] = useState<BigNumber>()

  useEffect(() => {
    async function fetchTotalSupply() {
      const supply = await getXSushiSupply(sushi)
      setTotalSupply(supply)
    }
    if (sushi) {
      fetchTotalSupply()
    }
  }, [sushi, setTotalSupply])

  return (
    <Switch>
      <Page>
        <SpacerRes>
            <Spacer size="lg" />
            <StyledLogo>
                <img className="d-md-none" src={chef} height="150" style={{ marginTop: -4 }} />
            </StyledLogo>
        </SpacerRes>
        <StyledCardHeader>
            <Label text={`Welcome to LuaSafe, stake LUA to earn LUA.`}/>
        </StyledCardHeader>
        <div style={{fontWeight: 'bold', fontSize: 22, color: '#ffffff'}}>
            LuaSafe Currently has <span style={{color: '#4caf50', fontSize: 30}}>{parseFloat(getBalanceNumber(new BigNumber(totalSupply)).toFixed(2)).toLocaleString('en-US')}</span> LUA Staked
        </div>
        <Spacer size="md" />
        {!!account ? (
          <>
            <Route exact path={path}>
            </Route>
            <StakeXSushi/>
          </>
        ) : (
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              flex: 1,
              justifyContent: 'center',
            }}
          >
            <Button
              onClick={onPresentWalletProviderModal}
              text="🔓 Unlock Wallet"
            />
          </div>
        )}
      </Page>
    </Switch>
  )
}
const StyledInfo = styled.h3`
  color: ${(props) => props.theme.color.white};
  font-size: 16px;
  font-weight: 400;
  margin: 0;
  padding: 0;
  text-align: center;
  display: flex;
  align-items: start;
  justify-content: center;
  > img{
    width: 20px;
    margin-right: 3px;
  }
  b {
    color: ${(props) => props.theme.color.primary.main};
  }
`
const StyledParagraph = styled.p`
  color: ${(props) => props.theme.color.grey[100]};
  text-align: center;
  margin-top: 10px;
`
const SpacerRes = styled.div`
    .sc-iCoHVE {
        @media (max-width: 1024px) {
            display: none;
        }
    }
    .d-lg-none {
        @media (min-width: 1025px) {
            display: none;
        }
    }
`
const StyledLogo = styled.div`
    .d-md-none {
        @media (max-width: 1024px) {
            display: none;
        }
    }
    .d-lg-none {
        @media (min-width: 1025px) {
            display: none;
        }
    }
`
const StyledCardHeader = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`
const Box = styled.div`
    &.mt-4 {
        margin-top: 40px;
        @media (max-width: 767px) {
            margin-top: 30px;
        }
    }
`
const StyledHeading = styled.h2`
  color: ${(props) => props.theme.color.white};
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 0;
  margin-top: 0;
`
export default Staking