import { useCallback } from 'react'

import useSushi from './useSushi'
import { useWallet } from 'use-wallet'

import { harvest, getMasterChefContract } from '../sushi/utils'

const useReward = (pid: number) => {
  const { account } = useWallet()
  const sushi = useSushi()
  const masterChefContract = getMasterChefContract(sushi)

  const handleReward = useCallback(async () => {
    try {
      const txHash = await harvest(masterChefContract, pid, account)
      console.log(txHash)
      return txHash
    }
    catch (ex) {
      console.error(ex)
      return ''
    }
  }, [account, pid, sushi])

  return { onReward: handleReward }
}

export default useReward
