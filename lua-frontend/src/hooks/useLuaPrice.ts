import { useCallback, useEffect, useState } from 'react'
import { provider } from 'web3-core'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'

import { getEarned, getLuaPrice, getMasterChefContract } from '../sushi/utils'
import useSushi from './useSushi'
import useBlock from './useBlock'

const useLuaPrice = () => {
  const [price, setPrice] = useState(new BigNumber(0))
  const sushi = useSushi()
  const block = useBlock()

  const fetchBalance = useCallback(async () => {
    const value = await getLuaPrice(sushi)
    setPrice(new BigNumber(value))
  }, [sushi])

  useEffect(() => {
    if (sushi) {
      fetchBalance()
    }
  }, [block, setPrice, sushi])

  return price
}

export default useLuaPrice
