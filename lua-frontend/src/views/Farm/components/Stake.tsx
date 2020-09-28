import BigNumber from 'bignumber.js'
import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Contract } from 'web3-eth-contract'
import Button from '../../../components/Button'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import CardIcon from '../../../components/CardIcon'
import IconButton from '../../../components/IconButton'
import { AddIcon } from '../../../components/icons'
import Label from '../../../components/Label'
import Value from '../../../components/Value'
import useAllowance from '../../../hooks/useAllowance'
import useApprove from '../../../hooks/useApprove'
import useModal from '../../../hooks/useModal'
import useStake from '../../../hooks/useStake'
import useStakedBalance from '../../../hooks/useStakedBalance'
import useTokenBalance from '../../../hooks/useTokenBalance'
import useUnstake from '../../../hooks/useUnstake'
import { getBalanceNumber, getFullDisplayBalance } from '../../../utils/formatBalance'
import DepositModal from './DepositModal'
import WithdrawModal from './WithdrawModal'
import Lua from '../../../assets/img/lua-icon.svg'
import Luas from '../../../assets/img/Luas.svg'
import { getLPTokenStaked } from '../../../sushi/utils'
import useSushi from '../../../hooks/useSushi'
import useBlock from '../../../hooks/useBlock'
interface StakeProps {
  lpContract: any
  pid: number
  tokenName: string
}

const Stake: React.FC<StakeProps> = ({ lpContract, pid, tokenName }) => {
  const [requestedApproval, setRequestedApproval] = useState(false)

  const allowance = useAllowance(lpContract)
  const { onApprove } = useApprove(lpContract)

  const tokenBalance = useTokenBalance(lpContract.options.address)
  const stakedBalance = useStakedBalance(pid)

  const [totalStake, setTotalStake] = useState<BigNumber>()
  const sushi = useSushi()
  const block = useBlock()

  useEffect(() => {
      async function fetchData() {
          const data = await getLPTokenStaked(sushi, lpContract)
          setTotalStake(data)
      }
      if (sushi && lpContract) {
          fetchData()
      }
  }, [sushi, setTotalStake, lpContract, block])

  const { onStake } = useStake(pid)
  const { onUnstake } = useUnstake(pid)

  const [onPresentDeposit] = useModal(
    <DepositModal
      max={tokenBalance}
      onConfirm={onStake}
      tokenName={tokenName}
    />,
  )

  const [onPresentWithdraw] = useModal(
    <WithdrawModal
      max={stakedBalance}
      onConfirm={onUnstake}
      tokenName={tokenName}
    />,
  )

  const handleApprove = useCallback(async () => {
    try {
      setRequestedApproval(true)
      const txHash = await onApprove()
      // user rejected tx or didn't go thru
      if (!txHash) {
        setRequestedApproval(false)
      }
    } catch (e) {
      console.log(e)
    }
  }, [onApprove, setRequestedApproval])

  return (
    <Card>
      <CardContent>
        <StyledCardContentInner>
          <StyledCardHeader>
            <CardIcon><img src={Luas} alt="LUA Reward"/></CardIcon>
            <StyledValue>
              <ValueStyled>{getBalanceNumber(stakedBalance).toFixed(8)}</ValueStyled>
              <Label text={`${tokenName} Tokens Staked`} />
            </StyledValue>
          </StyledCardHeader>
          {totalStake && stakedBalance &&
            <div style={{marginTop: 10}}>
              <span style={{color: '#4caf50'}}>Share of Pool: <span style={{fontSize: 18}}>
                {parseFloat(stakedBalance.div(totalStake).times(100).toFixed(5))}%
              </span></span>
            </div>
          }
          <StyledCardActions>
            {!allowance.toNumber() ? (
              <Button
                disabled={requestedApproval}
                onClick={handleApprove}
                text={requestedApproval ? 'Approving' : `Approve ${tokenName}`}
              />
            ) : (
              <>
                {/* <Button
                  disabled={stakedBalance.eq(new BigNumber(0))}
                  text="Unstake"
                  onClick={onPresentWithdraw}
                /> */}
                <Button
                  text="Stake"
                  onClick={onPresentDeposit}
                />
                <StyledActionSpacer />
                <StyleButtonWrap>
                  <span className="tooltip-unstake">UnStake</span>
                  <IconButton 
                    disabled={stakedBalance.eq(new BigNumber(0))}
                    onClick={onPresentWithdraw}>                    
                    <AddIcon />
                  </IconButton>
                </StyleButtonWrap>
                {/* <IconButton onClick={onPresentDeposit}>
                  <AddIcon />
                </IconButton> */}
              </>
            )}
          </StyledCardActions>
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
const StyledValue = styled.div`
  text-align: center;
  span{
    color: ${(props) => props.theme.color.white};
  }  
`

const ValueStyled = styled.div`
  font-family: 'Nunito Sans', sans-serif;
  color: #ffffff;
  font-size: 32px;
  font-weight: 700;
`
const StyledCardActions = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${(props) => props.theme.spacing[6]}px;
  width: 100%;
`

const StyledActionSpacer = styled.div`
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
const StyleButtonWrap = styled.div`
  position: relative;

  border: 1px solid ${(props) => props.theme.color.grey[100]};
  border-radius: 12px;
  > .tooltip-unstake{
    position: absolute;
    font-size: 14px;
    font-weight: bold;
    top: -30px;
    left:-14px;
    color: ${(props) => props.theme.color.grey[100]};
    padding: 3px 10px;
    border-radius: 12px;
    background-color: ${(props) => props.theme.color.grey[500]};
    display: none;
    :after{
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      margin-left: -5px;
      border-width: 5px;
      border-style: solid;
      border-color: ${(props) => props.theme.color.grey[500]} transparent transparent transparent;

    }
  }
  &:hover{
    > .tooltip-unstake{
      display: block;
    }
  }
`

export default Stake
