const { expectRevert, time } = require('@openzeppelin/test-helpers');
const LuaToken = artifacts.require('LuaToken');
const LuaMasterFarmer = artifacts.require('LuaMasterFarmer');
const MockERC20 = artifacts.require('MockERC20');
const UniswapV2Pair = artifacts.require('UniswapV2Pair');
const UniswapV2Factory = artifacts.require('UniswapV2Factory');
const Migrator = artifacts.require('Migrator');

contract('Migrator', ([alice, bob, dev, minter]) => {
    beforeEach(async () => {
        this.factoryOld = await UniswapV2Factory.new(alice, { from: alice });
        this.factoryNew = await UniswapV2Factory.new(alice, { from: alice });

        this.lua = await LuaToken.new(100, 190, { from: alice })

        this.weth = await MockERC20.new('WETH', 'WETH', '100000000', { from: minter });
        this.token = await MockERC20.new('TOKEN', 'TOKEN', '100000000', { from: minter });

        this.lpOld = await UniswapV2Pair.at((await this.factoryOld.createPair(this.weth.address, this.token.address)).logs[0].args.pair);
        this.lpNew = await UniswapV2Pair.at((await this.factoryNew.createPair(this.weth.address, this.token.address)).logs[0].args.pair);
        
        this.master = await LuaMasterFarmer.new(this.lua.address, dev, '1000', '0', '1000', { from: alice })
        
        this.migrator = await Migrator.new(this.master.address, this.factoryOld.address, this.factoryNew.address, '0');
        
        await this.lua.transferOwnership(this.master.address, { from: alice });
        await this.master.add('100', this.lpOld.address, true, { from: alice });
    });

    it('should do the migration successfully', async () => {
        // add liquidity factory 1
        await this.token.transfer(this.lpOld.address, '10000000', { from: minter });
        await this.weth.transfer(this.lpOld.address, '10000000', { from: minter });
        await this.lpOld.mint(minter);
        assert.equal((await this.lpOld.balanceOf(minter)).valueOf(), '9999000');

        //stake to master
        await this.lpOld.approve(this.master.address, '100000000000', { from: minter });
        await this.master.deposit('0', '9999000', { from: minter });
        assert.equal((await this.lpOld.balanceOf(this.master.address)).valueOf(), '9999000');

        await expectRevert(this.master.migrate(0), 'migrate: no migrator');

        await this.master.setMigrator(this.migrator.address, { from: alice });
        await expectRevert(this.master.migrate(0), 'migrate: bad');

        await this.factoryNew.setMigrator(this.migrator.address, { from: alice });
        await this.master.migrate(0);

        assert.equal((await this.lpOld.balanceOf(this.master.address)).valueOf(), '0');
        assert.equal((await this.lpNew.balanceOf(this.master.address)).valueOf(), '9999000');

        await this.master.withdraw('0', '9999000', { from: minter });
        await this.lpNew.transfer(this.lpNew.address, '9999000', { from: minter });
        await this.lpNew.burn(bob);
        assert.equal((await this.lpNew.balanceOf(this.master.address)).valueOf(), '0');
        assert.equal((await this.token.balanceOf(bob)).valueOf(), '9999000');
        assert.equal((await this.weth.balanceOf(bob)).valueOf(), '9999000');
    });

    it('should do the migration successfully with fake revenue', async () => {
        // add liquidity factory 1
        await this.token.transfer(this.lpOld.address, '10000000', { from: minter });
        await this.weth.transfer(this.lpOld.address, '10000000', { from: minter });
        await this.lpOld.mint(minter);
        assert.equal((await this.lpOld.balanceOf(minter)).valueOf(), '9999000');

        // // Add some fake revenue
        await this.token.transfer(this.lpOld.address, '100000', { from: minter });
        await this.weth.transfer(this.lpOld.address, '5000', { from: minter });
        await this.lpOld.sync();

        //stake to master
        await this.lpOld.approve(this.master.address, '100000000000', { from: minter });
        await this.master.deposit('0', '9999000', { from: minter });
        assert.equal((await this.lpOld.balanceOf(this.master.address)).valueOf(), '9999000');

        await expectRevert(this.master.migrate(0), 'migrate: no migrator');

        await this.master.setMigrator(this.migrator.address, { from: alice });
        await expectRevert(this.master.migrate(0), 'migrate: bad');

        await this.factoryNew.setMigrator(this.migrator.address, { from: alice });
        await this.master.migrate(0);

        assert.equal((await this.lpOld.balanceOf(this.master.address)).valueOf(), '0');
        this.lpNew = await UniswapV2Pair.at((await this.factoryNew.allPairs(0)));
        assert.equal((await this.lpNew.balanceOf(this.master.address)).valueOf(), '9999000');

        await this.master.withdraw('0', '9999000', { from: minter });
        await this.lpNew.transfer(this.lpNew.address, '9999000', { from: minter });
        await this.lpNew.burn(bob);
        assert.equal((await this.lpNew.balanceOf(this.master.address)).valueOf(), '0');
        assert.equal((await this.token.balanceOf(bob)).valueOf(), '10098990');
        assert.equal((await this.weth.balanceOf(bob)).valueOf(), '10003999');
    });

    it('should do the migration successfully', async () => {
        // add liquidity factory 1
        await this.token.transfer(this.lpOld.address, '10000000', { from: minter });
        await this.weth.transfer(this.lpOld.address, '10000000', { from: minter });
        await this.lpOld.mint(minter);
        assert.equal((await this.lpOld.balanceOf(minter)).valueOf(), '9999000');

        await this.token.transfer(bob, '10000000', { from: minter });
        await this.weth.transfer(bob, '10000000', { from: minter });
        
        await this.token.transfer(this.lpNew.address, '10000000', { from: bob });
        await this.weth.transfer(this.lpNew.address, '10000000', { from: bob });
        await this.lpNew.mint(bob);

        assert.equal((await this.lpNew.balanceOf(bob)).valueOf(), '9999000');

        //stake to master
        await this.lpOld.approve(this.master.address, '100000000000', { from: minter });
        await this.master.deposit('0', '9999000', { from: minter });
        assert.equal((await this.lpOld.balanceOf(this.master.address)).valueOf(), '9999000');

        await expectRevert(this.master.migrate(0), 'migrate: no migrator');

        await this.master.setMigrator(this.migrator.address, { from: alice });
        await this.factoryNew.setMigrator(this.migrator.address, { from: alice });
        await this.master.migrate(0);

        assert.equal((await this.lpOld.balanceOf(this.master.address)).valueOf(), '0');
        assert.equal((await this.lpNew.balanceOf(this.master.address)).valueOf(), '9999000');
        assert.equal((await this.lpNew.totalSupply().valueOf()), '19999000');

        await this.master.withdraw('0', '9999000', { from: minter });
        assert.equal((await this.lpNew.balanceOf(minter)).valueOf(), '9999000');
        await this.lpNew.transfer(this.lpNew.address, '9999000', { from: minter });
        await this.lpNew.burn(bob);
        assert.equal((await this.lpNew.balanceOf(this.master.address)).valueOf(), '0');

        assert.equal((await this.lpNew.balanceOf(minter)).valueOf(), '0');
        assert.equal((await this.lpNew.balanceOf(bob)).valueOf(), '9999000');

        assert.equal((await this.token.balanceOf(bob)).valueOf(), '9999000');
        assert.equal((await this.weth.balanceOf(bob)).valueOf(), '9999000');
    });

    it('should allow first minting from public only after migrator is gone', async () => {
        await this.factoryNew.setMigrator(this.migrator.address, { from: alice });
        this.tokenx = await MockERC20.new('TOKENX', 'TOKENX', '100000000', { from: minter });
        this.lpx = await UniswapV2Pair.at((await this.factoryNew.createPair(this.weth.address, this.tokenx.address)).logs[0].args.pair);
        await this.weth.transfer(this.lpx.address, '10000000', { from: minter });
        await this.tokenx.transfer(this.lpx.address, '500000', { from: minter });
        await expectRevert(this.lpx.mint(minter), 'Must not have migrator');
        await this.factoryNew.setMigrator('0x0000000000000000000000000000000000000000', { from: alice });
        await this.lpx.mint(minter);
    });
});