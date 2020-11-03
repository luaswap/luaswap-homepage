import { useCallback, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'

import useSushi from './useSushi'
import axios from 'axios'
import config from '../config'
const useLuaPrice = () => {
  const [price, setPrice] = useState(new BigNumber(0))
  const sushi = useSushi()

  const fetchBalance = useCallback(async () => {
    var { data } = await axios.get(`${config.api}/price/LUA`)
    const value = data.usdPrice
    setPrice(new BigNumber(value * 10 ** 8))
  }, [sushi])

  useEffect(() => {
    if (sushi) {
      fetchBalance()
    }
  }, [setPrice, sushi])

  return price
}

export default useLuaPrice
