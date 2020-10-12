import BigNumber from 'bignumber.js/bignumber'

export const SUBTRACT_GAS_LIMIT = 100000
export const START_REWARD_AT_BLOCK = 10950600 // TODO
export const NUMBER_BLOCKS_PER_YEAR = 2425000

export const START_NEW_POOL_AT = 1602565208

const ONE_MINUTE_IN_SECONDS = new BigNumber(60)
const ONE_HOUR_IN_SECONDS = ONE_MINUTE_IN_SECONDS.times(60)
const ONE_DAY_IN_SECONDS = ONE_HOUR_IN_SECONDS.times(24)
const ONE_YEAR_IN_SECONDS = ONE_DAY_IN_SECONDS.times(365)

export const INTEGERS = {
  ONE_MINUTE_IN_SECONDS,
  ONE_HOUR_IN_SECONDS,
  ONE_DAY_IN_SECONDS,
  ONE_YEAR_IN_SECONDS,
  ZERO: new BigNumber(0),
  ONE: new BigNumber(1),
  ONES_31: new BigNumber('4294967295'), // 2**32-1
  ONES_127: new BigNumber('340282366920938463463374607431768211455'), // 2**128-1
  ONES_255: new BigNumber(
    '115792089237316195423570985008687907853269984665640564039457584007913129639935',
  ), // 2**256-1
  INTEREST_RATE_BASE: new BigNumber('1e18'),
}

export const addressMap = {
  uniswapFactory: '0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95',
  uniswapFactoryV2: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
  YFI: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
  YCRV: '0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8',
  UNIAmpl: '0xc5be99a02c6857f9eac67bbce58df5572498f40c',
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  UNIRouter: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  MKR: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
  SNX: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
  COMP: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
  LEND: '0x80fB784B7eD66730e8b1DBd9820aFD29931aab03',
  SUSHIYCRV: '0x2C7a51A357d5739C5C74Bf3C96816849d2c9F726',
}

// TODO: change the address & set LP pool
export const contractAddresses = {
  sushi: {
    1: '0xB1f66997A5760428D3a87D68b90BfE0aE64121cC',
    99: '0x9FB56E17EF76Eb21d89d2Ec73058245844e70E3d',
  },
  masterChef: {
    1: '0xb67D7a6644d9E191Cac4DA2B88D6817351C7fF62',
    99: '0xA49D353dd804f516bcd500D1Dd6eE72675CF498d',
  }
}

/*
UNI-V2 LP Address on mainnet for reference
==========================================
0  USDT 0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852
1  USDC 0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc
2  DAI  0xa478c2975ab1ea89e8196811f51a7b7ade33eb11
3  sUSD 0xf80758ab42c3b07da84053fd88804bcb6baa4b5c
4  COMP 0xcffdded873554f362ac02f8fb1f02e5ada10516f
5  LEND 0xab3f9bf1d81ddb224a2014e98b238638824bcf20
6  SNX  0x43ae24960e5534731fc831386c07755a2dc33d47
7  UMA  0x88d97d199b9ed37c29d846d00d443de980832a22
8  LINK 0xa2107fa5b38d9bbd2c461d6edf11b11a50f6b974
9  BAND 0xf421c3f2e695c2d4c0765379ccace8ade4a480d9
10 AMPL 0xc5be99a02c6857f9eac67bbce58df5572498f40c
11 YFI  0x2fdbadf3c4d5a8666bc06645b8358ab803996e28
12 SUSHI 0xce84867c3c02b05dc570d0135103d3fb9cc19433
*/

