import BigNumber from 'bignumber.js'
import React, { memo, useEffect, useState } from 'react'
import CountUp from 'react-countup'
import useAllStakedValue from '../../../hooks/useAllStakedValue'

const TotalLockValue = memo(() => {
  const stakedValue = useAllStakedValue() 
  const [start, setStart] = useState(0)
  const [end, setEnd] = useState(0)
  const [scale, setScale] = useState(1)

  let sumEarning = 0
  for (let e of stakedValue) {
    sumEarning += (e.usdValue as any)
  }

  useEffect(() => {
    setStart(end)
    setEnd(sumEarning)
  }, [sumEarning])

  return (
    <span
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'right bottom',
        transition: 'transform 0.5s',
        display: 'inline-block',
      }}
    >
      <CountUp
        start={start}
        end={end}
        decimals={end < 0 ? 4 : end > 1e5 ? 0 : 3}
        duration={1}
        onStart={() => {
          setScale(1.05)
          setTimeout(() => setScale(1), 600)
        }}
        separator=","
      />
    </span>
  )
})

export default TotalLockValue
