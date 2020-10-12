import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Button from '../../components/Button'
import Container from '../../components/Container'
import Page from '../../components/Page'
// import PageHeader from '../../components/PageHeader'
import Spacer from '../../components/Spacer'
import Balances from './components/Balances'
import CustomCountDown from './components/CustomCountDown'
import Icon_Tip from '../../assets/img/pro-tip-icon.svg'
import { START_REWARD_AT_BLOCK } from '../../sushi/lib/constants'
import LuaLogo from '../../assets/img/logo.png'
import FarmCards from '../Farms/components/FarmCards'
import TotalLockValue from './components/TotalLockValue'



const Home: React.FC = () => {
  var block = 99999999999
  const launchBlock = START_REWARD_AT_BLOCK
  const [atDate, setDate] = useState<any>()
  return (
    <Page>
        <SpacerRes>
            <Spacer size="lg" />
            <StyledLogo>
                <img className="d-md-none" src={LuaLogo} height="150" style={{ marginTop: -4 }} />
            </StyledLogo>
        </SpacerRes>
        <Spacer size="lg" />
        <div style={{fontWeight: 'bold', fontSize: 22, color: '#ffffff'}}>
            LuaSwap Currently Has <span style={{color: '#4caf50', fontSize: 30}}>$<TotalLockValue /></span> Of Total Locked Value
        </div>
        {block < launchBlock && atDate && <>
            <Spacer size="sm" />
            <CustomCountDown date={atDate}/>
            <Spacer size="md" />
            <div>
                <ReadMore href="https://medium.com/luaswap/introducing-luaswap-org-7e6ff38beefc" target="__blank"> 👉&nbsp;&nbsp;Read The Announcement&nbsp;&nbsp;👈</ReadMore>
            </div>
            <Spacer size="lg" />
            </>
        }
        {block >= launchBlock && <>
            <Spacer size="lg" />
            <Container>
                <Balances />
            </Container>
            <Spacer size="md" />
            <div>
                <ReadMore href="https://medium.com/luaswap/introducing-luaswap-org-7e6ff38beefc" target="__blank"> 👉&nbsp;&nbsp;Read The Announcement&nbsp;&nbsp;👈</ReadMore>
                <div style={{color: 'rgb(255,255,255,0.6)', textAlign: 'center', marginTop: 5}}>Do not complain if you don't</div>
            </div>
            <Spacer size="lg" />
            </>
        }
        <div style={{color: '#fa4c4c'}}>This project is in beta. Use at your own risk.</div>
        <Spacer size="lg" />
        <Container size = "lg">
            <div style={{
                border: '1px solid #2C3030'
                }}>
            </div>
        </Container>
        <Box className="mt-4">
            <StyledHeading>SELECT YOUR FIELDS</StyledHeading>
            <StyledParagraph>Earn LUA tokens by staking UNI-V2 LP token</StyledParagraph>
            <SpacerRes>
                <Spacer size="sm" />
            </SpacerRes>
            <StyledInfo>
                <img src={Icon_Tip} alt="Pro Tip"/>
                <div>
                <b>Pro Tip</b>: Stake to any pool and earn <b>128x LUA</b> rewards until October 13
                </div>
            </StyledInfo>
            <Spacer size="lg" />
            <FarmCards />
        </Box>
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
const StyledHeading = styled.h2`
  color: ${(props) => props.theme.color.white};
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 0;
  margin-top: 0;
`
const StyledParagraph = styled.p`
  color: ${(props) => props.theme.color.grey[100]};
  text-align: center;
  margin-top: 10px;
`

const ReadMore = styled.a`
  text-decoration: none;
  font-weight: bold;
  color: #ffffff;
  display: inline-block;
  padding: 5px 20px;
  border-radius: 5px;
  border: 1px solid #00ff8970;
  background: #00ff890d;
  font-size: 14px;
  margin-top: 10px;
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

const Box = styled.div`
    &.mt-4 {
        margin-top: 40px;
        @media (max-width: 767px) {
            margin-top: 30px;
        }
    }
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
export default Home