export const supportedPools = [
  {
    pid: 3,
    lpAddresses: {
      1: '0x25a17a5a907941aaf6d6d1c7aae9c9cc3a38680c',
    },
    tokenAddresses: {
      1: '0xb1f66997a5760428d3a87d68b90bfe0ae64121cc',
    },
    token2Addresses: {
      1: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
    },
    name: 'LUA - USDC',
    symbol: 'LUA-USDC UNI-V2 LP',
    symbolShort: 'LUA-USDC',
    description: `Deposit LUA-USDC UNI-V2 LP Earn 2xLUA`,
    tokenSymbol: 'LUA',
    token2Symbol: 'USDC',
    icon: 'https://luaswap.org/favicon.png',
    icon2: 'https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png',
    isHot: true,
    isNew: false,
    protocal: 'UniSwap',
    iconProtocal: 'https://uniswap.info/static/media/logo_white.edb44e56.svg',
    pairLink: 'https://uniswap.info/pair/0x25a17a5a907941aaf6d6d1c7aae9c9cc3a38680c',
    addLiquidityLink: 'https://app.uniswap.org/#/add/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/0xb1f66997a5760428d3a87d68b90bfe0ae64121cc'
  },
  {
    pid: 0,
    lpAddresses: {
      1: '0x5c89674c4ad1ccd10a29bcc9aabc303cd5f2da1d',
    },
    tokenAddresses: {
      1: '0x05d3606d5c81eb9b7b18530995ec9b29da05faba',
    },
    token2Addresses: {
      1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
    },
    name: 'TOMOE - ETH',
    symbol: 'TOMOE-ETH UNI-V2 LP',
    symbolShort: 'TOMOE-ETH',
    description: `Deposit TOMOE-ETH UNI-V2 LP Earn LUA`,
    tokenSymbol: 'TOMOE',
    token2Symbol: 'ETH',
    icon: 'https://wallet.tomochain.com/public/imgs/tomoiconwhite.png',
    icon2: 'https://s2.coinmarketcap.com/static/img/coins/128x128/1027.png',
    isHot: false,
    isNew: false,
    protocal: 'UniSwap',
    iconProtocal: 'https://uniswap.info/static/media/logo_white.edb44e56.svg',
    pairLink: 'https://uniswap.info/pair/0x5c89674c4ad1ccd10a29bcc9aabc303cd5f2da1d',
    addLiquidityLink: 'https://app.uniswap.org/#/add/0x05d3606d5c81eb9b7b18530995ec9b29da05faba/ETH'
  },
  {
    pid: 1,
    lpAddresses: {
      1: '0xcad93baf5cc5ebfe7f8a485828f0c0ecd2d0e9b8',
    },
    tokenAddresses: {
      1: '0x05d3606d5c81eb9b7b18530995ec9b29da05faba',
    },
    token2Addresses: {
      1: '0xdac17f958d2ee523a2206206994597c13d831ec7'
    },
    name: 'TOMOE - USDT',
    symbol: 'TOMOE-USDT UNI-V2 LP',
    symbolShort: 'TOMOE-USDT',
    description: `Deposit TOMOE-USDT UNI-V2 LP Earn LUA`,
    tokenSymbol: 'TOMOE',
    token2Symbol: 'USDT',
    icon: 'https://wallet.tomochain.com/public/imgs/tomoiconwhite.png',
    icon2: 'https://s2.coinmarketcap.com/static/img/coins/128x128/825.png',
    isHot: false,
    isNew: false,
    protocal: 'UniSwap',
    iconProtocal: 'https://uniswap.info/static/media/logo_white.edb44e56.svg',
    pairLink: 'https://uniswap.info/pair/0xcad93baf5cc5ebfe7f8a485828f0c0ecd2d0e9b8',
    addLiquidityLink: 'https://app.uniswap.org/#/add/0x05d3606d5c81eb9b7b18530995ec9b29da05faba/0xdac17f958d2ee523a2206206994597c13d831ec7'
  }, 
  {
    pid: 2,
    lpAddresses: {
      1: '0xf3279a15f5361285100474db389f7d78848bb8d1',
    },
    tokenAddresses: {
      1: '0x05d3606d5c81eb9b7b18530995ec9b29da05faba',
    },

    token2Addresses: {
      1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    },
    name: 'TOMOE - USDC',
    symbol: 'TOMOE-USDC UNI-V2 LP',
    symbolShort: 'TOMOE-USDC',
    description: `Deposit TOMOE-USDC UNI-V2 LP Earn LUA`,
    tokenSymbol: 'TOMOE',
    token2Symbol: 'USDC',
    icon: 'https://wallet.tomochain.com/public/imgs/tomoiconwhite.png',
    icon2: 'https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png',
    isHot: false,
    isNew: false,
    protocal: 'UniSwap',
    iconProtocal: 'https://uniswap.info/static/media/logo_white.edb44e56.svg',
    pairLink: 'https://uniswap.info/pair/0xf3279a15f5361285100474db389f7d78848bb8d1',
    addLiquidityLink: 'https://app.uniswap.org/#/add/0x05d3606d5c81eb9b7b18530995ec9b29da05faba/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
  },


  {
    pid: 4,
    lpAddresses: {
      1: '0x9ccc3e17ae1d1438bacde4d906cdc56bb6937e46',
    },
    tokenAddresses: {
      1: '0xb1f66997a5760428d3a87d68b90bfe0ae64121cc',
    },

    token2Addresses: {
      1: '0x05d3606d5c81eb9b7b18530995ec9b29da05faba'
    },
    name: 'LUA - TOMOE',
    symbol: 'LUA-TOMOE UNI-V2 LP',
    symbolShort: 'LUA-TOMOE',
    description: `Deposit LUA-TOMOE UNI-V2 LP Earn LUA`,
    tokenSymbol: 'LUA',
    token2Symbol: 'TOMOE',
    icon: 'https://luaswap.org/favicon.png',
    icon2: 'https://wallet.tomochain.com/public/imgs/tomoiconwhite.png',
    isHot: false,
    isNew: false,
    protocal: 'UniSwap',
    iconProtocal: 'https://uniswap.info/static/media/logo_white.edb44e56.svg',
    pairLink: 'https://uniswap.info/pair/0x9ccc3e17ae1d1438bacde4d906cdc56bb6937e46',
    addLiquidityLink: 'https://app.uniswap.org/#/add/0x05d3606d5c81eb9b7b18530995ec9b29da05faba/0xb1f66997a5760428d3a87d68b90bfe0ae64121cc'
  },
  
  {
    pid: 5,
    lpAddresses: {
      1: '0x5c47016e8a4a3c6a7c46a765f81dce205d00393e',
    },
    tokenAddresses: {
      1: '0xb1f66997a5760428d3a87d68b90bfe0ae64121cc',
    },

    token2Addresses: {
      1: '0xf8c3527cc04340b208c854e985240c02f7b7793f'
    },
    name: 'LUA - FRONT',
    symbol: 'LUA-FRONT UNI-V2 LP',
    symbolShort: 'LUA-FRONT',
    description: `Deposit LUA-FRONT UNI-V2 LP Earn LUA`,
    tokenSymbol: 'LUA',
    token2Symbol: 'FRONT',
    icon: 'https://luaswap.org/favicon.png',
    icon2: 'https://s2.coinmarketcap.com/static/img/coins/128x128/5893.png',
    isHot: false,
    isNew: false,
    protocal: 'UniSwap',
    iconProtocal: 'https://uniswap.info/static/media/logo_white.edb44e56.svg',
    pairLink: 'https://uniswap.info/pair/0x5c47016e8a4a3c6a7c46a765f81dce205d00393e',
    addLiquidityLink: 'https://app.uniswap.org/#/add/0xb1f66997a5760428d3a87d68b90bfe0ae64121cc/0xf8c3527cc04340b208c854e985240c02f7b7793f'
  },

  {
    pid: 6,
    lpAddresses: {
      1: '0xfe1ead71b27e8389d819ee0a420080d90a60132c',
    },
    tokenAddresses: {
      1: '0xb1f66997a5760428d3a87d68b90bfe0ae64121cc',
    },

    token2Addresses: {
      1: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2'
    },
    name: 'LUA - SUSHI',
    symbol: 'LUA-SUSHI UNI-V2 LP',
    symbolShort: 'LUA-SUSHI',
    description: `Deposit LUA-SUSHI UNI-V2 LP Earn LUA`,
    tokenSymbol: 'LUA',
    token2Symbol: 'SUSHI',
    icon: 'https://luaswap.org/favicon.png',
    icon2: 'https://s2.coinmarketcap.com/static/img/coins/128x128/6758.png',
    isHot: false,
    isNew: false,
    protocal: 'UniSwap',
    iconProtocal: 'https://uniswap.info/static/media/logo_white.edb44e56.svg',
    pairLink: 'https://uniswap.info/pair/0xfe1ead71b27e8389d819ee0a420080d90a60132c',
    addLiquidityLink: 'https://app.uniswap.org/#/add/0x6b3595068778dd592e39a122f4f5a5cf09c90fe2/0xb1f66997a5760428d3a87d68b90bfe0ae64121cc'
  },

  {
    pid: 7,
    lpAddresses: {
      1: '0x694ad474ef16a8eefb5cc3119f9956aeef28c987',
    },
    tokenAddresses: {
      1: '0xb1f66997a5760428d3a87d68b90bfe0ae64121cc',
    },

    token2Addresses: {
      1: '0x476c5e26a75bd202a9683ffd34359c0cc15be0ff'
    },
    name: 'LUA - SRM',
    symbol: 'LUA-SRM UNI-V2 LP',
    symbolShort: 'LUA-SRM',
    description: `Deposit LUA-SRM UNI-V2 LP Earn LUA`,
    tokenSymbol: 'LUA',
    token2Symbol: 'SRM',
    icon: 'https://luaswap.org/favicon.png',
    icon2: 'https://s2.coinmarketcap.com/static/img/coins/128x128/6187.png',
    isHot: false,
    isNew: true,
    protocal: 'UniSwap',
    iconProtocal: 'https://uniswap.info/static/media/logo_white.edb44e56.svg',
    pairLink: 'https://uniswap.info/pair/0x694ad474ef16a8eefb5cc3119f9956aeef28c987',
    addLiquidityLink: 'https://app.uniswap.org/#/add/0x476c5e26a75bd202a9683ffd34359c0cc15be0ff/0xb1f66997a5760428d3a87d68b90bfe0ae64121cc'
  },

  {
    pid: 8,
    lpAddresses: {
      1: '0xf0ec5e8ea37911dec8e8e9bc940e9dba2de60706',
    },
    tokenAddresses: {
      1: '0xb1f66997a5760428d3a87d68b90bfe0ae64121cc',
    },

    token2Addresses: {
      1: '0x50d1c9771902476076ecfc8b2a83ad6b9355a4c9'
    },
    name: 'LUA - FTT',
    symbol: 'LUA-FTT UNI-V2 LP',
    symbolShort: 'LUA-FTT',
    description: `Deposit LUA-FTT UNI-V2 LP Earn LUA`,
    tokenSymbol: 'LUA',
    token2Symbol: 'FTT',
    icon: 'https://luaswap.org/favicon.png',
    icon2: 'https://s2.coinmarketcap.com/static/img/coins/128x128/4195.png',
    isHot: false,
    isNew: true,
    protocal: 'UniSwap',
    iconProtocal: 'https://uniswap.info/static/media/logo_white.edb44e56.svg',
    pairLink: 'https://info.uniswap.org/pair/0xf0ec5e8ea37911dec8e8e9bc940e9dba2de60706',
    addLiquidityLink: 'https://app.uniswap.org/#/add/0x50d1c9771902476076ecfc8b2a83ad6b9355a4c9/0xb1f66997a5760428d3a87d68b90bfe0ae64121cc'
  },

  {
    pid: 9,
    lpAddresses: {
      1: '0xc5d3c66133a6264b0f2e712b8e10ef96efb93eb2',
    },
    tokenAddresses: {
      1: '0xb1f66997a5760428d3a87d68b90bfe0ae64121cc',
    },

    token2Addresses: {
      1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
    },
    name: 'LUA - ETH',
    symbol: 'LUA-ETH UNI-V2 LP',
    symbolShort: 'LUA-ETH',
    description: `Deposit LUA-ETH UNI-V2 LP Earn LUA`,
    tokenSymbol: 'LUA',
    token2Symbol: 'ETH',
    icon: 'https://luaswap.org/favicon.png',
    icon2: 'https://s2.coinmarketcap.com/static/img/coins/128x128/1027.png',
    isHot: false,
    isNew: true,
    protocal: 'UniSwap',
    iconProtocal: 'https://uniswap.info/static/media/logo_white.edb44e56.svg',
    pairLink: 'https://info.uniswap.org/pair/0xc5d3c66133a6264b0f2e712b8e10ef96efb93eb2',
    addLiquidityLink: 'https://app.uniswap.org/#/add/0xb1f66997a5760428d3a87d68b90bfe0ae64121cc/ETH'
  },

  {
    pid: 10,
    lpAddresses: {
      1: '0x9af4fb969bb16038d7618df8adbdb2e7133b0f66',
    },
    tokenAddresses: {
      1: '0xb1f66997a5760428d3a87d68b90bfe0ae64121cc',
    },

    token2Addresses: {
      1: '0xd9ec3ff1f8be459bb9369b4e79e9ebcf7141c093'
    },
    name: 'LUA - KAI',
    symbol: 'LUA-KAI UNI-V2 LP',
    symbolShort: 'LUA-KAI',
    description: `Deposit LUA-KAI UNI-V2 LP Earn LUA`,
    tokenSymbol: 'LUA',
    token2Symbol: 'KAI',
    icon: 'https://luaswap.org/favicon.png',
    icon2: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xD9Ec3ff1f8be459Bb9369b4E79e9Ebcf7141C093/logo.png',
    isHot: false,
    isNew: true,
    protocal: 'UniSwap',
    iconProtocal: 'https://uniswap.info/static/media/logo_white.edb44e56.svg',
    pairLink: 'https://info.uniswap.org/pair/0x9af4fb969bb16038d7618df8adbdb2e7133b0f66',
    addLiquidityLink: 'https://app.uniswap.org/#/add/0xb1f66997a5760428d3a87d68b90bfe0ae64121cc/0xd9ec3ff1f8be459bb9369b4e79e9ebcf7141c093'
  },

  {
    pid: 11,
    lpAddresses: {
      1: '0x9ccb79d6523152aee4dc2be5822fdbafd0d63211',
    },
    tokenAddresses: {
      1: '0xb1f66997a5760428d3a87d68b90bfe0ae64121cc',
    },

    token2Addresses: {
      1: '0x2baecdf43734f22fd5c152db08e3c27233f0c7d2'
    },
    name: 'LUA - OM',
    symbol: 'LUA-OM UNI-V2 LP',
    symbolShort: 'LUA-OM',
    description: `Deposit LUA-OM UNI-V2 LP Earn LUA`,
    tokenSymbol: 'LUA',
    token2Symbol: 'OM',
    icon: 'https://luaswap.org/favicon.png',
    icon2: 'https://s2.coinmarketcap.com/static/img/coins/128x128/6536.png',
    isHot: false,
    isNew: true,
    protocal: 'UniSwap',
    iconProtocal: 'https://uniswap.info/static/media/logo_white.edb44e56.svg',
    pairLink: 'https://info.uniswap.org/pair/0x9ccb79d6523152aee4dc2be5822fdbafd0d63211',
    addLiquidityLink: 'https://app.uniswap.org/#/add/0x2baecdf43734f22fd5c152db08e3c27233f0c7d2/0xb1f66997a5760428d3a87d68b90bfe0ae64121cc'
  },
]
