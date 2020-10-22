const { expectRevert, time } = require('@openzeppelin/test-helpers');
const { assertion } = require('@openzeppelin/test-helpers/src/expectRevert');
const ethers = require('ethers');
const UniswapV2Factory = artifacts.require('UniswapV2Factory');
const UniswapV2Pair = artifacts.require('UniswapV2Pair');
const MockERC20 = artifacts.require('MockERC20');
const BigNumber = require('bn.js')
var BN = (s) => new BigNumber(s.toString(), 10)

const MINIMUM_LIQUIDITY = 1000

function getAmountOut(amountIn, reserveIn, reserveOut, swapFee) {
  var amountInWithFee = amountIn.mul(BN(1000).sub(swapFee));
  var numerator = amountInWithFee.mul(reserveOut);
  var denominator = reserveIn.mul(BN(1000)).add(amountInWithFee);
  return numerator.div(denominator);
}

contract('UniswapV2Pair', ([alice, bob, dev, minter]) => {
  beforeEach(async () => {
    this.factory = await UniswapV2Factory.new(alice, { from: alice });
    this.token0 = await MockERC20.new('TOKEN0', 'TOKEN0', '10000000', { from: alice });
    this.token1 = await MockERC20.new('TOKEN1', 'TOKEN1', '10000000', { from: alice });
    this.pair = await UniswapV2Pair.at((await this.factory.createPair(this.token0.address, this.token1.address)).logs[0].args.pair);
  });


  it('mint', async () => {
    await this.token0.transfer(this.pair.address, '1000000', { from: alice })
    await this.token1.transfer(this.pair.address, '1000000', { from: alice })
    await this.pair.mint(alice, { from: alice })

    assert.equal((await this.pair.totalSupply()).valueOf(), 1000000)
    assert.equal((await this.pair.balanceOf(alice)).valueOf(), 1000000 - MINIMUM_LIQUIDITY)
    const reserves = await this.pair.getReserves()
    assert.equal(reserves[0].valueOf(), 1000000)
    assert.equal(reserves[1].valueOf(), 1000000)
  })

  it('burn: without fee', async () => {
    await this.token0.transfer(this.pair.address, '1000000', { from: alice })
    await this.token1.transfer(this.pair.address, '1000000', { from: alice })
    await this.pair.mint(alice, { from: alice })

    await this.pair.transfer(this.pair.address, 1000000 - MINIMUM_LIQUIDITY, { from: alice})
    await this.pair.burn(alice, { from: alice })

    assert.equal((await this.pair.totalSupply()).valueOf(), MINIMUM_LIQUIDITY)
    assert.equal((await this.pair.balanceOf(alice)).valueOf(), 0)
    const reserves = await this.pair.getReserves()
    assert.equal(reserves[0].valueOf(), MINIMUM_LIQUIDITY)
    assert.equal(reserves[1].valueOf(), MINIMUM_LIQUIDITY)
  })

  it('burn: with fee', async () => {
    await this.factory.setWithdrawFeeTo(bob, { from: alice })

    await this.token0.transfer(this.pair.address, '1000000', { from: alice })
    await this.token1.transfer(this.pair.address, '1000000', { from: alice })
    await this.pair.mint(alice, { from: alice })

    await this.pair.transfer(this.pair.address, 1000000 - MINIMUM_LIQUIDITY, { from: alice})
    await this.pair.burn(alice, { from: alice })

    assert.equal((await this.pair.totalSupply()).valueOf(), MINIMUM_LIQUIDITY + 999)
    assert.equal((await this.pair.balanceOf(alice)).valueOf(), 0)
    assert.equal((await this.token0.balanceOf(alice)).valueOf(), 9998001)
    assert.equal((await this.token1.balanceOf(alice)).valueOf(), 9998001)
    assert.equal((await this.pair.balanceOf(bob)).valueOf(), 999)
    const reserves = await this.pair.getReserves()
    assert.equal(reserves[0].valueOf(), 1999)
    assert.equal(reserves[1].valueOf(), 1999)
  })
  
})
