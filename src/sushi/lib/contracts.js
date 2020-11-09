import BigNumber from 'bignumber.js/bignumber'
import ERC20Abi from './abi/erc20.json'
import MasterChefAbi from './abi/masterchef.json'
import XSushiAbi from './abi/xsushi.json'
import makerAbi from './abi/maker.json'
import SushiAbi from './abi/sushi.json'
import UNIV2PairAbi from './abi/uni_v2_lp.json'
import WETHAbi from './abi/weth.json'
import {
  contractAddresses,
  SUBTRACT_GAS_LIMIT,
  supportedPools,
} from './constants.js'
import * as Types from './types.js'

export class Contracts {
  constructor(provider, networkId, web3, options) {
    this.web3 = web3
    this.defaultConfirmations = options.defaultConfirmations
    this.autoGasMultiplier = options.autoGasMultiplier || 1.5
    this.confirmationType =
      options.confirmationType || Types.ConfirmationType.Confirmed
    this.defaultGas = options.defaultGas
    this.defaultGasPrice = options.defaultGasPrice

    this.sushi = new this.web3.eth.Contract(SushiAbi)
    this.masterChef = new this.web3.eth.Contract(MasterChefAbi)
    this.xSushiStaking = new this.web3.eth.Contract(XSushiAbi)
    this.weth = new this.web3.eth.Contract(WETHAbi)
    this.maker = new this.web3.eth.Contract(makerAbi)

    this.pools = supportedPools.map((pool) =>
      Object.assign(pool, {
        lpAddress: pool.lpAddresses[networkId],
        tokenAddress: pool.tokenAddresses[networkId],
        token2Address: pool.token2Addresses[networkId],
        lpContract: new this.web3.eth.Contract(UNIV2PairAbi),
        tokenContract: new this.web3.eth.Contract(ERC20Abi),
        token2Contract: new this.web3.eth.Contract(ERC20Abi),
      }),
    )

    this.setProvider(provider, networkId)
    this.setDefaultAccount(this.web3.eth.defaultAccount)
  }

  setProvider(provider, networkId) {
    const setProvider = (contract, address) => {
      contract.setProvider(provider)
      if (address) contract.options.address = address
      else console.error('Contract address not found in network', networkId)
    }

    setProvider(this.sushi, contractAddresses.sushi[networkId])
    setProvider(this.masterChef, contractAddresses.masterChef[networkId])
    setProvider(this.maker, contractAddresses.maker[networkId])


    // setProvider(this.sushi, contractAddresses.sushi[networkId])
    // setProvider(this.masterChef, contractAddresses.masterChef[networkId])
    setProvider(this.xSushiStaking, contractAddresses.xSushi[networkId])
    // setProvider(this.weth, contractAddresses.weth[networkId])

    this.pools.forEach(
      ({ lpContract, lpAddress, tokenContract, token2Contract, token2Address, tokenAddress }) => {
        setProvider(lpContract, lpAddress)
        setProvider(tokenContract, tokenAddress)
        setProvider(token2Contract, token2Address)
      },
    )
  }

  setDefaultAccount(account) {
    this.sushi.options.from = account
    this.masterChef.options.from = account
  }
}
