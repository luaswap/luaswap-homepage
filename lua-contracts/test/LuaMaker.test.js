const LuaToken = artifacts.require('LuaToken');
const LuaMaker = artifacts.require('LuaMaker');
const MockERC20 = artifacts.require('MockERC20');
const UniswapV2Pair = artifacts.require('UniswapV2Pair');
const UniswapV2Factory = artifacts.require('UniswapV2Factory');
const UniswapV2Router02 = artifacts.require('UniswapV2Router02');
const LuaSafe = artifacts.require('LuaSafe');
const { expectRevert } = require('@openzeppelin/test-helpers');
contract('LuaMaker', ([alice, carol, minter]) => {
    beforeEach(async () => {
        this.factory = await UniswapV2Factory.new(alice, { from: alice });
        this.sushi = await LuaToken.new(0, 2, { from: alice });
        this.luaSafe = await LuaSafe.new(this.sushi.address, { from: alice });
        await this.sushi.mint(minter, '100000000', { from: alice });
        await this.sushi.mint(carol, '110000', { from: alice });
        this.weth = await MockERC20.new('WETH', 'WETH', '100000000', { from: minter });
        this.token1 = await MockERC20.new('TOKEN1', 'TOKEN', '100000000', { from: minter });
        this.token2 = await MockERC20.new('TOKEN2', 'TOKEN2', '100000000', { from: minter });
        this.uniswapV2Router02 = await UniswapV2Router02.new(this.factory.address, this.weth.address);
        this.maker = await LuaMaker.new(
            this.factory.address, 
            this.uniswapV2Router02.address, 
            [this.token1.address, this.weth.address, this.sushi.address],
            this.luaSafe.address, 
            this.sushi.address);
        this.sushiWETH = await UniswapV2Pair.at((await this.factory.createPair(this.weth.address, this.sushi.address)).logs[0].args.pair);
        this.wethToken1 = await UniswapV2Pair.at((await this.factory.createPair(this.weth.address, this.token1.address)).logs[0].args.pair);
        this.wethToken2 = await UniswapV2Pair.at((await this.factory.createPair(this.weth.address, this.token2.address)).logs[0].args.pair);
        this.token1Token2 = await UniswapV2Pair.at((await this.factory.createPair(this.token1.address, this.token2.address)).logs[0].args.pair);
    });
    // it('should make SUSHIs successfully for eth-token pair', async () => {
    //    await this.factory.setFeeTo(this.maker.address, { from: alice });
    //     await this.weth.transfer(this.sushiWETH.address, '10000000', { from: minter });
    //     await this.sushi.transfer(this.sushiWETH.address, '10000000', { from: minter });
    //     await this.sushiWETH.mint(minter);
    //     await this.weth.transfer(this.wethToken1.address, '10000000', { from: minter });
    //     await this.token1.transfer(this.wethToken1.address, '10000000', { from: minter });
    //     await this.wethToken1.mint(minter);
    //     await this.weth.transfer(this.wethToken2.address, '10000000', { from: minter });
    //     await this.token2.transfer(this.wethToken2.address, '10000000', { from: minter });
    //     await this.wethToken2.mint(minter);
    //     await this.token1.transfer(this.token1Token2.address, '10000000', { from: minter });
    //     await this.token2.transfer(this.token1Token2.address, '10000000', { from: minter });
    //     await this.token1Token2.mint(minter);
    //     // Fake some revenue
    //     await this.token1.transfer(this.token1Token2.address, '100000', { from: minter });
    //     await this.token2.transfer(this.token1Token2.address, '100000', { from: minter });
    //     await this.token1Token2.sync();
    //     await this.token1.transfer(this.token1Token2.address, '10000000', { from: minter });
    //     await this.token2.transfer(this.token1Token2.address, '10000000', { from: minter });
    //     await this.token1Token2.mint(minter);
    //     // Maker should have the LP now
    //     assert.equal((await this.token1Token2.balanceOf(this.maker.address)).valueOf(), '12391');
    //     // After calling convert, bar should have SUSHI value at ~1/6 of revenue
    //     await this.maker.removeLiqidity(this.token1.address, this.token2.address);
    //     //convert token to Lua
    //     await this.maker.marketBuyLuaWithToken([this.token1.address, this.weth.address,this.sushi.address], Date.now() + (60*3*1000));
    //     await this.maker.marketBuyLuaWithToken([this.token2.address, this.weth.address,this.sushi.address], Date.now() + (60*3*1000));
    //     assert.equal((await this.sushi.balanceOf(this.luaSafe.address)).valueOf(), '24704');
    //     assert.equal((await this.token1Token2.balanceOf(this.maker.address)).valueOf(), '0');
    //     // Should also work for SUSHI-ETH pair
    //     await this.sushi.transfer(this.sushiWETH.address, '100000', { from: minter });
    //     await this.weth.transfer(this.sushiWETH.address, '100000', { from: minter });
    //     await this.sushiWETH.sync();
    //     await this.sushi.transfer(this.sushiWETH.address, '10000000', { from: minter });
    //     await this.weth.transfer(this.sushiWETH.address, '10000000', { from: minter });
    //     await this.sushiWETH.mint(minter);
    //     assert.equal((await this.sushiWETH.balanceOf(this.maker.address)).valueOf(), '12397');
    //     await this.maker.removeLiqidity(this.sushi.address, this.weth.address);
    //     await this.maker.marketBuyLuaWithToken([this.weth.address, this.sushi.address], Date.now() + (60*3*1000));
    //     await this.maker.marketBuyLuaWithToken([this.sushi.address, this.sushi.address], Date.now() + (60*3*1000));
    //     assert.equal((await this.sushi.balanceOf(this.luaSafe.address)).valueOf(), '49656');
    //     assert.equal((await this.sushiWETH.balanceOf(this.maker.address)).valueOf(), '0');
    // });
    it('should make xLua', async () => {
        await this.sushi.approve(this.luaSafe.address, '100000', { from: carol });
        await this.luaSafe.enter('100000', { from: carol });
        assert.equal((await this.luaSafe.balanceOf(carol)).valueOf(), '100000');
        console.log('Safe-carol: ',(await this.luaSafe.balanceOf(carol)).valueOf());
        await this.factory.setFeeTo(this.maker.address, { from: alice });
         await this.weth.transfer(this.sushiWETH.address, '10000000', { from: minter });
         await this.sushi.transfer(this.sushiWETH.address, '10000000', { from: minter });
         await this.sushiWETH.mint(minter);
         await this.weth.transfer(this.wethToken1.address, '10000000', { from: minter });
         await this.token1.transfer(this.wethToken1.address, '10000000', { from: minter });
         await this.wethToken1.mint(minter);
         await this.weth.transfer(this.wethToken2.address, '10000000', { from: minter });
         await this.token2.transfer(this.wethToken2.address, '10000000', { from: minter });
         await this.wethToken2.mint(minter);
         await this.token1.transfer(this.token1Token2.address, '10000000', { from: minter });
         await this.token2.transfer(this.token1Token2.address, '10000000', { from: minter });
         await this.token1Token2.mint(minter);
         // Fake some revenue
         await this.token1.transfer(this.token1Token2.address, '100000', { from: minter });
         await this.token2.transfer(this.token1Token2.address, '100000', { from: minter });
         await this.token1Token2.sync();
         await this.token1.transfer(this.token1Token2.address, '10000000', { from: minter });
         await this.token2.transfer(this.token1Token2.address, '10000000', { from: minter });
         await this.token1Token2.mint(minter);
         // Maker should have the LP now
         assert.equal((await this.token1Token2.balanceOf(this.maker.address)).valueOf(), '12391');
         // After calling convert, bar should have SUSHI value at ~1/6 of revenue
         await this.maker.removeLiqidity(this.token1.address, this.token2.address);
         //convert token to Lua
        //  await this.maker.marketBuyLuaWithToken([this.token1.address, this.weth.address,this.sushi.address], Date.now() + (60*3*1000));
        //  await this.maker.marketBuyLuaWithToken([this.token2.address, this.weth.address,this.sushi.address], Date.now() + (60*3*1000));

        // await expectRevert(this.maker.marketBuyLuaWithToken(this.token1.address, [5, 1, 2], Date.now() + (60*3*1000)), "LuaMaker: wrong path index")
        await expectRevert(
            this.maker.marketBuyLuaWithToken([this.token1.address, this.token2.address, this.weth.address, this.sushi.address], Date.now() + (60*3*1000)),
            "LuaMaker: wrong path"
        );
        await this.maker.marketBuyLuaWithToken([this.token1.address, this.weth.address, this.sushi.address], Date.now() + (60*3*1000));
        await this.maker.marketBuyLuaWithToken([this.token2.address, this.weth.address, this.sushi.address], Date.now() + (60*3*1000));
         
         assert.equal((await this.sushi.balanceOf(this.luaSafe.address)).valueOf(), '124704');
         assert.equal((await this.token1Token2.balanceOf(this.maker.address)).valueOf(), '0');
         // Should also work for SUSHI-ETH pair
         await this.sushi.transfer(this.sushiWETH.address, '100000', { from: minter });
         await this.weth.transfer(this.sushiWETH.address, '100000', { from: minter });
         await this.sushiWETH.sync();
         await this.sushi.transfer(this.sushiWETH.address, '10000000', { from: minter });
         await this.weth.transfer(this.sushiWETH.address, '10000000', { from: minter });
         await this.sushiWETH.mint(minter);
         assert.equal((await this.sushiWETH.balanceOf(this.maker.address)).valueOf(), '12397');
         await this.maker.removeLiqidity(this.sushi.address, this.weth.address);
         
         await this.maker.marketBuyLuaWithToken([this.weth.address, this.sushi.address], Date.now() + (60*3*1000));
         await this.maker.marketBuyLuaWithToken([this.sushi.address], Date.now() + (60*3*1000));
         
         assert.equal((await this.sushi.balanceOf(this.luaSafe.address)).valueOf(), '149656');
         assert.equal((await this.sushiWETH.balanceOf(this.maker.address)).valueOf(), '0');
         console.log('carol xLua: ',(await this.luaSafe.balanceOf(carol)).valueOf());
         console.log('carol Lua: ',(await this.sushi.balanceOf(carol)).valueOf());
         await expectRevert(
            this.luaSafe.leave('110000', { from: carol }),
            'ERC20: burn amount exceeds balance',
        );
        await this.luaSafe.leave('100000', { from: carol });
        assert.equal((await this.luaSafe.balanceOf(carol)).valueOf(), '0');
        assert.equal((await this.luaSafe.totalSupply()).valueOf(), '0');
        console.log('carol xLua affter leave: ',(await this.luaSafe.balanceOf(carol)).valueOf());
        console.log('carol Lua affter leave: ',(await this.sushi.balanceOf(carol)).valueOf());
        console.log('Safe Lua affter leave: ',(await this.sushi.balanceOf(this.luaSafe.address)).valueOf());
        console.log('Safe xLua affter leave: ',(await this.luaSafe.balanceOf(this.luaSafe.address)).valueOf());
        //assert.equal((await this.sushi.balanceOf(this.luaSafe.address)).valueOf(), '49656');
     });
});