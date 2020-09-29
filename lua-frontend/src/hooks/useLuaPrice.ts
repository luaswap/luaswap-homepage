import { useCallback, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'

import { getLuaPrice} from '../sushi/utils'
import useSushi from './useSushi'

const useLuaPrice = () => {
  const [price, setPrice] = useState(new BigNumber(0))
  const sushi = useSushi()

  const fetchBalance = useCallback(async () => {
    const value = await getLuaPrice(sushi)
    setPrice(new BigNumber(value))
  }, [sushi])

  useEffect(() => {
    if (sushi) {
      fetchBalance()
    }
  }, [setPrice, sushi])

  return price
}

export default useLuaPrice
