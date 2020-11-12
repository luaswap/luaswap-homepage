import { useCallback, useEffect, useState } from 'react'
import { provider } from 'web3-core'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { Contract } from 'web3-eth-contract'

import {
  getMasterChefContract,
  getFarms,
  getLPValue,
} from '../sushi/utils'
import useSushi from './useSushi'
import useBlock from './useBlock'
import axios from 'axios'
import config from '../config'

export interface StakedValue {
  lpAddresses: string
  lpBalance: BigNumber
  token0Addresses: string
  token0Symbol: string
  token0Balance: BigNumber
  token1Addresses: string
  token1Symbol: string
  token1Balance: BigNumber
}
var CACHE : {time: any, old: any, value: any} = {
  time: 0,
  old: 5 * 1000,
  value: []
}

const useAllMakerValue = () => {
  const [balances, setBalance] = useState(CACHE.value as Array<StakedValue>)

  const fetchMakerValue = useCallback(async () => {
    const { data: balances } = await axios.get(`${config.api}/makerData`)
    CACHE.time = new Date().getTime()
    CACHE.value = balances;
    setBalance(balances)
  }, [])

  useEffect(() => {
    const interval = setInterval(async () => {
      fetchMakerValue()
    }, 15000)

    fetchMakerValue()

    return () => clearInterval(interval)
  }, [])

  // useEffect(() => {
  //   if (CACHE.time + CACHE.old <= new Date().getTime()) {
  //       fetchMakerValue()
  //   }
  // })

  return balances
}

export default useAllMakerValue
