import React, {useEffect, useMemo, useState} from 'react'
import styled from 'styled-components'
import {useWallet} from 'use-wallet'
import {provider} from 'web3-core'
import Spacer from '../../components/Spacer'
import Separator from '../../components/Separator'
import useSushi from '../../hooks/useSushi'
import {getContract} from '../../utils/erc20'
import UnstakeXSushi from './components/UnstakeXSushi'
import StakeSushi from "./components/StakeSushi";
import {getXLuaAddress, getXSushiSupply} from "../../sushi/utils";
import BigNumber from "bignumber.js";
import {getBalanceNumber} from "../../utils/formatBalance";
import ConvertMakerCards from '../../components/ConvertMakerCards'
import Container from '../../components/Container'

const StakeXSushi: React.FC = () => {
  const sushi = useSushi()
  const tokenAddress = getXLuaAddress(sushi)

  const [totalSupply, setTotalSupply] = useState<BigNumber>()
  const {ethereum} = useWallet()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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
    <>
      <StyledFarm>
        <StyledCardsWrapper>
          <StyledCardWrapper>
            <UnstakeXSushi
              xLuaTokenAddress={tokenAddress}
            />
          </StyledCardWrapper>
          <Spacer/>
          <StyledCardWrapper>
            <StakeSushi
            />
          </StyledCardWrapper>
        </StyledCardsWrapper>
        <Spacer size="md"/>
        <StyledCardsWrapper>
          <StyledCardWrapper>
          <StyledInfo>
            Users who stake LUA in LuaSafe will receive xLUA LP tokens which represent their proportion of LUA staked. Stakers will need to withdraw their xLUA LP tokens in order to receive their LUA reward.
            {/* <br/>
            {totalSupply ? `There are currently ${getBalanceNumber(totalSupply)} xLUA in the whole pool.` : '' } */}
          </StyledInfo>
          </StyledCardWrapper>
        </StyledCardsWrapper>
      </StyledFarm>
      <Spacer size="md" />
        <Container size = "lg">
            <div style={{
                border: '1px solid #2C3030'
                }}>
            </div>
        </Container>
      <Box className="mt-4">
      <StyledHeading>SELECT PAIR TO CONVERT</StyledHeading>
      <StyledInfoWrapper>
          <StyledNoteWrapper>
            The core team will trigger distribution every Monday, generally around noon Singapore time (GMT+8) or earlier if the pair’s collected fee reaches a certain significant amount (equivalent to at least 3,000 LUA after converted). Users do not need to pay any gas fee for the distribution unless they choose to manually trigger the distribution process themselves.
          </StyledNoteWrapper>
      </StyledInfoWrapper>
      <SpacerRes>
          <Spacer size="sm" />
      </SpacerRes>
      {/* <StyledInfoWrapper>
          <StyledNoteWrapper>
            ℹ️ The core team will trigger distribution every Monday, generally around noon Singapore time (GMT+8) or earlier if the pair’s collected fee reaches a certain significant amount (equivalent to at least 3,000 LUA after converted). Users do not need to pay any gas fee for the distribution unless they choose to manually trigger the distribution process themselves.
          </StyledNoteWrapper>
      </StyledInfoWrapper> */}
      <SpacerRes>
          <Spacer size="md" />
      </SpacerRes>
          <ConvertMakerCards />
      </Box>
    </>
  )
}
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
const StyledHeading = styled.h2`
  color: ${(props) => props.theme.color.white};
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 0;
  margin-top: 0;
`
const StyledFarm = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 100%;
  }
`
const StyledParagraph = styled.p`
  color: ${(props) => props.theme.color.grey[100]};
  text-align: center;
  margin-top: 10px;
`
const StyledCardsWrapper = styled.div`
  display: flex;
  width: 900px;
  text-align: center;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: center;
  }
`

const StyledInfoWrapper = styled.div`
  display: flex;
  width: 900px;
  text-align: center;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: center;
  }
`

const StyledCardWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  text-align: center;
  @media (max-width: 768px) {
    width: 80%;
  }
`

const StyledInfo = styled.h3`
  color: ${(props) => props.theme.color.grey[400]};
  font-size: 16px;
  font-weight: 400;
  margin: 0;
  padding: 0;
  text-align: center;
`
const StyledNote = styled.div`
margin-left: 15px;
`
const StyledNoteWrapper = styled.h3`
color: ${(props) => props.theme.color.grey[100]};
  font-size: 16px;
  font-weight: 400;
  margin: 0;
  padding: 0;
  text-align: center;
`
export default StakeXSushi
