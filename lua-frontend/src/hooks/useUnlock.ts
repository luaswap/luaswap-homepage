import { useCallback } from 'react'

import useSushi from './useSushi'
import { useWallet } from 'use-wallet'

import { unlock } from '../sushi/utils'

const useUnlock = () => {
  const { account } = useWallet()
  const sushi = useSushi()

  const doTx = useCallback(async () => {
    try {
      const txHash = await unlock(sushi, account)
      return txHash
    }
    catch (ex) {
      return ''
    }
  }, [])

  return { onUnlock: doTx }
}

export default useUnlock
