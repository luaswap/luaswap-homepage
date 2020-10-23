import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import axios from 'axios'
import config from '../config'
import { supportedPools, START_NEW_POOL_AT } from './lib/constants'

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

const GAS_LIMIT = {
  STAKING: {
    DEFAULT: 200000,
    SNX: 850000,
  },
}

export async function UnknownBlock(address, method, params, cache) {
  var { data } = await axios.post(`${config.api}/read/${address}`, {
      method,
      params,
      cache
  })

  return data.data
}

export const getMasterChefAddress = (sushi) => {
  return sushi && sushi.masterChefAddress
}
export const getSushiAddress = (sushi) => {
  return sushi && sushi.sushiAddress
}

export const getMasterChefContract = (sushi) => {
  return sushi && sushi.contracts && sushi.contracts.masterChef
}
export const getSushiContract = (sushi) => {
  return sushi && sushi.contracts && sushi.contracts.sushi
}

export const getFarms = (sushi) => {
  return sushi
    ? sushi.contracts.pools.map(
        ({
          pid,
          name,
          symbol,
          icon,
          icon2,
          description,
          tokenAddress,
          tokenSymbol,
          token2Symbol,
          token2Address,
          symbolShort,
          tokenContract,
          token2Contract,
          isHot,
          isNew,
          lpAddress,
          lpContract,
          protocal,
          iconProtocal,
          pairLink,
          addLiquidityLink,
        }) => ({
          pid,
          id: symbol,
          name,
          lpToken: symbol,
          lpTokenAddress: lpAddress,
          lpContract,
          tokenAddress,
          token2Address,
          tokenSymbol,
          token2Symbol,
          token2Contract,
          symbol,
          symbolShort,
          isHot,
          isNew,
          tokenContract,
          earnToken: 'lua',
          earnTokenAddress: sushi.contracts.sushi.options.address,
          icon,
          icon2,
          description,
          protocal,
          iconProtocal,
          pairLink,
          addLiquidityLink,
        }),
      )
    : []
}

export const getPoolWeight = async (masterChefContract, pid) => {
  const { allocPoint } = await masterChefContract.methods.poolInfo(pid).call()
  const totalAllocPoint = await masterChefContract.methods
    .totalAllocPoint()
    .call()
  return new BigNumber(allocPoint).div(new BigNumber(totalAllocPoint))
}

export const getEarned = async (masterChefContract, pid, account) => {
  return masterChefContract.methods.pendingReward(pid, account).call()
}

export const getLPValue = async (
  masterChefContract,
  lpContract,
  tokenContract,
  token2Contract,
  pid,
) => {
  var usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7'
  var usdcAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
  var wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
  // Get balance of the token address
  const tokenAmountWholeLP = await tokenContract.methods
    .balanceOf(lpContract.options.address)
    .call()
  const tokenDecimals = await tokenContract.methods.decimals().call()
  // Get the share of lpContract that masterChefContract owns
  const balance = await lpContract.methods
    .balanceOf(masterChefContract.options.address)
    .call()
  // Convert that into the portion of total lpContract = p1
  const totalSupply = await lpContract.methods.totalSupply().call()
  // Get total token2 value for the lpContract = w1
  const lpContractToken2 = await token2Contract.methods
    .balanceOf(lpContract.options.address)
    .call()

  const token2Decimals = await token2Contract.methods.decimals().call()
  // Return p1 * w1 * 2
  const portionLp = new BigNumber(balance).div(new BigNumber(totalSupply))
  const totalLpToken2Value = portionLp.times(lpContractToken2).times(new BigNumber(2))
  // Calculate
  const tokenAmount = new BigNumber(tokenAmountWholeLP)
    .times(portionLp)
    .div(new BigNumber(10).pow(tokenDecimals))

  const token2Amount = new BigNumber(lpContractToken2)
    .times(portionLp)
    .div(new BigNumber(10).pow(token2Decimals))

  var usdValue = 0;
  var totalToken2Value = totalLpToken2Value.div(new BigNumber(10).pow(token2Decimals))
  if (token2Contract._address.toLowerCase() == usdtAddress 
    || token2Contract._address.toLowerCase() == usdcAddress) {
    usdValue = totalToken2Value
  } 
  else if (token2Contract._address.toLowerCase() == wethAddress) {
    var { data } = await axios.get(`${config.api}/price/ETH`)
    usdValue = totalToken2Value.times(data.usdPrice)
  }
  
  return {
    pid,
    tokenAmount,
    token2Amount,
    totalToken2Value,
    tokenPriceInToken2: token2Amount.div(tokenAmount),
    usdValue,
    poolWeight: await getPoolWeight(masterChefContract, pid),
  }
}

