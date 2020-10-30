const LuaToken = artifacts.require('LuaToken');
const LuaMaker = artifacts.require('LuaMaker');
const MockERC20 = artifacts.require('MockERC20');
const UniswapV2Pair = artifacts.require('UniswapV2Pair');
const UniswapV2Factory = artifacts.require('UniswapV2Factory');
const UniswapV2Router02 = artifacts.require('UniswapV2Router02');
const LuaSafe = artifacts.require('LuaSafe');
const { expectRevert } = require('@openzeppelin/test-helpers');
const BN = require('bn.js')
contract('LuaMaker', ([alice, carol, minter]) => {
    beforeEach(async () => {
        this.factory = await UniswapV2Factory.new(alice, { from: alice });
        this.lua = await LuaToken.new(0, 2, { from: alice });
        this.luaSafe = await LuaSafe.new(this.lua.address, { from: alice });
        await this.lua.mint(minter, '1000000000000', { from: alice });
        await this.lua.mint(carol, '110000', { from: alice });
        this.weth = await MockERC20.new('WETH', 'WETH', '1000000000000', { from: minter });
        this.token1 = await MockERC20.new('TOKEN1', 'TOKEN', '1000000000000', { from: minter });
        this.token2 = await MockERC20.new('TOKEN2', 'TOKEN2', '1000000000000', { from: minter });
        this.token3 = await MockERC20.new('TOKEN3', 'TOKEN3', '1000000000000', { from: minter });
        this.uniswapV2Router02 = await UniswapV2Router02.new(this.factory.address, this.weth.address);
        this.maker = await LuaMaker.new(
            this.factory.address,
            this.uniswapV2Router02.address,
            [this.token1.address, this.weth.address, this.lua.address],
            this.luaSafe.address,
            this.lua.address,
            this.weth.address, { from: alice });
        this.luaWETH = await UniswapV2Pair.at((await this.factory.createPair(this.weth.address, this.lua.address)).logs[0].args.pair);
        this.wethToken1 = await UniswapV2Pair.at((await this.factory.createPair(this.weth.address, this.token1.address)).logs[0].args.pair);
        this.wethToken2 = await UniswapV2Pair.at((await this.factory.createPair(this.weth.address, this.token2.address)).logs[0].args.pair);
        this.token1Token2 = await UniswapV2Pair.at((await this.factory.createPair(this.token1.address, this.token2.address)).logs[0].args.pair);
        this.token1Token3 = await UniswapV2Pair.at((await this.factory.createPair(this.token1.address, this.token3.address)).logs[0].args.pair);
    });
    it('should make LUAs successfully with convert', async () => {
        await this.factory.setFeeTo(this.maker.address, { from: alice });
        
        await this.weth.transfer(this.luaWETH.address, '1000000000', { from: minter });
        await this.lua.transfer(this.luaWETH.address, '1000000000', { from: minter });
        await this.luaWETH.mint(minter);
        
        await this.weth.transfer(this.wethToken1.address, '10000000', { from: minter });
        await this.token1.transfer(this.wethToken1.address, '10000000', { from: minter });
        await this.wethToken1.mint(minter);
        
        await this.weth.transfer(this.wethToken2.address, '10000000', { from: minter });
        await this.token2.transfer(this.wethToken2.address, '10000000', { from: minter });
        await this.wethToken2.mint(minter);
        
        await this.token1.transfer(this.token1Token2.address, '10000000', { from: minter });
        await this.token2.transfer(this.token1Token2.address, '10000000', { from: minter });
        await this.token1Token2.mint(minter);

        await this.token1.transfer(this.token1Token3.address, '10000000', { from: minter });
        await this.token3.transfer(this.token1Token3.address, '10000000', { from: minter });
        await this.token1Token3.mint(minter);

        // Fake some revenue
        await this.token1.transfer(this.token1Token2.address, '100000', { from: minter });
        await this.token2.transfer(this.token1Token2.address, '100000', { from: minter });
        await this.token1Token2.sync();
        await this.token1.transfer(this.token1Token2.address, '10000000', { from: minter });
        await this.token2.transfer(this.token1Token2.address, '10000000', { from: minter });
        await this.token1Token2.mint(minter);
        // Maker should have the LP now
        assert.equal((await this.token1Token2.balanceOf(this.maker.address)).valueOf(), '12391');
        await this.maker.convert(this.token1.address, this.token2.address);
        assert.equal((await this.lua.balanceOf(this.luaSafe.address)).valueOf(), '24765');

        // Fake some revenue
        await this.token1.transfer(this.token1Token2.address, '100000', { from: minter });
        await this.token2.transfer(this.token1Token2.address, '100000', { from: minter });
        await this.token1Token2.sync();
        await this.token1.transfer(this.token1Token2.address, '10000000', { from: minter });
        await this.token2.transfer(this.token1Token2.address, '10000000', { from: minter });
        await this.token1Token2.mint(minter);

        await this.maker.convert(this.token1.address, this.token2.address);

        assert.equal((await this.lua.balanceOf(this.luaSafe.address)).valueOf(), '49467');
        assert.equal((await this.lua.balanceOf(this.maker.address)).valueOf(), '0');
        assert.equal((await this.token1Token2.balanceOf(this.maker.address)).valueOf(), '0');
        assert.equal((await this.token1.balanceOf(this.maker.address)).valueOf(), '0');
        assert.equal((await this.token2.balanceOf(this.maker.address)).valueOf(), '0');

        // Should also work for SUSHI-ETH pair
        await this.lua.transfer(this.luaWETH.address, '100000', { from: minter });
        await this.weth.transfer(this.luaWETH.address, '100000', { from: minter });
        await this.luaWETH.sync();
        await this.lua.transfer(this.luaWETH.address, '10000000', { from: minter });
        await this.weth.transfer(this.luaWETH.address, '10000000', { from: minter });
        await this.luaWETH.mint(minter);
        assert.equal((await this.luaWETH.balanceOf(this.maker.address)).valueOf(), '12511');

        await this.maker.convert(this.lua.address, this.weth.address);

        assert.equal((await this.lua.balanceOf(this.luaSafe.address)).valueOf(), '74438');
        assert.equal((await this.lua.balanceOf(this.maker.address)).valueOf(), '0');
        assert.equal((await this.luaWETH.balanceOf(this.maker.address)).valueOf(), '0');
        assert.equal((await this.weth.balanceOf(this.maker.address)).valueOf(), '0');

        await this.token1.transfer(this.wethToken1.address, '100000', { from: minter });
        await this.weth.transfer(this.wethToken1.address, '100000', { from: minter });
        await this.wethToken1.sync();
        await this.token1.transfer(this.wethToken1.address, '10000000', { from: minter });
        await this.weth.transfer(this.wethToken1.address, '10000000', { from: minter });
        await this.wethToken1.mint(minter);
        assert.equal((await this.wethToken1.balanceOf(this.maker.address)).valueOf(), '12397');

        await this.maker.convert(this.token1.address, this.weth.address);

        assert.equal((await this.lua.balanceOf(this.luaSafe.address)).valueOf(), '99286');
        assert.equal((await this.lua.balanceOf(this.maker.address)).valueOf(), '0');
        assert.equal((await this.wethToken1.balanceOf(this.maker.address)).valueOf(), '0');
        assert.equal((await this.weth.balanceOf(this.maker.address)).valueOf(), '0');
        assert.equal((await this.token1.balanceOf(this.maker.address)).valueOf(), '0');

        await this.token1.transfer(this.token1Token3.address, '100000', { from: minter });
        await this.token3.transfer(this.token1Token3.address, '100000', { from: minter });
        await this.token1Token3.sync();
        await this.token1.transfer(this.token1Token3.address, '10000000', { from: minter });
        await this.token3.transfer(this.token1Token3.address, '10000000', { from: minter });
        await this.token1Token3.mint(minter);
        assert.equal((await this.token1Token3.balanceOf(this.maker.address)).valueOf(), '12391');
        await this.maker.convert(this.token1.address, this.token3.address);

        assert.equal((await this.lua.balanceOf(this.luaSafe.address)).valueOf(), '111629');
        assert.equal((await this.lua.balanceOf(this.maker.address)).valueOf(), '0');
        assert.equal((await this.weth.balanceOf(this.maker.address)).valueOf(), '0');
        assert.equal((await this.token1.balanceOf(this.maker.address)).valueOf(), '0');
        assert.equal((await this.token2.balanceOf(this.maker.address)).valueOf(), '0');
        assert.equal((await this.token3.balanceOf(this.maker.address)).valueOf(), '12499');
        assert.equal((await this.token1Token3.balanceOf(this.maker.address)).valueOf(), '0');
    });
    it('should make LUAs successfully for eth-token pair', async () => {
        await this.factory.setFeeTo(this.maker.address, { from: alice });
        await this.weth.transfer(this.luaWETH.address, '10000000', { from: minter });
        await this.lua.transfer(this.luaWETH.address, '10000000', { from: minter });
        await this.luaWETH.mint(minter);
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
        await expectRevert(this.maker.removeLiqidity(this.token1.address, this.token2.address, (await this.token1Token2.balanceOf(this.maker.address)).valueOf(), { from: carol}), 'LuaMaker: no permistion');
        await expectRevert(this.maker.removeLiqidity(this.token1.address, this.token2.address, (await this.token1Token2.balanceOf(this.maker.address)).add(new BN('1000')), { from: alice} ), 'SafeMath: subtraction overflow');
        
        await this.maker.removeLiqidity(this.token1.address, this.token2.address, (await this.token1Token2.balanceOf(this.maker.address)).valueOf());
        //convert token to Lua
        await this.maker.marketBuyLuaWithToken([this.token1.address, this.weth.address, this.lua.address], (await this.token1.balanceOf(this.maker.address)), Date.now() + (60 * 3 * 1000));
        await this.maker.marketBuyLuaWithToken([this.token2.address, this.weth.address, this.lua.address], (await this.token2.balanceOf(this.maker.address)), Date.now() + (60 * 3 * 1000));
        assert.equal((await this.lua.balanceOf(this.luaSafe.address)).valueOf(), '24704');
        assert.equal((await this.token1Token2.balanceOf(this.maker.address)).valueOf(), '0');
        // Should also work for SUSHI-ETH pair
        await this.lua.transfer(this.luaWETH.address, '100000', { from: minter });
        await this.weth.transfer(this.luaWETH.address, '100000', { from: minter });
        await this.luaWETH.sync();
        await this.lua.transfer(this.luaWETH.address, '10000000', { from: minter });
        await this.weth.transfer(this.luaWETH.address, '10000000', { from: minter });
        await this.luaWETH.mint(minter);
        assert.equal((await this.luaWETH.balanceOf(this.maker.address)).valueOf(), '12397');
        await this.maker.removeLiqidity(this.lua.address, this.weth.address, (await this.luaWETH.balanceOf(this.maker.address)).valueOf());
        await this.maker.marketBuyLuaWithToken([this.weth.address, this.lua.address], (await this.weth.balanceOf(this.maker.address)).valueOf(), Date.now() + (60 * 3 * 1000));
        await this.maker.marketBuyLuaWithToken([this.lua.address, this.lua.address], (await this.lua.balanceOf(this.maker.address)).valueOf(), Date.now() + (60 * 3 * 1000));
        assert.equal((await this.lua.balanceOf(this.luaSafe.address)).valueOf(), '49656');
        assert.equal((await this.luaWETH.balanceOf(this.maker.address)).valueOf(), '0');
    });
    it('should make xLua', async () => {
        await this.lua.approve(this.luaSafe.address, '100000', { from: carol });
        await this.luaSafe.enter('100000', { from: carol });
        assert.equal((await this.luaSafe.balanceOf(carol)).valueOf(), '100000');
        await this.factory.setFeeTo(this.maker.address, { from: alice });
        await this.weth.transfer(this.luaWETH.address, '10000000', { from: minter });
        await this.lua.transfer(this.luaWETH.address, '10000000', { from: minter });
        await this.luaWETH.mint(minter);
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
        await this.maker.removeLiqidity(this.token1.address, this.token2.address, (await this.token1Token2.balanceOf(this.maker.address)).valueOf());
        //convert token to Lua
        //  await this.maker.marketBuyLuaWithToken([this.token1.address, this.weth.address,this.lua.address], Date.now() + (60*3*1000));
        //  await this.maker.marketBuyLuaWithToken([this.token2.address, this.weth.address,this.lua.address], Date.now() + (60*3*1000));

        // await expectRevert(this.maker.marketBuyLuaWithToken(this.token1.address, [5, 1, 2], Date.now() + (60*3*1000)), "LuaMaker: wrong path index")
        await expectRevert(
            this.maker.marketBuyLuaWithToken(
                [this.token1.address, this.token2.address, this.weth.address, this.lua.address], 
                (await this.token1.balanceOf(this.maker.address)).valueOf(),
                Date.now() + (60 * 3 * 1000)),
            "LuaMaker: wrong path"
        );
        await this.maker.marketBuyLuaWithToken(
            [this.token1.address, this.weth.address, this.lua.address], 
            (await this.token1.balanceOf(this.maker.address)).valueOf(),
            Date.now() + (60 * 3 * 1000));
        await this.maker.marketBuyLuaWithToken(
            [this.token2.address, this.weth.address, this.lua.address], 
            (await this.token2.balanceOf(this.maker.address)).valueOf(),
            Date.now() + (60 * 3 * 1000));

        assert.equal((await this.lua.balanceOf(this.luaSafe.address)).valueOf(), '124704');
        assert.equal((await this.token1Token2.balanceOf(this.maker.address)).valueOf(), '0');
        // Should also work for SUSHI-ETH pair
        await this.lua.transfer(this.luaWETH.address, '100000', { from: minter });
        await this.weth.transfer(this.luaWETH.address, '100000', { from: minter });
        await this.luaWETH.sync();
        await this.lua.transfer(this.luaWETH.address, '10000000', { from: minter });
        await this.weth.transfer(this.luaWETH.address, '10000000', { from: minter });
        await this.luaWETH.mint(minter);
        assert.equal((await this.luaWETH.balanceOf(this.maker.address)).valueOf(), '12397');
        await this.maker.removeLiqidity(this.lua.address, this.weth.address, (await this.luaWETH.balanceOf(this.maker.address)).valueOf());

        await this.maker.marketBuyLuaWithToken([this.weth.address, this.lua.address], (await this.weth.balanceOf(this.maker.address)).valueOf(), Date.now() + (60 * 3 * 1000));
        await this.maker.marketBuyLuaWithToken([this.lua.address, this.lua.address], (await this.lua.balanceOf(this.maker.address)).valueOf(), Date.now() + (60 * 3 * 1000));
        
        assert.equal((await this.lua.balanceOf(this.luaSafe.address)).valueOf(), '149656');
        assert.equal((await this.luaWETH.balanceOf(this.maker.address)).valueOf(), '0');
        await expectRevert(
            this.luaSafe.leave('110000', { from: carol }),
            'ERC20: burn amount exceeds balance',
        );
        await this.luaSafe.leave('100000', { from: carol });
        assert.equal((await this.luaSafe.balanceOf(carol)).valueOf(), '0');
        assert.equal((await this.luaSafe.totalSupply()).valueOf(), '0');
        assert.equal((await this.lua.balanceOf(carol)).valueOf(), '158908');
        assert.equal((await this.lua.balanceOf(this.luaSafe.address)).valueOf(), '748');
    });
});
