import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import Countdown, { CountdownRenderProps } from 'react-countdown'
import styled, { keyframes } from 'styled-components'
import Button from '../../../components/Button'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import CardIcon from '../../../components/CardIcon'
import Loader from '../../../components/Loader'
import Spacer from '../../../components/Spacer'
import { Farm } from '../../../contexts/Farms'
import useAllMakerValue, {
  StakedValue,
} from '../../../hooks/useAllMakerValue'
import useFarms from '../../../hooks/useFarms'
import useConvert from '../../../hooks/useConvert'
import useSushi from '../../../hooks/useSushi'
import ConvertModal from './ConvertModal'
import useModal from '../../../hooks/useModal'

interface FarmWithStakedValue {
  lpAddresses: string
  lpBalance: BigNumber
  token0Addresses: string
  token0Symbol: string
  token0Balance: BigNumber
  token1Addresses: string
  token1Symbol: string
  token1Balance: BigNumber
}

const FarmCards: React.FC = () => {
  const [farms] = useFarms()
  const stakedValue = useAllMakerValue()
  const rows = stakedValue.reduce<FarmWithStakedValue[][]>(
    (farmRows, farm, i) => {
      const farmWithStakedValue : FarmWithStakedValue = {
        lpAddresses: (stakedValue[i] || {}).lpAddresses,
        lpBalance: (stakedValue[i] || {}).lpBalance || new BigNumber(0),
        token0Addresses: (stakedValue[i] || {}).token0Addresses,
        token0Symbol: (stakedValue[i] || {}).token0Symbol,
        token0Balance: (stakedValue[i] || {}).token0Balance || new BigNumber(0),
        token1Addresses: (stakedValue[i] || {}).token1Addresses,
        token1Symbol: (stakedValue[i] || {}).token1Symbol,
        token1Balance: (stakedValue[i] || {}).token1Balance || new BigNumber(0)
      }
      const newFarmRows = [...farmRows]
      if (newFarmRows[newFarmRows.length - 1].length === 3) {
        newFarmRows.push([farmWithStakedValue])
      } else {
        newFarmRows[newFarmRows.length - 1].push(farmWithStakedValue)
      }
      return newFarmRows
    },
    [[]],
  )

  return (
    <StyledCards>
      {!!rows[0].length ? (
        rows.map((farmRow, i) => (
          <StyledRow key={i}>
            {farmRow.map((farm, j) => (
              <React.Fragment key={j}>
                <FarmCard farm={farm} />
                {(j === 0 || j === 1) && <StyledSpacer />}
              </React.Fragment>
            ))}
          </StyledRow>
        ))
      ) : (
        <StyledLoadingWrapper>
          <Loader text="Cooking the rice ..." />
        </StyledLoadingWrapper>
      )}
    </StyledCards>
  )
}

interface FarmCardProps {
  farm: FarmWithStakedValue
}

const FarmCard: React.FC<FarmCardProps> = ({ farm }) => {

  const renderer = (countdownProps: CountdownRenderProps) => {
    var { days, hours, minutes, seconds } = countdownProps
    const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes
    hours = days * 24 + hours
    const paddedHours = hours < 10 ? `0${hours}` : hours
    return (
      <span style={{ width: '100%' }}>
        {paddedHours}:{paddedMinutes}:{paddedSeconds}
      </span>
    )
  }

  const {onConvert} = useConvert()
  const [onPresentConvert] = useModal(
    <ConvertModal
      onConfirm={onConvert}
      pair={`${farm.token0Symbol} - ${farm.token1Symbol}`}
      token0={farm.token0Addresses}
      token1={farm.token1Addresses}
    />,
  )

  return (
    <StyledCardWrapper>
      {/* {farm.tokenSymbol === 'LUA' && <StyledCardAccent />} */}
      <Card>
        <CardContent>
          <StyledContent>     
            <div style={{display: 'flex'}}>
              {/* <CardIcon><img src={farm.icon} alt="" height="60"/></CardIcon>
              <span>&nbsp;&nbsp;</span>
              <CardIcon><img src={farm.icon2} alt=""  height="60"/></CardIcon> */}
            </div>      
            <StyledTitle>{`${farm.token0Symbol} - ${farm.token1Symbol}`}</StyledTitle>
            <StyledInsight>
              <span>LuaSwap LP</span>
              <span>
                {farm.lpBalance &&
                  <><b>{ farm.lpBalance.toFixed(12) } </b></>
                }
              </span>
            </StyledInsight>
            <StyledInsight>
              <span>{farm.token0Symbol}</span>
              <span>
                {farm.token0Balance &&
                  <><b>{parseFloat(farm.token0Balance.toFixed(4)).toLocaleString('en-US')} </b></>
                }
                {!farm.token0Balance && "~"}
              </span>
            </StyledInsight>
            <StyledInsight>
            <span>{farm.token1Symbol}</span>
              <span>
                {farm.token1Balance &&
                  <><b>{parseFloat(farm.token1Balance.toFixed(4)).toLocaleString('en-US')} </b></>
                }
                {!farm.token1Balance && "~"}
              </span>
            </StyledInsight>
            <Spacer />
            <br/>
            <Button
              disabled={new BigNumber(farm.lpBalance).isGreaterThan(0) ? false : true}
              text={'Convert'}
              onClick={onPresentConvert}
            >
            </Button>
          </StyledContent>
        </CardContent>
      </Card>
    </StyledCardWrapper>
  )
}

