import { useCallback, useEffect, useState } from 'react'
import Web3 from 'web3'
import { provider } from 'web3-core'
import { useWallet } from 'use-wallet'
import config from '../config'
import useSushi from './useSushi'
import { getNewRewardPerBlock } from '../sushi/utils'
import BigNumber from 'bignumber.js'
// import debounce from 'debounce'

var CACHE : any = {}

const useNewReward = (pid1 = 0) => {
  CACHE[pid1] = CACHE[pid1] || {
    time: 0,
    old: 10 * 60 * 1000,
    value: new BigNumber(0)
  }
  const sushi = useSushi()
  const [newReward, setNewRewad] = useState<BigNumber>(CACHE[pid1].value)
  
  useEffect(() => {
    async function fetchData() {
      const v = await getNewRewardPerBlock(sushi, pid1)
      CACHE[pid1].time = new Date().getTime()
      CACHE[pid1].value = v;

      localStorage.setItem(`CACHE_useNewReward${pid1}_time`, CACHE.time)
      localStorage.setItem(`CACHE_useNewReward${pid1}_value`, CACHE.value)
      setNewRewad(v)
    }
    if (sushi 
      && CACHE[pid1].time + CACHE[pid1].old <= new Date().getTime()) {
      fetchData()
    }
  }, [sushi, setNewRewad])

  return newReward
}

export default useNewReward
