const { expectRevert } = require('@openzeppelin/test-helpers');
const LuaToken = artifacts.require('LuaToken');
const LuaSafe = artifacts.require('LuaSafe');

contract('LuaSafe', ([alice, bob, carol]) => {
    beforeEach(async () => {
        this.sushi = await LuaToken.new(0, 100, { from: alice });
        this.bar = await LuaSafe.new(this.sushi.address, { from: alice });
        this.sushi.mint(alice, '100000', { from: alice });
        this.sushi.mint(bob, '100000', { from: alice });
        this.sushi.mint(carol, '100000', { from: alice });
    });

    it('should not allow enter if not enough approve', async () => {
        await expectRevert(
            this.bar.enter('100000', { from: alice }),
            'ERC20: transfer amount exceeds allowance',
        );
        await this.sushi.approve(this.bar.address, '50000', { from: alice });
        await expectRevert(
            this.bar.enter('100000', { from: alice }),
            'ERC20: transfer amount exceeds allowance',
        );
        await this.sushi.approve(this.bar.address, '100000', { from: alice });
        await this.bar.enter('100000', { from: alice });
        assert.equal((await this.bar.balanceOf(alice)).valueOf(), '100000');
    });

    it('should not allow withraw more than what you have', async () => {
        await this.sushi.approve(this.bar.address, '100000', { from: alice });
        await this.bar.enter('100000', { from: alice });
        await expectRevert(
            this.bar.leave('200000', { from: alice }),
            'ERC20: burn amount exceeds balance',
        );
    });

    it('should work with more than one participant', async () => {
        await this.sushi.approve(this.bar.address, '100000', { from: alice });
        await this.sushi.approve(this.bar.address, '100000', { from: bob });
        // Alice enters and gets 20 shares. Bob enters and gets 10 shares.
        await this.bar.enter('20000', { from: alice });
        await this.bar.enter('10000', { from: bob });

        assert.equal((await this.bar.balanceOf(alice)).valueOf(), '20000');
        assert.equal((await this.bar.balanceOf(bob)).valueOf(), '10000');
        assert.equal((await this.sushi.balanceOf(this.bar.address)).valueOf(), '30000');

        // LuaSafe get 20 more SUSHIs from an external source.
        await this.sushi.transfer(this.bar.address, '20000', { from: carol });

        // Alice deposits 10 more SUSHIs. She should receive 10*30/50 = 6 shares.
        await this.bar.enter('10000', { from: alice });
        assert.equal((await this.bar.balanceOf(alice)).valueOf(), '26000');
        assert.equal((await this.bar.balanceOf(bob)).valueOf(), '10000');
        // Bob withdraws 5 shares. He should receive 5000*60000/36000 = 8333 shares
        await this.bar.leave('5000', { from: bob });

        assert.equal((await this.bar.balanceOf(alice)).valueOf(), '26000');
        assert.equal((await this.bar.balanceOf(bob)).valueOf(), '5000');

        assert.equal((await this.sushi.balanceOf(this.bar.address)).valueOf(), '51708');

        assert.equal((await this.sushi.balanceOf(alice)).valueOf(), '70000');
        assert.equal((await this.sushi.balanceOf(bob)).valueOf(), '98292');
    });
});