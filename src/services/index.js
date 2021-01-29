import axios from 'axios'
import BigNumber from 'bignumber.js'
import _get from 'lodash.get'
import { FACTORY_ADDRESS } from '../sushi/lib/constants'

const LUA_TOKEN_ADDRESS = '0xb1f66997a5760428d3a87d68b90bfe0ae64121cc'
const route = axios.create({
  baseURL: 'https://wallet.tomochain.com/api/luaswap',
})
const graphRoute = axios.create({
  baseURL: 'https://api.thegraph.com/subgraphs/name/phucngh/luaswap',
})
const blockRoute = axios.create({
  baseURL:
    'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
})

export const getLuaPrice = (callback) => {
  return route
    .get(`/price/LUA`)
    .then((res) => {
      if (typeof callback === 'function') {
        return callback(res)
      }
      return _get(res, 'data.usdPrice')
    })
    .catch((err) => {
      console.error('[ERROR]:', err)
      return 0
    })
}

export const getTotalSupply = (callback) => {
  const method = 'totalSupply():(uint256)'
  const cache = true

  return route
    .post(`/read/${LUA_TOKEN_ADDRESS}`, {
      method,
      cache,
      params: [],
    })
    .then((res) => {
      const totalSupply = _get(res, 'data.data')
      if (totalSupply) {
        const convertedNumber = new BigNumber(totalSupply)
          .div(10 ** 18)
          .toNumber()
        if (typeof callback === 'function') {
          return callback(convertedNumber)
        }
        return convertedNumber
      }
      return 0
    })
    .catch((err) => {
      console.error('[ERROR]:', err)
      return 0
    })
}

export const getTotalLiquidityData = (callback) => {
  const operationName = 'transactions'
  const query = `query transactions {
      uniswapFactories(
        first: 100
      ) {
        id
        totalLiquidityUSD
        totalVolumeUSD
      }
    }`
  const variables = {}

  return graphRoute
    .post('', {
      operationName,
      query,
      variables,
    })
    .then((res) => {
      if (_get(res, 'data.errors')) {
        console.error('[ERROR]:', _get(res, 'data.errors.message', ''))
        return {}
      }
      const result = _get(res, 'data.data.uniswapFactories', []).map(
        (item) => ({
          totalLiquidity: item.totalLiquidityUSD,
          volume: item.totalVolumeUSD,
        }),
      )[0]

      if (typeof callback === 'function') {
        return callback(result)
      }
      return result
    })
    .catch((err) => {
      console.error('[ERROR]:', err)
      return {}
    })
}

export const getBlockFromTimestamp = async (timestamp) => {
  const result = await blockRoute.post('', {
    query: `{
      blocks(
        first: 1
        orderBy: timestamp
        orderDirection: asc
        where: {
          ${timestamp ? `timestamp_gt: ${timestamp}` : ''}
        }
      ) {
        id
        number
        timestamp
      }
    }`,
  })

  if (
    !result ||
    _get(result, 'data.errors') ||
    _get(result, 'data.data.blocks.length') === 0
  ) {
    throw new Error('Failed to fetch block number from the subgraph.')
  }

  return _get(result, ['data', 'data', 'blocks', 0, 'number'])
}

const getFactoryQuery = (block) => {
  return `query uniswapFactories {
    uniswapFactories(
      ${block ? `block: { number: ${block} }` : ''}
      where: {
        id: "${FACTORY_ADDRESS}"
      }
    ) {
      id
      totalVolumeUSD
    }
  }`
}

export const get24hVolumeChange = async () => {
  const currentTime = Math.floor(new Date().getTime() / 1000)
  const lastDayBlockNumber = await getBlockFromTimestamp(currentTime - 86400)
  const [volumeData, lastDayVolumeData] = await Promise.all([
    await graphRoute.post('', {
      query: getFactoryQuery(),
    }),
    await graphRoute.post('', {
      query: getFactoryQuery(lastDayBlockNumber),
    }),
  ])

  if (
    !volumeData ||
    !lastDayVolumeData ||
    _get(volumeData, 'data.errors') ||
    _get(lastDayVolumeData, 'data.errors')
  ) {
    throw new Error('Failed to fetch volume changes from subgraph')
  }

  console.log('getVolume', volumeData)

  const currentVolume = Number(
    _get(
      volumeData,
      ['data', 'data', 'uniswapFactories', 0, 'totalVolumeUSD'],
      0,
    ),
  )
  const lastDayVolume = Number(
    _get(
      lastDayVolumeData,
      ['data', 'data', 'uniswapFactories', 0, 'totalVolumeUSD'],
      0,
    ),
  )

  return {
    value: currentVolume - lastDayVolume,
    percent: (currentVolume / lastDayVolume - 1) * 100,
  }
}
