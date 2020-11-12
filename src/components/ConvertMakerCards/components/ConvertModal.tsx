import BigNumber from 'bignumber.js'
import React, { useCallback, useMemo, useState } from 'react'
import Button from '../../../components/Button'
import Modal, { ModalProps } from '../../../components/Modal'
import ModalActions from '../../../components/ModalActions'
import ModalTitle from '../../../components/ModalTitle'
import styled from 'styled-components'

interface ConvertModalProps extends ModalProps {
  onConfirm: (token0: string, token1: string) => void
  pair?: string
  token0: string
  token1: string
}

const ConvertModal: React.FC<ConvertModalProps> = ({
  onConfirm,
  onDismiss,
  pair = '',
  token0 = '',
  token1= ''
}) => {
  const [pendingTx, setPendingTx] = useState(false)
  return (
    <Modal>
      <ModalTitle text={`Convert this pair: ${pair} `} />
      <StyledNote>
      This “CONVERT” button will trigger reward distribution for the selected pair. Anyone can trigger distribution at any time by selecting the “CONVERT” buttons. Users need to pay the gas fee for the distribution if they choose to do it themselves.
      </StyledNote>
      <ModalActions>
        <Button text="Cancel" variant="secondary" onClick={onDismiss} />
        <Button
          disabled={pendingTx}
          text={pendingTx ? 'Pending Confirmation' : 'Confirm'}
          onClick={async () => {
            setPendingTx(true)
            await onConfirm(token0,token1)
            setPendingTx(false)
            onDismiss()
          }}
        />
      </ModalActions>
    </Modal>
  )
}
const StyledNote = styled.h3`
color: ${(props) => props.theme.color.grey[100]};
  font-size: 16px;
  font-weight: 400;
  margin: 0;
  padding: 0;
  text-align: center;
`

export default ConvertModal