const RainbowLight = keyframes`
  
	0% {
		background-position: 0% 50%;
	}
	50% {
		background-position: 100% 50%;
	}
	100% {
		background-position: 0% 50%;
	}
`

const StyledCardAccent = styled.div`
  background: linear-gradient(
    45deg,
    rgba(255, 0, 0, 1) 0%,
    rgba(255, 154, 0, 1) 10%,
    rgba(208, 222, 33, 1) 20%,
    rgba(79, 220, 74, 1) 30%,
    rgba(63, 218, 216, 1) 40%,
    rgba(47, 201, 226, 1) 50%,
    rgba(28, 127, 238, 1) 60%,
    rgba(95, 21, 242, 1) 70%,
    rgba(186, 12, 248, 1) 80%,
    rgba(251, 7, 217, 1) 90%,
    rgba(255, 0, 0, 1) 100%
  );
  background-size: 300% 300%;
  animation: ${RainbowLight} 2s linear infinite;
  border-radius: 12px;
  filter: blur(6px);
  position: absolute;
  top: -2px;
  right: -2px;
  bottom: -2px;
  left: -2px;
  z-index: -1;
`

const StyledCards = styled.div`
  width: 900px;
  @media (max-width: 768px) {
    width: 100%;
  }
`

const StyledLoadingWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: center;
`

const StyledRow = styled.div`
  display: flex;
  margin-bottom: ${(props) => props.theme.spacing[4]}px;
  flex-flow: row wrap;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: center;
  }
`

const StyledCardWrapper = styled.div`
  display: flex;
  width: calc((900px - ${(props) => props.theme.spacing[4]}px * 2) / 3);
  position: relative;
  overflow: hidden;
  border-radius: 12px;
`

const StyledTitle = styled.h4`
  color: ${(props) => props.theme.color.white};
  font-size: 20px;
  font-weight: 700;
  margin: ${(props) => props.theme.spacing[2]}px 0 0;
  padding: 0;
`

const StyledContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`
const StyledTopIcon = styled.div`
  // position: relative;
`

const StyledHotIcon = styled.div`
  position: absolute;
  padding: 18px 40px 4px;
  background-color: #D91F26;
  top: -5px;
  left: -40px;
  font-weight: bold;
  -webkit-transform: rotate(-45deg);
  -ms-transform: rotate(-45deg);
  transform: rotate(-45deg);
  color: #fff;
`

const StyledNewIcon = styled.div`
  position: absolute;
  padding: 18px 40px 4px;
  background-color: ${(props) => props.theme.color.primary.main};
  top: -5px;
  left: -40px;
  font-weight: bold;
  -webkit-transform: rotate(-45deg);
  -ms-transform: rotate(-45deg);
  transform: rotate(-45deg);
  color: #fff;
`

const StyledSpacer = styled.div`
  height: ${(props) => props.theme.spacing[4]}px;
  width: ${(props) => props.theme.spacing[4]}px;
`

const StyledDetails = styled.div`
  margin-top: ${(props) => props.theme.spacing[2]}px;
  text-align: center;
`

const StyledDetail = styled.div`
  color: ${(props) => props.theme.color.grey[100]};
  font-size: 14px;
`

const StyledInsight = styled.div`
  display: flex;
  justify-content: space-between;
  box-sizing: border-box;
  border-radius: 8px;
  background: transparent;
  color: #9E9E9E;
  width: 100%;
  line-height: 25px;
  font-size: 13px;
  border: 0px solid #e6dcd5;
  text-align: center;
`

export default FarmCards
