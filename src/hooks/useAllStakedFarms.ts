import { useCallback, useEffect, useState } from 'react'
import { provider } from 'web3-core'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { Contract } from 'web3-eth-contract'

import {
  getMasterChefContract,
  getFarms,
  getStaked, getEarned, checkPoolActive
} from '../sushi/utils'
import useSushi from './useSushi'
import useBlock from './useBlock'
import config from '../config'
import axios from 'axios'

export interface StakedFarm {
  tokenAmount: BigNumber
  pendingReward: BigNumber
  name: string
  id: string
  symbol: string
  symbolShort: string
  icon: string
  icon2: string
  pid: number
}

const useAllStakedFarms = () => {
  const [stakedFarms, setStakedFarms] = useState([] as Array<StakedFarm>)
  const { account }: { account: string; ethereum: provider } = useWallet()
  const sushi = useSushi()
  const farms = getFarms(sushi)
  const masterChefContract = getMasterChefContract(sushi)
  const block = 0//useBlock()

  const fetchData = useCallback(async () => {
    const data: Array<StakedFarm> = await Promise.all(
      farms.map(({ pid, name, symbol, symbolShort, icon, icon2, id }: any) => new Promise(async (resolve) => {
        
        if (await checkPoolActive(pid)) {
          var v = {
            id,
            pid: pid,
            name: name,
            icon,
            icon2,
            symbol: symbol,
            symbolShort: symbolShort,
            tokenAmount: await getStaked(masterChefContract, pid, account),
            pendingReward: new BigNumber(await getEarned(masterChefContract, pid, account))
          }
          resolve(v)
        }
        else {
          resolve(false)
        }

      }))
    )

    setStakedFarms(data.filter(e => e && e.tokenAmount.isGreaterThan(0)))
  }, [account, masterChefContract, sushi])

  useEffect(() => {
    if (account && masterChefContract && sushi) {
      fetchData()
    }
  }, [account, block, masterChefContract, setStakedFarms, sushi])

  return stakedFarms
}

export default useAllStakedFarms
