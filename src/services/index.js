import axios from 'axios'
import BigNumber from 'bignumber.js'
import _get from 'lodash.get'
import { FACTORY_ADDRESS, FACTORY_ADDRESS_TOMOCHAIN } from '../sushi/lib/constants'

const LUA_TOKEN_ADDRESS = '0xb1f66997a5760428d3a87d68b90bfe0ae64121cc'
const route = axios.create({
  baseURL: 'https://wallet.tomochain.com/api/luaswap',
})
const graphRouteEthereum = axios.create({
  baseURL: 'https://api.thegraph.com/subgraphs/name/phucngh/luaswap',
})
const blockRouteEthereum = axios.create({
  baseURL:
    'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
})

const graphRouteTomoChain = axios.create({
  baseURL: 'https://api.luaswap.org/subgraphs/name/phucngh/Luaswap',
})
const blockRouteTomoChain = axios.create({
  baseURL:
    'https://api.luaswap.org/subgraphs/name/phucngh/ethereum-blocks',
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

  const promiseArr = [
    new Promise((resolve, reject) => {
      graphRouteEthereum
      .post('', {
        operationName,
        query,
        variables,
      }).then((res) => {
        resolve(res)
      }).catch((err) => {
        reject(err)
      })
    }),
    new Promise((resolve, reject) => {
      graphRouteTomoChain
      .post('', {
        operationName,
        query,
        variables,
      }).then((res) => {
        resolve(res)
      }).catch((err) => {
        reject(err)
      })
    })
  ]

  return Promise.all(promiseArr)
    .then(([resEthereum, resTomoChain]) => {
      if (_get(resEthereum, 'data.errors')) {
        console.error('[ERROR]:', _get(resEthereum, 'data.errors.message', ''))
        return {}
      }
      if (_get(resTomoChain, 'data.errors')) {
        console.error('[ERROR]:', _get(resTomoChain, 'data.errors.message', ''))
        return {}
      }

      const resultEther = _get(resEthereum, 'data.data.uniswapFactories', []).map(
        (item) => ({
          totalLiquidity: item.totalLiquidityUSD,
          volume: item.totalVolumeUSD,
        }),
      )[0]

      const resultTomoChain = _get(resTomoChain, 'data.data.uniswapFactories', []).map(
        (item) => ({
          totalLiquidity: item.totalLiquidityUSD,
          volume: item.totalVolumeUSD,
        }),
      )[0]

      if (typeof callback === 'function') {
        return callback({
          totalLiquidity: new BigNumber(resultEther.totalLiquidity).plus(resultTomoChain.totalLiquidity).toString(),
          volume: new BigNumber(resultEther.volume).plus(resultTomoChain.volume).toString()
        })
      }
      return {
        totalLiquidity: new BigNumber(resultEther.totalLiquidity).plus(resultTomoChain.totalLiquidity).toString(),
        volume: new BigNumber(resultEther.volume).plus(resultTomoChain.volume).toString()
      }
    })
    .catch((err) => {
      console.error('[ERROR]:', err)
      return {}
    })
}

export const getBlockEthereumFromTimestamp = async (timestamp) => {
  const result = await blockRouteEthereum.post('', {
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

export const getBlockTomoChainFromTimestamp = async (timestamp) => {
  const result = await blockRouteTomoChain.post('', {
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

const getFactoryQueryOnTomoChain = (block) => {
  return `query uniswapFactories {
    uniswapFactories(
      ${block ? `block: { number: ${block} }` : ''}
      where: {
        id: "${FACTORY_ADDRESS_TOMOCHAIN}"
      }
    ) {
      id
      totalVolumeUSD
    }
  }`
}



export const get24hVolumeChange = async () => {
  const currentTime = Math.floor(new Date().getTime() / 1000)
  const lastDayBlockNumberEthereum = await getBlockEthereumFromTimestamp(currentTime - 86400)
  const [volumeDataEthereum, lastDayVolumeDataEtherum] = await Promise.all([
    await graphRouteEthereum.post('', {
      query: getFactoryQuery(),
    }),
    await graphRouteEthereum.post('', {
      query: getFactoryQuery(lastDayBlockNumberEthereum),
    }),
  ])

  const lastDayBlockNumberTomoChain = await getBlockTomoChainFromTimestamp(currentTime - 86400)
  const [volumeDataTomoChain, lastDayVolumeDataTomoChain] = await Promise.all([
    await graphRouteTomoChain.post('', {
      query: getFactoryQueryOnTomoChain(),
    }),
    await graphRouteTomoChain.post('', {
      query: getFactoryQueryOnTomoChain(lastDayBlockNumberTomoChain),
    }),
  ])

  if (
    !volumeDataEthereum ||
    !lastDayVolumeDataEtherum ||
    _get(volumeDataEthereum, 'data.errors') ||
    _get(lastDayVolumeDataEtherum, 'data.errors')
  ) {
    throw new Error('Failed to fetch volume changes from subgraph')
  }

  if (
    !volumeDataTomoChain ||
    !lastDayVolumeDataTomoChain ||
    _get(volumeDataTomoChain, 'data.errors') ||
    _get(lastDayVolumeDataTomoChain, 'data.errors')
  ) {
    throw new Error('Failed to fetch volume changes from subgraph')
  }

  const currentVolumeEthereum = Number(
    _get(
      volumeDataEthereum,
      ['data', 'data', 'uniswapFactories', 0, 'totalVolumeUSD'],
      0,
    ),
  )
  const lastDayVolumeEthereum = Number(
    _get(
      lastDayVolumeDataEtherum,
      ['data', 'data', 'uniswapFactories', 0, 'totalVolumeUSD'],
      0,
    ),
  )

  const currentVolumeTomoChain = Number(
    _get(
      volumeDataTomoChain,
      ['data', 'data', 'uniswapFactories', 0, 'totalVolumeUSD'],
      0,
    ),
  )
  const lastDayVolumeTomoChain = Number(
    _get(
      lastDayVolumeDataTomoChain,
      ['data', 'data', 'uniswapFactories', 0, 'totalVolumeUSD'],
      0,
    ),
  )

  return {
    value: (currentVolumeEthereum + currentVolumeTomoChain) - (lastDayVolumeEthereum + lastDayVolumeTomoChain),
    percent: ((currentVolumeEthereum + currentVolumeTomoChain) / (lastDayVolumeEthereum + lastDayVolumeTomoChain) - 1) * 100,
  }
}
