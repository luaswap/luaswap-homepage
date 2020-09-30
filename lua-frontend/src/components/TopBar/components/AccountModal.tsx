import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { useWallet } from 'use-wallet'
import useTokenBalance from '../../../hooks/useTokenBalance'
import useSushi from '../../../hooks/useSushi'
import { getSushiAddress } from '../../../sushi/utils'
import { getBalanceNumber } from '../../../utils/formatBalance'
import Button from '../../Button'
import CardIcon from '../../CardIcon'
import Label from '../../Label'
import Modal, { ModalProps } from '../../Modal'
import ModalActions from '../../ModalActions'
import ModalContent from '../../ModalContent'
import ModalTitle from '../../ModalTitle'
import Spacer from '../../Spacer'
import Value from '../../Value'
import qrCode from '../../../assets/img/qr-code.png'
import IconView from '../../../assets/img/icon-view.svg'
import IconLua1 from '../../../assets/img/lua1.png'
import IconLua2 from '../../../assets/img/lua2.png'
import IconLua3 from '../../../assets/img/lua3.png'
import IconLua4 from '../../../assets/img/lua4.png'
import IconLua5 from '../../../assets/img/lua5.png'
import useAllStakedFarms from '../../../hooks/useAllStakedFarms'
import { Link, useHistory } from 'react-router-dom'
import useCanUnlockAmount from '../../../hooks/useCanUnlockAmount'
import useLockBalance from '../../../hooks/useLockBalance'
import useUnlock from '../../../hooks/useUnlock'

const AccountModal: React.FC<ModalProps> = ({ onDismiss }) => {
  const { account, deactivate } = useWallet()

  const handleSignOutClick = useCallback(() => {
    onDismiss!()
    deactivate()
    localStorage.useWalletConnectStatus = 'disconnected'
    localStorage.useWalletConnectType = ''
  }, [onDismiss])

  const sushi = useSushi()
  const sushiBalance = useTokenBalance(getSushiAddress(sushi))
  const canUnlock = useCanUnlockAmount()
  const lockAmount = useLockBalance()
  const stakedFarms = useAllStakedFarms();
  const history = useHistory();

  const [pendingTx, setPendingTx] = useState(false)
  const { onUnlock } = useUnlock()
  
  return (
      <ModalLarge>
        <Modal>
            <ModalContent>
                <Box>
                    <Heading3>
                        My Wallet
                    </Heading3>
                    <BoxList>
                        <Row>
                            <Col className="col-12">
                                <BoxItem>
                                    <TextMin>
                                        Address
                                    </TextMin>
                                    <TextMedium>
                                        <a style={{ color: '#ffffff', textDecoration: 'none' }} 
                                        target="__blank"
                                        href={`https://etherscan.io/address/${account}`}>{account}</a>
                                    </TextMedium>
                                </BoxItem>
                                <BoxItem>
                                    <Row>
                                        <Col className="col-5">
                                            <TextMin>
                                                Balance <img src={IconView} alt="View"/>
                                            </TextMin>
                                            <TextMedium>
                                                <strong>{parseFloat(getBalanceNumber(sushiBalance).toFixed(4)).toLocaleString('en-US')}</strong>
                                                <span>LUA</span>
                                            </TextMedium>
                                            {/* <TextMin2>
                                                ~795,6 $
                                            </TextMin2> */}
                                        </Col>
                                        <Col className="col-7">
                                            <TextMin>
                                                Released/Lock
                                            </TextMin>
                                            {!lockAmount.isGreaterThan(0) &&
                                                <TextMedium>
                                                    <div><i>no lock</i></div>
                                                </TextMedium>
                                            }
                                            {lockAmount.isGreaterThan(0) &&
                                                <TextMedium>
                                                    <strong>{parseFloat(getBalanceNumber(canUnlock).toFixed(4)).toLocaleString('en-US')}</strong>
                                                    <span>/{parseFloat(getBalanceNumber(lockAmount).toFixed(4)).toLocaleString('en-US')}</span>
                                                    <ReleaseButton
                                                        // disabled={!canUnlock.isGreaterThan(0) || pendingTx}
                                                        disabled={pendingTx}
                                                        onClick={async () => {
                                                            setPendingTx(true)
                                                            await onUnlock()
                                                            setPendingTx(false)
                                                        }}
                                                    >{pendingTx ? 'Releasing' : 'Release'}</ReleaseButton>
                                                </TextMedium>
                                            }
                                        </Col>
                                    </Row>
                                </BoxItem>
                            </Col>
                            {/* <Col className="col-4 text-right">
                                <img src={qrCode} alt="QR Code"/>
                            </Col> */}
                        </Row>
                    </BoxList>
                </Box>
                {stakedFarms && stakedFarms.length > 0 &&
                    <Box className="mt-3">
                        <Heading3>
                            My Fields
                        </Heading3>
                        <BoxList className="scr-auto">
                            {stakedFarms.map(e => 
                                <BoxItem key={e.id} onClick={() => {
                                    history.push(`/farms/${e.id}`)
                                    onDismiss()
                                }} style={{cursor: 'pointer'}}>
                                    <RowHighLight>
                                        <Col className="col-8 align-center">
                                            <BoxFlex>
                                                <div style={{display: 'flex', marginRight: 10}}>
                                                    <img src={e.icon} alt="Lua" height={30} style={{position: 'relative', zIndex: 2}}/> 
                                                    <img src={e.icon2} alt="Lua" height={30} style={{position: 'relative', zIndex: 1, marginLeft: -10}}/>
                                                </div>
                                                <div>
                                                    <TextMedium>
                                                        {e.name}
                                                    </TextMedium>
                                                    <TextMin>
                                                        {parseFloat(getBalanceNumber(e.tokenAmount).toFixed(10)).toLocaleString('en-US')} {e.symbolShort}
                                                    </TextMin>
                                                </div>
                                            </BoxFlex>
                                        </Col>
                                        <Col className="col-4 text-green align-center justify-right">
                                            + {parseFloat(getBalanceNumber(e.pendingReward).toFixed(4)).toLocaleString('en-US')} LUA
                                        </Col>
                                    </RowHighLight>
                                </BoxItem>
                            )}
                        </BoxList>
                    </Box>
                }
            </ModalContent>
            <ModalActions>
                <Row>
                    <Col className="col-6 align-center">
                        <Button
                            onClick={handleSignOutClick}
                            text="Sign out"
                            variant="secondary"
                        />
                    </Col>
                    <Col className="col-6 align-center">
                        <Button
                            onClick={onDismiss}
                            text="Close" />
                    </Col>
                </Row>
            </ModalActions>
        </Modal>
    </ModalLarge>
  )
}

