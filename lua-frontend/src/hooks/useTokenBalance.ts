import { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'

import { getBalance } from '../utils/erc20'
import useBlock from './useBlock'

var CACHE = {
  time: 0,
  old: 30 * 1000,
  value: new BigNumber(0)
}

const useTokenBalance = (tokenAddress: string) => {
  const [balance, setBalance] = useState(CACHE.value)
  const {
    account,
    ethereum,
  }: { account: string; ethereum: provider } = useWallet()
  const block = 0 //useBlock()

  const fetchBalance = useCallback(async () => {
    const balance = await getBalance(ethereum, tokenAddress, account)
    CACHE.value = new BigNumber(balance)
    CACHE.time = new Date().getTime()
    setBalance(new BigNumber(balance))
  }, [account, ethereum, tokenAddress])

  useEffect(() => {
    if (account 
      && ethereum 
      && CACHE.time + CACHE.old <= new Date().getTime()) {
      fetchBalance()
    }
  }, [account, ethereum, setBalance, block, tokenAddress])

  return balance
}

export default useTokenBalance
