import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Button from '../../components/Button'
import Container from '../../components/Container'
import Page from '../../components/Page'
// import PageHeader from '../../components/PageHeader'
import Spacer from '../../components/Spacer'
import FarmCards from '../Farms/components/FarmCards'
import Balances from './components/Balances'
import CustomCountDown from './components/CustomCountDown'
import Icon_Tip from '../../assets/img/pro-tip-icon.svg'
import useBlock from '../../hooks/useBlock'
import { START_REWARD_AT_BLOCK } from '../../sushi/lib/constants'
import LuaLogo from '../../assets/img/logo.png'

const Home: React.FC = () => {
  var block = useBlock()
  const launchBlock = START_REWARD_AT_BLOCK
  const [atDate, setDate] = useState<any>()
  useEffect(() => {
    if (block > 0) {
      var d: any = (launchBlock - block) * 13000 + new Date().getTime()
      setDate(new Date(d))
    }
  }, [block > 0])
  return (
    <Page>
      <Spacer size="lg" />
      <img src={LuaLogo} height="150" style={{ marginTop: -4 }} />
      <Spacer size="md" />
      {block < launchBlock && atDate && <>
        <Spacer size="lg" />
        <CustomCountDown date={atDate}/>
        <Spacer size="lg" />
      </>
      }
      {block >= launchBlock && <>
        <Spacer size="lg" />
        <Container>
          <Balances />
        </Container>
        <Spacer size="lg" />
      </>
      }
      <Container size = "lg">
        <div style={{
          border: '1px solid #2C3030'
          }}>
        </div>
      </Container>
      <div
        style={{
          margin: '40px auto',
        }}
      >
        <StyledHeading>SELECT YOUR FIELDS</StyledHeading>
        <StyledParagraph>Earn LUA tokens by staking LuaSwap V2 LP Token</StyledParagraph>
        <Spacer size="lg" />

        <StyledInfo>
          <img src={Icon_Tip} alt="Pro Tip"/><b>Pro Tip</b>: Stake any pool in this week to earn x128 LUA reward
        </StyledInfo>
        <Spacer size="lg" />
        <FarmCards />
      </div>
    </Page>
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
  justify-content: center;
  > img{
    width: 20px;
    margin-right: 3px;
  }
  > b {
    color: ${(props) => props.theme.color.primary.main};
  }
`
const StyledHeading = styled.h2`
  color: ${(props) => props.theme.color.white};
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 0;
`
const StyledParagraph = styled.p`
  color: ${(props) => props.theme.color.grey[100]};
  text-align: center;
  margin-top: 10px;
`

export default Home