const StyledBalance = styled.div`
    align-items: center;
    display: flex;
    flex-direction: column;
`

const StyledBalanceWrapper = styled.div`
    align-items: center;
    display: flex;
    flex: 1;
    flex-direction: column;
    margin-bottom: ${(props) => props.theme.spacing[4]}px;
`

const ReleaseButton = styled.button`
    color: #fabc45;
    background: #fabc450d;
    border: 1px solid #fabc45;
    font-weight: bold;
    cursor: pointer;
    margin-left: 10px;
    border-radius: 2px;
    padding: 2px 10px;
    transition: 0.3s all;
    &:hover {
        background: #fabc4540
    }
`

const Row = styled.div`
    display: flex;
    margin-left: -15px;
    margin-right: -15px;
    &.align-center {
        align-items: center;
    }
`

const Col = styled.div`
    padding-right: 15px;
    padding-left: 15px;
    &.text-green {
        color: #00E8B5;
        font-weight: 600;
    }
    &.align-center {
        display: flex;
        align-items: center;
    }
    &.justify-right {
        display: flex;
        justify-content: flex-end;
    }
    &.text-right {
        text-align: right;
    }
    &.text-center {
        text-align: center;
    }
    &.col-12 {
        width: 100%;
    }
    &.col-11 {
        width: 91.6%;
    }
    &.col-10 {
        width: 83.3%;
    }
    &.col-9 {
        width: 75%;
    }
    &.col-8 {
        width: 66.6%;
    }
    &.col-8 {
        width: 66.6%;
    }
    &.col-7 {
        width: 58.3%;
    }
    &.col-6 {
        width: 50%;
    }
    &.col-5 {
        width: 41.6%;
    }
    &.col-4 {
        width: 33.3%;
    }
    &.col-3 {
        width: 25%;
    }
    &.col-2 {
        width: 16.6%;
    }
`

const Heading3 = styled.div`
    background: #242828;
    font-size: 16px;
    font-weight: 800;
    color: #FABC45;
    padding: 12px 20px;
    border-radius: 16px 16px 0 0;
`

const Box = styled.div`
    background: #2C3030;
    border-radius: 16px;
    *, *:before, *:after {
        -moz-box-sizing: border-box; 
        -webkit-box-sizing: border-box; 
        box-sizing: border-box;
    }
    &.mt-3 {
        margin-top: 20px;
    }
`

const BoxList = styled.div`
    padding: 20px;
    &.scr-auto {
        height: 175px;
        overflow: auto;
    }
    img {
        max-width: 100%;
    }
`

const BoxItem = styled.div`
    margin-bottom: 20px;
    &:last-child {
        margin-bottom: 0px;
    }
`

const RowHighLight = styled(Row)`
    margin-bottom: 20px;
    transition: 0.3s all;
    &:last-child {
        margin-bottom: 0px;
    }

    &:hover {
        background: rgba(256, 256, 256, 0.1);
    }
`

const TextMin = styled.div`
    font-weight: 600;
    font-size: 14px;
    color: #7A7F7F;
    margin-bottom: 5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    img {
        margin-left: 5px;
    }
`

const TextMin2 = styled.div`
    font-weight: 600;
    font-size: 12px;
    color: #7A7F7F;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

const TextMedium = styled.div`
    font-weight: 600;
    font-size: 16px;
    color: #FFFFFF;
    word-break: break-word;
    strong {
        font-size: 20px;
    }
    span {
        font-size: 13px;
        margin-left: 5px;
    }
    .st-link {
        color: #FABC45;
        text-decoration: none;
        font-size: 13px;
        margin-left: 10px;
    }
`

const Image = styled.div`
    width: 50px;
    img {
        max-width: 100%;
    }
`

const BoxFlex = styled.div`
    display: flex;
    align-items: center;
    &.justify-center {
        justify-content: center;
    }
`

const ModalLarge = styled.div`
    .khPbuj {
        max-width: 900px;
    }
`



export default AccountModal
