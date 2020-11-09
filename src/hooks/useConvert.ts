import {useCallback} from 'react'

import useSushi from './useSushi'
import {useWallet} from 'use-wallet'

import {makerConvert, getMakerContract} from '../sushi/utils'

const useConvert = () => {
  const {account} = useWallet()
  const sushi = useSushi()
  const handle = useCallback(
    async (token0: string, token1: string) => {
      const txHash = await makerConvert(
        getMakerContract(sushi),
        token0,
        token1,
        account,
      )
      console.log(txHash)
    },
    [account, sushi],
  )

  return {onConvert: handle}
}

export default useConvert
