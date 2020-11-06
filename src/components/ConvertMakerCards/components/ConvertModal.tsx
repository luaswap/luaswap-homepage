import BigNumber from 'bignumber.js'
import React, { useCallback, useMemo, useState } from 'react'
import Button from '../../../components/Button'
import Modal, { ModalProps } from '../../../components/Modal'
import ModalActions from '../../../components/ModalActions'
import ModalTitle from '../../../components/ModalTitle'

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
      <ModalTitle text={`Convert this pair?: ${pair} `} />
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

export default ConvertModal
