import { useCallback, useEffect, useState } from 'react'
import { provider } from 'web3-core'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'

import { getEarned, getMasterChefContract, getFarms } from '../sushi/utils'
import useSushi from './useSushi'
import useBlock from './useBlock'

import config from '../config'
import axios from 'axios'


const useAllEarnings = () => {
  const [balances, setBalance] = useState([] as Array<BigNumber>)
  const { account }: { account: string; ethereum: provider } = useWallet()
  const sushi = useSushi()
  const farms = getFarms(sushi)
  const masterChefContract = getMasterChefContract(sushi)
  const block = useBlock()

  const fetchAllBalances = useCallback(async () => {
    // const balances: Array<BigNumber> = await Promise.all(
    //   farms.map(({ pid }: { pid: number }) =>
    //     getEarned(masterChefContract, pid, account),
    //   ),
    // )
    // setBalance(balances)

    const data: Array<BigNumber> = await Promise.all(
      farms.map(({ pid }: any) => new Promise(async (resolve) => {
        var { data } = await axios.get(`${config.api}/poolActive/${pid}`)
        if (data.active) {
          resolve(await getEarned(masterChefContract, pid, account))
        }
        else {
          resolve("0")
        }

      }))
    )

    console.log(data)

    setBalance(data)
  }, [account, masterChefContract, sushi])

  useEffect(() => {
    if (account && masterChefContract && sushi) {
      fetchAllBalances()
    }
  }, [account, block, masterChefContract, setBalance, sushi])

  return balances
}

export default useAllEarnings
