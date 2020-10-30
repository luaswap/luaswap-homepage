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
import {Contract} from "web3-eth-contract";
import useModal from "../../../hooks/useModal";
import WithdrawModal from "./WithdrawModal";
import useLeave from "../../../hooks/useLeave";
import BigNumber from 'bignumber.js'
import { getXSushiSupply, getSushiAddress} from "../../../sushi/utils";
import useSushi from '../../../hooks/useSushi'

interface HarvestProps {
  xSushiAddress: string
}

const UnstakeXSushi: React.FC<HarvestProps> = ({xSushiAddress}) => {
  const sushi = useSushi()
  const xSushiBalance = useTokenBalance(xSushiAddress)
  const totalLuaStaked = useTotalShare(getSushiAddress(sushi), xSushiAddress)
  const [totalSupply, setTotalSupply] = useState<BigNumber>()
  const [pendingTx, setPendingTx] = useState(false)

  useEffect(() => {
    async function fetchTotalSupply() {
      const supply = await getXSushiSupply(sushi)
      setTotalSupply(supply)
    }
    if (sushi) {
      fetchTotalSupply()
    }
  }, [sushi, setTotalSupply])

  const reward = new BigNumber (xSushiBalance).multipliedBy(totalLuaStaked).dividedBy(totalSupply).minus(xSushiBalance)

  const {onLeave} = useLeave()
  const tokenName = "xLUA"

  const [onPresentLeave] = useModal(
    <WithdrawModal
      max={xSushiBalance}
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
            <Value value={getBalanceNumber(xSushiBalance)}/>
            <Label text="xLUA (LuaSafe) Available"/>
          </StyledCardHeader>
          <StyledCardActions>
            <Button
              disabled={!xSushiBalance.toNumber() || pendingTx}
              text={pendingTx ? 'pending Withdraw' : 'Withdraw'}
              onClick={async () => {
                setPendingTx(true)
                await onPresentLeave()
                setPendingTx(false)
              }}
            />
          </StyledCardActions>
          <StyledInsight>
              <span>Reward</span>
              <span>
                {reward &&
                  <><b>{parseFloat(getBalanceNumber(new BigNumber(reward)).toFixed(6)).toLocaleString('en-US')} LUA</b></>
                }
                {!reward && "~"}
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
