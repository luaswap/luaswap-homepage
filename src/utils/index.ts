import BigNumber from 'bignumber.js'

export const bnToDec = (bn: BigNumber, decimals = 18): number => {
  return bn.dividedBy(new BigNumber(10).pow(decimals)).toNumber()
}

export const decToBn = (dec: number, decimals = 18) => {
  return new BigNumber(dec).multipliedBy(new BigNumber(10).pow(decimals))
}

export const reduceFractionDigit = (number: number, digitAmount: number) =>
  Number(number).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: digitAmount,
  })

export const reduceLongNumber = (number: number) => {
  let result = Number(number) || 0
  let unit = ''

  if (result >= 1000000000) {
    result = result / 1000000000
    unit = 'B'
  } else if (result >= 1000000) {
    result = result / 1000000
    unit = 'M'
  } else if (result >= 1000) {
    result = result / 1000
    unit = 'K'
  }

  return `${reduceFractionDigit(result, 2)}${unit}`
}

export const redirectToUrl = (url: string) => {
  if (url && typeof url === 'string') {
    const link = document.createElement('a')

    link.href = url
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    link.remove()
  }
}