export const getLPTokenStaked = async (
  sushi,
  lpContract,
) => {
  var chef = getMasterChefContract(sushi)
  return new BigNumber(
    await UnknownBlock(lpContract._address, 'balanceOf(address):(uint256)', [chef.options.address], true)
  )
}

export const approve = async (lpContract, masterChefContract, account) => {
  return lpContract.methods
    .approve(masterChefContract.options.address, ethers.constants.MaxUint256)
    .send({ from: account })
}

export const getSushiSupply = async (sushi) => {
  return new BigNumber(
    await UnknownBlock(sushi.contracts.sushi._address, 'totalSupply():(uint256)', [], true)
  )
}

export const getLuaCirculatingSupply = async (sushi) => {
  var chef = getMasterChefContract(sushi)
  var a = new BigNumber(
    await UnknownBlock(sushi.contracts.sushi._address, 'circulatingSupply():(uint256)', [], true)
  )

  var b = new BigNumber(
    await UnknownBlock(sushi.contracts.sushi._address, 'balanceOf(address):(uint256)', [chef._address], true)
  )
  return a.minus(b)
}

export const checkPoolActive = async (pid) => {
  var p = supportedPools.find(e => e.pid === pid)
  if (p) {
    if (p.startAt >= new Date().getTime() / 1000) {
      return false
    }
    else if (!p.startAt) {
      return true
    }
    else {
      if (localStorage.getItem('POOLACTIVE' + pid + '-' + p.startAt)) {
        return true
      }
      else {
        var { data } = await axios.get(`${config.api}/poolActive/${pid}`)
        if (data.active) {
          localStorage.setItem('POOLACTIVE' + pid + '-' + p.startAt, true)
        }
        return data.active
      }
    }
  }
  else {
    return false
  }

}

export const getNewRewardPerBlock = async (sushi, pid1 = 0) => {
  if (pid1 === 0) {
    var chef = getMasterChefContract(sushi)
    return new BigNumber(
      await UnknownBlock(chef._address, 'getNewRewardPerBlock(uint256):(uint256)', [pid1], true)
    )
  }
  else {
    if (await checkPoolActive(pid1 - 1)) {
      var chef = getMasterChefContract(sushi)
      return new BigNumber(
        await UnknownBlock(chef._address, 'getNewRewardPerBlock(uint256):(uint256)', [pid1], true)
      )
    }
    else {
      return new BigNumber("0")
    }
  }
}

export const stake = async (masterChefContract, pid, amount, account) => {
  return masterChefContract.methods
    .deposit(
      pid,
      new BigNumber(amount).times(new BigNumber(10).pow(18)).toString(),
    )
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}

export const unstake = async (masterChefContract, pid, amount, account) => {
  return masterChefContract.methods
    .withdraw(
      pid,
      new BigNumber(amount).times(new BigNumber(10).pow(18)).toString(),
    )
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}
export const harvest = async (masterChefContract, pid, account) => {
  return masterChefContract.methods
    .claimReward(pid)
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}

export const getStaked = async (masterChefContract, pid, account) => {
  try {
    const { amount } = await masterChefContract.methods
      .userInfo(pid, account)
      .call()
    return new BigNumber(amount)
  } catch {
    return new BigNumber(0)
  }
}

export const redeem = async (masterChefContract, account) => {
  let now = new Date().getTime() / 1000
  if (now >= 1597172400) {
    return masterChefContract.methods
      .exit()
      .send({ from: account })
      .on('transactionHash', (tx) => {
        console.log(tx)
        return tx.transactionHash
      })
  } else {
    alert('pool not active')
  }
}

export const getCanUnlockLua = async (sushi, account) => {
  var lua = getSushiContract(sushi)

  return new BigNumber(await lua.methods.canUnlockAmount(account).call())
}


export const getLockOf = async (sushi, account) => {
  var lua = getSushiContract(sushi)

  return new BigNumber(await lua.methods.lockOf(account).call())
}

export const unlock = async (sushi, account) => {
  var lua = getSushiContract(sushi)
  return lua.methods
    .unlock()
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}