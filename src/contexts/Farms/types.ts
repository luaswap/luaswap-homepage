import { Contract } from 'web3-eth-contract'

export interface Farm {
  pid: number
  name: string
  lpToken: string
  symbolShort: string
  lpTokenAddress: string
  lpContract: Contract
  tokenAddress: string
  token2Address: string
  earnToken: string
  earnTokenAddress: string
  icon: string
  icon2: string
  description: string
  isHot: boolean
  isNew: boolean
  id: string
  tokenSymbol: string
  token2Symbol: string
  protocal: string
  iconProtocal: string
  pairLink: string
  addLiquidityLink: string
  removeLiquidityLink: string
}

export interface FarmsContext {
  farms: Farm[]
  unharvested: number
}
