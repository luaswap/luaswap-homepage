const { expectRevert, time } = require('@openzeppelin/test-helpers')
const LuaToken = artifacts.require('LuaToken')

contract('LuaToken', ([alice, bob, carol, tom]) => {
    beforeEach(async () => {
        this.lua = await LuaToken.new(100, 190, { from: alice })
    })

    it('should have correct setting', async () => {
        const name = await this.lua.name()
        const symbol = await this.lua.symbol()
        const decimals = await this.lua.decimals()
        const cap = await this.lua.cap()
        assert.equal(name.valueOf(), 'LuaToken')
        assert.equal(symbol.valueOf(), 'LUA')
        assert.equal(decimals.valueOf(), '18')
        assert.equal(cap.valueOf(), 500000000e18)
        assert.equal((await this.lua.lockFromBlock()).valueOf(), "100")
        assert.equal((await this.lua.lockToBlock()).valueOf(), "190")
        assert.equal((await this.lua.totalLock()).valueOf(), "0")
        assert.equal((await this.lua.circulatingSupply()).valueOf(), "0")
    })

    it('should fail, mint over token', async () => {
        await expectRevert(
            this.lua.mint(alice, '100000000000000000000000000000000', { from: alice }),
            'ERC20Capped: cap exceeded',
        )
    })

    it('should only allow owner to mint token', async () => {
        await this.lua.mint(alice, '100', { from: alice })
        await this.lua.mint(bob, '1000', { from: alice })
        await expectRevert(
            this.lua.mint(carol, '1000', { from: bob }),
            'Ownable: caller is not the owner',
        )
        const totalSupply = await this.lua.totalSupply()
        const aliceBal = await this.lua.balanceOf(alice)
        const bobBal = await this.lua.balanceOf(bob)
        const carolBal = await this.lua.balanceOf(carol)
        assert.equal(totalSupply.valueOf(), '1100')
        assert.equal(aliceBal.valueOf(), '100')
        assert.equal(bobBal.valueOf(), '1000')
        assert.equal(carolBal.valueOf(), '0')
    })

    it('should supply token transfers properly', async () => {
        await this.lua.mint(alice, '500', { from: alice })
        await this.lua.transfer(carol, '200', { from: alice })
        await this.lua.transfer(bob, '100', { from: carol })
        const bobBal = await this.lua.balanceOf(bob)
        const carolBal = await this.lua.balanceOf(carol)
        assert.equal(bobBal.valueOf(), '100')
        assert.equal(carolBal.valueOf(), '100')
    })

    it('should fail if you try to do bad transfers', async () => {
        await this.lua.mint(alice, '500', { from: alice })
        await this.lua.transfer(carol, '10', { from: alice })
        await expectRevert(
            this.lua.transfer(bob, '110', { from: carol }),
            'ERC20: transfer amount exceeds balance',
        )
        await expectRevert(
            this.lua.transfer(carol, '1', { from: bob }),
            'ERC20: transfer amount exceeds balance',
        )
    })

        
    it('should have not any checkpoint', async () => {
        const tomBal = await this.lua.balanceOf(tom)
        assert.equal(tomBal.valueOf(), '0')
        assert.equal((await this.lua.numCheckpoints(bob)).valueOf(), '0')
        assert.equal((await this.lua.checkpoints(bob, 0)).votes.valueOf(), '0')
    })

    it('should correct delegate', async () => {
        const tomBal = await this.lua.balanceOf(tom)
        assert.equal(tomBal.valueOf(), '0')
        assert.equal((await this.lua.numCheckpoints(bob)).valueOf(), '0')
        assert.equal((await this.lua.checkpoints(bob, 0)).votes.valueOf(), '0')
        
        await this.lua.mint(alice, 50000, { from : alice })

        await this.lua.transfer(tom, 100, { from : alice })
        await this.lua.delegate(bob, { from : tom })

        assert.equal((await this.lua.numCheckpoints(bob)).valueOf(), '1')
        assert.equal((await this.lua.checkpoints(bob, 0)).votes.valueOf(), '100')

        await this.lua.transfer(tom, 10, { from : alice })

        assert.equal((await this.lua.numCheckpoints(bob)).valueOf(), '2')
        assert.equal((await this.lua.checkpoints(bob, 1)).votes.valueOf(), '110')
        assert.equal((await this.lua.getCurrentVotes(bob)).valueOf(), '110')

        assert.equal((await this.lua.numCheckpoints(carol)).valueOf(), '0')
        assert.equal((await this.lua.checkpoints(carol, 0)).votes.valueOf(), '0')
        assert.equal((await this.lua.getCurrentVotes(carol)).valueOf(), '0')

        await this.lua.delegate(carol, { from : tom })

        assert.equal((await this.lua.checkpoints(bob, 1)).votes.valueOf(), '110')

        assert.equal((await this.lua.numCheckpoints(bob)).valueOf(), '3')
        assert.equal((await this.lua.checkpoints(bob, 2)).votes.valueOf(), '0')
        assert.equal((await this.lua.getCurrentVotes(bob)).valueOf(), '0')

        assert.equal((await this.lua.numCheckpoints(carol)).valueOf(), '1')
        assert.equal((await this.lua.checkpoints(carol, 0)).votes.valueOf(), '110')

        await this.lua.transfer(tom, 20, { from : alice })

        assert.equal((await this.lua.numCheckpoints(carol)).valueOf(), '2')
        assert.equal((await this.lua.checkpoints(carol, 1)).votes.valueOf(), '130')
        assert.equal((await this.lua.getCurrentVotes(carol)).valueOf(), '130')

        await this.lua.transfer(alice, 20, { from : tom })

        assert.equal((await this.lua.numCheckpoints(carol)).valueOf(), '3')
        assert.equal((await this.lua.checkpoints(carol, 2)).votes.valueOf(), '110')
        assert.equal((await this.lua.getCurrentVotes(carol)).valueOf(), '110')

        await this.lua.mint(tom, 5, { from : alice })

        assert.equal((await this.lua.numCheckpoints(carol)).valueOf(), '4')
        assert.equal((await this.lua.checkpoints(carol, 3)).votes.valueOf(), '115')
        assert.equal((await this.lua.getCurrentVotes(carol)).valueOf(), '115')
    })

    it('should correct lock', async () => {
        this.lua = await LuaToken.new(100, 190, { from: alice })
        await this.lua.mint(alice, '5000', { from: alice })
        await this.lua.transfer(carol, '1000', { from: alice })
        await expectRevert(
            this.lua.lock(carol, '900', { from: bob }),
            'Ownable: caller is not the owner',
        )

        await expectRevert(
            this.lua.lock(carol, '9000', { from: alice }),
            'ERC20: lock amount over blance',
        )
        this.lua.lock(carol, '900', { from: alice })

        assert.equal((await this.lua.totalLock()).valueOf(), '900')
        assert.equal((await this.lua.lastUnlockBlock(carol)).valueOf(), '100')
        assert.equal((await this.lua.lockOf(carol)).valueOf(), '900')
        assert.equal((await this.lua.balanceOf(carol)).valueOf(), '100')
        assert.equal((await this.lua.canUnlockAmount(carol)).valueOf(), '0')

        await time.advanceBlockTo('100');
        assert.equal((await this.lua.canUnlockAmount(carol)).valueOf(), '0')

        await time.advanceBlockTo('101');
        assert.equal((await this.lua.canUnlockAmount(carol)).valueOf(), '10')

        await time.advanceBlockTo('102');
        assert.equal((await this.lua.canUnlockAmount(carol)).valueOf(), '20')

        await this.lua.unlock({from: carol}); //block 103
        assert.equal((await this.lua.balanceOf(carol)).valueOf(), '130')
        assert.equal((await this.lua.canUnlockAmount(carol)).valueOf(), '0')
        assert.equal((await this.lua.lockOf(carol)).valueOf(), '870')
        assert.equal((await this.lua.totalLock()).valueOf(), '870')
        assert.equal((await this.lua.lastUnlockBlock(carol)).valueOf(), '103')

        await time.advanceBlockTo('110');
        assert.equal((await this.lua.canUnlockAmount(carol)).valueOf(), '70')
        
        await this.lua.unlock({from: carol}); //block 111
        assert.equal((await this.lua.balanceOf(carol)).valueOf(), '210')
        assert.equal((await this.lua.canUnlockAmount(carol)).valueOf(), '0')
        assert.equal((await this.lua.lockOf(carol)).valueOf(), '790')
        assert.equal((await this.lua.totalLock()).valueOf(), '790')
        assert.equal((await this.lua.lastUnlockBlock(carol)).valueOf(), '111')

        await time.advanceBlockTo('188');
        assert.equal((await this.lua.canUnlockAmount(carol)).valueOf(), '770')

        await this.lua.unlock({from: carol}); //block 89
        assert.equal((await this.lua.balanceOf(carol)).valueOf(), '990')
        assert.equal((await this.lua.canUnlockAmount(carol)).valueOf(), '0')
        assert.equal((await this.lua.lockOf(carol)).valueOf(), '10')
        assert.equal((await this.lua.totalLock()).valueOf(), '10')
        assert.equal((await this.lua.lastUnlockBlock(carol)).valueOf(), '189')

        await time.advanceBlockTo('200');
        assert.equal((await this.lua.canUnlockAmount(carol)).valueOf(), '10')

        await this.lua.unlock({from: carol}); //block 201
        assert.equal((await this.lua.balanceOf(carol)).valueOf(), '1000')
        assert.equal((await this.lua.canUnlockAmount(carol)).valueOf(), '0')
        assert.equal((await this.lua.lockOf(carol)).valueOf(), '0')
        assert.equal((await this.lua.totalLock()).valueOf(), '0')
        assert.equal((await this.lua.lastUnlockBlock(carol)).valueOf(), '201')

        await time.advanceBlockTo('300');
        assert.equal((await this.lua.balanceOf(carol)).valueOf(), '1000')
        assert.equal((await this.lua.canUnlockAmount(carol)).valueOf(), '0')
        assert.equal((await this.lua.lockOf(carol)).valueOf(), '0')
        assert.equal((await this.lua.totalLock()).valueOf(), '0')
        assert.equal((await this.lua.lastUnlockBlock(carol)).valueOf(), '201')

        this.lua.lock(carol, '100', { from: alice }) // 301

        assert.equal((await this.lua.totalLock()).valueOf(), '100')
        assert.equal((await this.lua.lastUnlockBlock(carol)).valueOf(), '201')
        assert.equal((await this.lua.lockOf(carol)).valueOf(), '100')
        assert.equal((await this.lua.balanceOf(carol)).valueOf(), '900')
        assert.equal((await this.lua.canUnlockAmount(carol)).valueOf(), '100')

        await this.lua.unlock({from: carol}); // 302
        assert.equal((await this.lua.balanceOf(carol)).valueOf(), '1000')
        assert.equal((await this.lua.canUnlockAmount(carol)).valueOf(), '0')
        assert.equal((await this.lua.lockOf(carol)).valueOf(), '0')
        assert.equal((await this.lua.totalLock()).valueOf(), '0')
        assert.equal((await this.lua.lastUnlockBlock(carol)).valueOf(), '302')
    })

    it('should correct lock with 2 holders', async () => {
        this.lua = await LuaToken.new(500, 590, { from: alice })
        await this.lua.mint(alice, '5000', { from: alice })
        await this.lua.transfer(carol, '1000', { from: alice })
        await expectRevert(
            this.lua.lock(carol, '900', { from: bob }),
            'Ownable: caller is not the owner',
        )

        await expectRevert(
            this.lua.lock(carol, '9000', { from: alice }),
            'ERC20: lock amount over blance',
        )
        this.lua.lock(carol, '900', { from: alice })

        assert.equal((await this.lua.totalLock()).valueOf(), '900')
        assert.equal((await this.lua.lastUnlockBlock(carol)).valueOf(), '500')
        assert.equal((await this.lua.lockOf(carol)).valueOf(), '900')
        assert.equal((await this.lua.balanceOf(carol)).valueOf(), '100')
        assert.equal((await this.lua.canUnlockAmount(carol)).valueOf(), '0')

        await time.advanceBlockTo('500');
        assert.equal((await this.lua.canUnlockAmount(carol)).valueOf(), '0')

        await time.advanceBlockTo('501');
        assert.equal((await this.lua.canUnlockAmount(carol)).valueOf(), '10')

        await time.advanceBlockTo('502');
        assert.equal((await this.lua.canUnlockAmount(carol)).valueOf(), '20')

        await this.lua.unlock({from: carol}); //block 503
        assert.equal((await this.lua.balanceOf(carol)).valueOf(), '130')
        assert.equal((await this.lua.canUnlockAmount(carol)).valueOf(), '0')
        assert.equal((await this.lua.lockOf(carol)).valueOf(), '870')
        assert.equal((await this.lua.totalLock()).valueOf(), '870')
        assert.equal((await this.lua.lastUnlockBlock(carol)).valueOf(), '503')

        await time.advanceBlockTo('510');
        assert.equal((await this.lua.canUnlockAmount(carol)).valueOf(), '70')
        
        await this.lua.unlock({from: carol}); //block 511
        assert.equal((await this.lua.balanceOf(carol)).valueOf(), '210')
        assert.equal((await this.lua.canUnlockAmount(carol)).valueOf(), '0')
        assert.equal((await this.lua.lockOf(carol)).valueOf(), '790')
        assert.equal((await this.lua.totalLock()).valueOf(), '790')
        assert.equal((await this.lua.lastUnlockBlock(carol)).valueOf(), '511')

        await this.lua.transfer(carol, "160", { from: alice }) // 512
        await this.lua.lock(carol, '158', { from: alice }) // 513

        assert.equal((await this.lua.balanceOf(carol)).valueOf(), '212')
        assert.equal((await this.lua.lockOf(carol)).valueOf(), '948')
        assert.equal((await this.lua.totalLock()).valueOf(), '948')
        assert.equal((await this.lua.lastUnlockBlock(carol)).valueOf(), '511')
        assert.equal((await this.lua.canUnlockAmount(carol)).valueOf(), '24')

        await this.lua.unlock({from: carol}); //block 514

        assert.equal((await this.lua.balanceOf(carol)).valueOf(), '248')
        assert.equal((await this.lua.lockOf(carol)).valueOf(), '912')
        assert.equal((await this.lua.totalLock()).valueOf(), '912')
        assert.equal((await this.lua.lastUnlockBlock(carol)).valueOf(), '514')
        assert.equal((await this.lua.canUnlockAmount(carol)).valueOf(), '0')

        await this.lua.transfer(bob, "100", { from: alice }) // 515
        await this.lua.lock(bob, '90', { from: alice }) // 516
        

        assert.equal((await this.lua.balanceOf(bob)).valueOf(), '10')
        assert.equal((await this.lua.lockOf(bob)).valueOf(), '90')
        assert.equal((await this.lua.totalLock()).valueOf(), '1002')
        assert.equal((await this.lua.lastUnlockBlock(bob)).valueOf(), '500')
        assert.equal((await this.lua.canUnlockAmount(bob)).valueOf(), '16')


        await this.lua.unlock({from: bob}); //block 517

        assert.equal((await this.lua.balanceOf(bob)).valueOf(), '27')
        assert.equal((await this.lua.lockOf(bob)).valueOf(), '73')
        assert.equal((await this.lua.totalLock()).valueOf(), '985')
        assert.equal((await this.lua.lastUnlockBlock(bob)).valueOf(), '517')
        assert.equal((await this.lua.canUnlockAmount(bob)).valueOf(), '0')

        assert.equal((await this.lua.balanceOf(carol)).valueOf(), '248')
        assert.equal((await this.lua.lockOf(carol)).valueOf(), '912')
        assert.equal((await this.lua.lastUnlockBlock(carol)).valueOf(), '514')
        assert.equal((await this.lua.canUnlockAmount(carol)).valueOf(), '36')

        await time.advanceBlockTo('580')
        assert.equal((await this.lua.lockOf(bob)).valueOf(), '73')
        assert.equal((await this.lua.totalLock()).valueOf(), '985')
        assert.equal((await this.lua.lastUnlockBlock(bob)).valueOf(), '517')
        
        assert.equal((await this.lua.canUnlockAmount(bob)).valueOf(), '63')
        
        await this.lua.unlock({from: bob}) // 581
        await this.lua.unlock({from: carol}) // 582

        assert.equal((await this.lua.balanceOf(bob)).valueOf(), '91')
        assert.equal((await this.lua.lockOf(bob)).valueOf(), '9')
        assert.equal((await this.lua.lastUnlockBlock(bob)).valueOf(), '581')
        assert.equal((await this.lua.canUnlockAmount(bob)).valueOf(), '1')
        
        assert.equal((await this.lua.balanceOf(carol)).valueOf(), '1064')
        assert.equal((await this.lua.lockOf(carol)).valueOf(), '96')
        assert.equal((await this.lua.lastUnlockBlock(carol)).valueOf(), '582')
        assert.equal((await this.lua.canUnlockAmount(carol)).valueOf(), '0')

        assert.equal((await this.lua.totalLock()).valueOf(), '105')

        await time.advanceBlockTo('590')
        await this.lua.unlock({from: bob}) // 591
        await this.lua.unlock({from: carol}) // 592

        assert.equal((await this.lua.balanceOf(bob)).valueOf(), '100')
        assert.equal((await this.lua.lockOf(bob)).valueOf(), '0')
        assert.equal((await this.lua.lastUnlockBlock(bob)).valueOf(), '591')
        assert.equal((await this.lua.canUnlockAmount(bob)).valueOf(), '0')
        
        assert.equal((await this.lua.balanceOf(carol)).valueOf(), '1160')
        assert.equal((await this.lua.lockOf(carol)).valueOf(), '0')
        assert.equal((await this.lua.lastUnlockBlock(carol)).valueOf(), '592')
        assert.equal((await this.lua.canUnlockAmount(carol)).valueOf(), '0')

        assert.equal((await this.lua.totalLock()).valueOf(), '0')

        await time.advanceBlockTo('700')

        await expectRevert(
            this.lua.unlock({ from: carol }),
            'ERC20: cannot unlock',
        )

        await expectRevert(
            this.lua.unlock({ from: bob }),
            'ERC20: cannot unlock',
        )

        assert.equal((await this.lua.canUnlockAmount(carol)).valueOf(), '0')
        assert.equal((await this.lua.canUnlockAmount(bob)).valueOf(), '0')

        assert.equal((await this.lua.totalSupply()).valueOf(), '5000')
        assert.equal((await this.lua.balanceOf(this.lua.address)).valueOf(), '0')
    })
})
