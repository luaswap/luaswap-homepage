import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Button from '../../../components/Button'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import CardIcon from '../../../components/CardIcon'
import Label from '../../../components/Label'
import Value from '../../../components/Value'
import useReward from '../../../hooks/useReward'
import {getBalanceNumber} from '../../../utils/formatBalance'
import useTokenBalance from "../../../hooks/useTokenBalance";
import useTotalShare from "../../../hooks/useTotalShares";
import useTokenBalanceOf from '../../../hooks/useTokenBalanceOf'
import {Contract} from "web3-eth-contract";
import useModal from "../../../hooks/useModal";
import WithdrawModal from "./WithdrawModal";
import useLeave from "../../../hooks/useLeave";
import BigNumber from 'bignumber.js'
import { getXSushiSupply, getSushiAddress} from "../../../sushi/utils";
import useSushi from '../../../hooks/useSushi'

interface HarvestProps {
  xLuaTokenAddress: string
}

const UnstakeXSushi: React.FC<HarvestProps> = ({xLuaTokenAddress}) => {
  const sushi = useSushi()
  const myXLua = useTokenBalance(xLuaTokenAddress)
  const totalLuaInSafe = useTotalShare(getSushiAddress(sushi), xLuaTokenAddress)
  const [totalSupplyXLua, setTotalSupplyXLua] = useState<BigNumber>()
  const [pendingTx, setPendingTx] = useState(false)
  const trackingAPYBalanceXLua = useTokenBalanceOf(xLuaTokenAddress,'0xdEad000000000000000000000000000000000000');

  useEffect(() => {
    async function fetchTotalSupplyXLua() {
      const supply = await getXSushiSupply(sushi)
      setTotalSupplyXLua(supply)
    }
    if (sushi) {
      fetchTotalSupplyXLua()
    }
  }, [sushi, setTotalSupplyXLua])

  const xLuaToLua = myXLua.multipliedBy(totalLuaInSafe).dividedBy(totalSupplyXLua)
  const trackingReward = trackingAPYBalanceXLua.multipliedBy(totalLuaInSafe).dividedBy(totalSupplyXLua).minus(10 * 10 ** 18)

  const {onLeave} = useLeave()
  const tokenName = "xLUA"
  var oneDay = 1000 * 60 * 60 * 24; // hours*minutes*seconds*milliseconds
  var initStakeAt =  new Date(1603904400000);
  var toDay =   new Date();       // Today
  const differenceMs = Math.abs(toDay.getTime() - initStakeAt.getTime());
  var totalStakedDay = Math.round(differenceMs / oneDay);

  const [onPresentLeave] = useModal(
    <WithdrawModal
      max={myXLua}
      onConfirm={onLeave}
      tokenName={tokenName}
    />,
  )

  return (
    <Card>
      <CardContent>
        <StyledCardContentInner>
          <StyledCardHeader>
            <Label text={`YOUR xLUA`}/>
            <br/>
            <Value value={getBalanceNumber(myXLua)}/>
            <Label text={`~ ${xLuaToLua.div(10 ** 18).toFixed(2)} LUA`}/>
          </StyledCardHeader>
          
          <StyledCardActions>
            <Button
              disabled={!myXLua.toNumber() || pendingTx}
              text={pendingTx ? 'pending Withdraw' : 'Withdraw'}
              onClick={async () => {
                setPendingTx(true)
                await onPresentLeave()
                setPendingTx(false)
              }}
            />
          </StyledCardActions>
          <br/>
          <StyledInsight>
              <span>APY</span>
              <br/>
              <span style={{fontWeight: 'bold', color: '#4caf50'}}>
                {trackingReward ?
                  `${parseFloat(
                    trackingReward
                    .div(totalStakedDay)
                    .div(10 * 10 ** 18)
                    .times(100)
                    .times(365)
                    .toFixed(2)).toLocaleString('en-US')}%` : '~'
                }
              </span>
          </StyledInsight>
        </StyledCardContentInner>
      </CardContent>
    </Card>
  )
}

const StyledCardHeader = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`
const StyledCardActions = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${(props) => props.theme.spacing[6]}px;
  width: 100%;
`

const StyledSpacer = styled.div`
  height: ${(props) => props.theme.spacing[4]}px;
  width: ${(props) => props.theme.spacing[4]}px;
`

const StyledCardContentInner = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
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
export default UnstakeXSushi
