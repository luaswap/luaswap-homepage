
const { expectRevert, time, BN } = require('@openzeppelin/test-helpers')
const LuaToken = artifacts.require('LuaToken')
const LuaMasterFarmer = artifacts.require('LuaMasterFarmer')
const MockERC20 = artifacts.require('MockERC20')

contract('LuaMasterFarmer', ([alice, bob, carol, dev, minter]) => {
    beforeEach(async () => {
        this.lua = await LuaToken.new(100, 900, { from: alice })
    })

    it('should set correct state variables', async () => {
        this.chef = await LuaMasterFarmer.new(this.lua.address, dev, 100, 100, 100, { from: alice })
        await this.lua.transferOwnership(this.chef.address, { from: alice })
        const lua = await this.chef.lua()
        const devaddr = await this.chef.devaddr()
        const owner = await this.lua.owner()
        assert.equal(lua.valueOf(), this.lua.address)
        assert.equal(devaddr.valueOf(), dev)
        assert.equal(owner.valueOf(), this.chef.address)
        assert.equal((await this.chef.REWARD_PER_BLOCK()).valueOf(), 100)
        assert.equal((await this.chef.START_BLOCK()).valueOf(), 100)
        assert.equal((await this.chef.REWARD_MULTIPLIER(0)).valueOf(), 128)
        assert.equal((await this.chef.REWARD_MULTIPLIER(1)).valueOf(), 128)
        assert.equal((await this.chef.REWARD_MULTIPLIER(2)).valueOf(), 64)
        assert.equal((await this.chef.REWARD_MULTIPLIER(3)).valueOf(), 32)
        assert.equal((await this.chef.REWARD_MULTIPLIER(4)).valueOf(), 16)
        assert.equal((await this.chef.REWARD_MULTIPLIER(5)).valueOf(), 8)
        assert.equal((await this.chef.REWARD_MULTIPLIER(6)).valueOf(), 4)
        assert.equal((await this.chef.REWARD_MULTIPLIER(7)).valueOf(), 2)
        assert.equal((await this.chef.REWARD_MULTIPLIER(8)).valueOf(), 1)

        assert.equal((await this.chef.HALVING_AT_BLOCK(0)).valueOf(), 200)
        assert.equal((await this.chef.HALVING_AT_BLOCK(4)).valueOf(), 600)

        assert.equal((await this.chef.FINISH_BONUS_AT_BLOCK()).valueOf(), 900)
    })

    it('should allow dev and only dev to update dev', async () => {
        this.chef = await LuaMasterFarmer.new(this.lua.address, dev, '1000', '0', '1000', { from: alice })
        assert.equal((await this.chef.devaddr()).valueOf(), dev)
        await expectRevert(this.chef.dev(bob, { from: bob }), 'dev: wut?')
        await this.chef.dev(bob, { from: dev })
        assert.equal((await this.chef.devaddr()).valueOf(), bob)
        await this.chef.dev(alice, { from: bob })
        assert.equal((await this.chef.devaddr()).valueOf(), alice)
    })

    it ('should correct multiplier', async () => {
        // start at block 10 and halving after 10 blocks
        this.chef = await LuaMasterFarmer.new(this.lua.address, dev, '10', '10', '10', { from: alice })
        // 600, 9999999
        // 10, 1
        // ---------|--------------|-------------------------
        //   |---|
        //      |-------|
        //          |----|
        //              |-------|
        //                     |-----------|
        //                             |--------|
        assert.equal((await this.chef.getMultiplier(0, 1)).valueOf(), "0")
        assert.equal((await this.chef.getMultiplier(0, 9)).valueOf(), "0")
        assert.equal((await this.chef.getMultiplier(0, 10)).valueOf(), "0")
        assert.equal((await this.chef.getMultiplier(10, 11)).valueOf(), "128")
        assert.equal((await this.chef.getMultiplier(10, 15)).valueOf(), "640")
        assert.equal((await this.chef.getMultiplier(10, 29)).valueOf(), "2432")
        assert.equal((await this.chef.getMultiplier(10, 30)).valueOf(), "2560")
        assert.equal((await this.chef.getMultiplier(25, 39)).valueOf(), "1216")
        assert.equal((await this.chef.getMultiplier(50, 51)).valueOf(), "16")
        assert.equal((await this.chef.getMultiplier(10, 51)).valueOf(), 10 * 128 + 10 * 128 + 10 * 64 + 10 * 32 + 16)
        assert.equal((await this.chef.getMultiplier(10, 90)).valueOf(), "3820")
        assert.equal((await this.chef.getMultiplier(85, 90)).valueOf(), "10")
        assert.equal((await this.chef.getMultiplier(85, 91)).valueOf(), "11")
        assert.equal((await this.chef.getMultiplier(10, 91)).valueOf(), "3821")
    })

    context('With ERC/LP token added to the field', () => {
        beforeEach(async () => {
            this.lp = await MockERC20.new('LPToken', 'LP', '10000000000', { from: minter })
            await this.lp.transfer(alice, '1000', { from: minter })
            await this.lp.transfer(bob, '1000', { from: minter })
            await this.lp.transfer(carol, '1000', { from: minter })
            this.lp2 = await MockERC20.new('LPToken2', 'LP2', '10000000000', { from: minter })
            await this.lp2.transfer(alice, '1000', { from: minter })
            await this.lp2.transfer(bob, '1000', { from: minter })
            await this.lp2.transfer(carol, '1000', { from: minter })
        })

        it('should correct add new pool and set pool', async () => {
            // 10 lua per block, start at block 10 and halving after 10 block
            this.chef = await LuaMasterFarmer.new(this.lua.address, dev, '10', '30', '10', { from: alice })
            await this.chef.add('100', this.lp.address, true, { from: alice})
            assert.equal((await this.chef.poolInfo(0)).lpToken.valueOf(), this.lp.address)
            assert.equal((await this.chef.poolInfo(0)).allocPoint.valueOf(), '100')
            assert.equal((await this.chef.poolInfo(0)).lastRewardBlock.valueOf(), '30')
            assert.equal((await this.chef.poolInfo(0)).accLuaPerShare.valueOf(), '0')
            assert.equal((await this.chef.poolId1(this.lp.address)).valueOf(), '1')
            await expectRevert(
                this.chef.add('100', this.lp.address, true, { from: alice}),
                "LuaMasterFarmer::add: lp is already in pool"
            )
            await expectRevert(
                this.chef.add('100', this.lp2.address, true, { from: bob}),
                "Ownable: caller is not the owner"
            )

            await this.chef.add('300', this.lp2.address, true, { from: alice})
            assert.equal((await this.chef.poolInfo(1)).lpToken.valueOf(), this.lp2.address)
            assert.equal((await this.chef.poolInfo(1)).allocPoint.valueOf(), '300')
            assert.equal((await this.chef.poolInfo(1)).lastRewardBlock.valueOf().toString(), '30')
            assert.equal((await this.chef.poolInfo(1)).accLuaPerShare.valueOf(), '0')
            assert.equal((await this.chef.poolId1(this.lp2.address)).valueOf(), '2')

            assert.equal((await this.chef.totalAllocPoint()).valueOf(), '400')

            await this.chef.set(1, 400, true, { from: alice})
            assert.equal((await this.chef.poolInfo(1)).allocPoint.valueOf(), '400')
            assert.equal((await this.chef.totalAllocPoint()).valueOf(), '500')

            assert.equal((await this.chef.getNewRewardPerBlock(0)).valueOf(), "0")
            assert.equal((await this.chef.getNewRewardPerBlock(1)).valueOf(), "0")
            assert.equal((await this.chef.getNewRewardPerBlock(1)).valueOf(), "0")

            await time.advanceBlockTo(31);

            assert.equal((await this.chef.getNewRewardPerBlock(0)).valueOf(), "1280")
            assert.equal((await this.chef.getNewRewardPerBlock(1)).valueOf(), "256")
            assert.equal((await this.chef.getNewRewardPerBlock(2)).valueOf(), "1024")
        })

        it('should allow emergency withdraw', async () => {
            // 100 per block farming rate starting at block 100 and halving after each 900 blocks
            this.chef = await LuaMasterFarmer.new(this.lua.address, dev, '100', '100', '900', { from: alice })
            await this.chef.add('100', this.lp.address, true)
            await this.lp.approve(this.chef.address, '1000', { from: bob })
            await this.chef.deposit(0, '100', { from: bob })
            assert.equal((await this.lp.balanceOf(bob)).valueOf(), '900')
            await this.chef.emergencyWithdraw(0, { from: bob })
            assert.equal((await this.lp.balanceOf(bob)).valueOf(), '1000')
        })

        it('should correct deposit', async () => {
            this.chef = await LuaMasterFarmer.new(this.lua.address, dev, '100', '100', '900', { from: alice})

            await this.chef.add('100', this.lp.address, true)
            await this.lp.approve(this.chef.address, '1000', { from: bob })
            await expectRevert(
                this.chef.deposit(0, 0, { from: bob }),
                'LuaMasterFarmer::deposit: amount must be greater than 0'
            )

            await this.chef.deposit(0, 100, { from: bob })
            assert.equal((await this.lp.balanceOf(bob)).valueOf(), '900')
            assert.equal((await this.lp.balanceOf(this.chef.address)).valueOf(), '100')

            assert.equal((await this.chef.pendingReward(0, bob)).valueOf(), "0")
            assert.equal((await this.chef.userInfo(0, bob)).rewardDebt.valueOf(), "0")
            assert.equal((await this.chef.poolInfo(0)).accLuaPerShare.valueOf(), "0")

            await this.lp.approve(this.chef.address, '1000', { from: carol })
            await this.chef.deposit(0, 50, { from: carol })
            assert.equal((await this.lp.balanceOf(carol)).valueOf(), '950')
            assert.equal((await this.lp.balanceOf(this.chef.address)).valueOf(), '150')
            
            assert.equal((await this.chef.poolInfo(0)).accLuaPerShare.valueOf(), "0")

            assert.equal((await this.chef.pendingReward(0, bob)).valueOf(), '0')
            assert.equal((await this.chef.pendingReward(0, carol)).valueOf(), '0')
        })

        it('should correct pending lua & balance & lock', async () => {
            // 100 per block farming rate starting at block 400 with bonus until block 1000
            this.chef = await LuaMasterFarmer.new(this.lua.address, dev, '10', '100', '10', { from: alice })

            //block 71

            await this.lua.transferOwnership(this.chef.address, { from: alice }) // 72
            await this.chef.add('10', this.lp.address, true) // 73

            await this.lp.approve(this.chef.address, '1000', { from: alice }) // 74
            await this.lp.approve(this.chef.address, '1000', { from: bob }) // 75

            await this.chef.deposit(0, '10', { from: alice }) // 76
            assert.equal((await this.chef.pendingReward(0, alice)).valueOf(), '0')

            assert.equal((await this.lua.balanceOf(dev)).valueOf(), "0")
            assert.equal((await this.lua.lockOf(dev)).valueOf(), "0")
            assert.equal((await this.lua.totalSupply()).valueOf(), "0")

            await time.advanceBlockTo('100')
            assert.equal((await this.chef.pendingReward(0, alice)).valueOf(), '0')

            await this.chef.updatePool(0) // block 101
            assert.equal((await this.lua.totalSupply()).valueOf(), "1408")
            assert.equal((await this.lua.circulatingSupply()).valueOf(), "1312")

            assert.equal((await this.chef.pendingReward(0, alice)).valueOf(), '1280')
            
            assert.equal((await this.lua.balanceOf(dev)).valueOf(), "32")
            assert.equal((await this.lua.lockOf(dev)).valueOf(), "96")

            await time.advanceBlockTo('110')
            assert.equal((await this.chef.pendingReward(0, alice)).valueOf(), "12800")

            await this.chef.deposit(0, '10', { from: alice }) // block 111

            assert.equal((await this.lua.balanceOf(dev)).valueOf(), "352")
            assert.equal((await this.lua.lockOf(dev)).valueOf(), "1056")
            assert.equal((await this.lua.totalSupply()).valueOf(), "15488")

            // reward from block 100 => 111 = 14080
            // count from block 100
            // bonus amount = 14080
            // no bonus amount =  0
            assert.equal((await this.chef.pendingReward(0, alice)).valueOf(), "0") // when deposit, it will automatic harvest
            assert.equal((await this.lua.balanceOf(alice)).valueOf(), "3520")
            assert.equal((await this.lua.lockOf(alice)).valueOf(), "10560")


            assert.equal((await this.lua.balanceOf(this.chef.address)).valueOf(), "0")

            await time.advanceBlockTo('112')
            assert.equal((await this.chef.pendingReward(0, alice)).valueOf(), "1280")

            await time.advanceBlockTo('159')
            assert.equal((await this.chef.pendingReward(0, alice)).valueOf(), "23440")

            await this.chef.deposit(0, '10', { from: bob }) // 160
            assert.equal((await this.chef.pendingReward(0, alice)).valueOf(), "23520")
            assert.equal((await this.chef.pendingReward(0, bob)).valueOf(), "0")
            
            await time.advanceBlockTo('164')
            assert.equal((await this.chef.pendingReward(0, alice)).valueOf(), "23626")
            assert.equal((await this.chef.pendingReward(0, bob)).valueOf(), "53")

            await time.advanceBlockTo('250')
             // reward from block (111 => 160) + (160 => 250) * 2/3
            assert.equal((await this.chef.pendingReward(0, alice)).valueOf(), "24386")
            // reward from block (160 => 250) * 1/3
            assert.equal((await this.chef.pendingReward(0, bob)).valueOf(), "433") // reward from block 160

            await this.chef.deposit(0, '40', { from: bob }) // 251
            // reward from block 160 => 251 = 436
            // count from block 160
            // bonus amount = 200
            // no bonus amount =  236
            assert.equal((await this.chef.pendingReward(0, bob)).valueOf(), "0")
            assert.equal((await this.lua.lockOf(bob)).valueOf(), "327")
            assert.equal((await this.lua.balanceOf(bob)).valueOf(), "109")
        })
        

        it('should give out LUAs only after farming time', async () => {
            // 100 per block farming rate starting at block 100 with bonus until block 1000
            this.chef = await LuaMasterFarmer.new(this.lua.address, dev, '10', '300', '10', { from: alice })
            await time.advanceBlockTo('290')
            await this.lua.transferOwnership(this.chef.address, { from: alice }) // 291

            await this.chef.add('100', this.lp.address, true) // 292

            await this.lp.approve(this.chef.address, '1000', { from: bob }) // 293
            await this.chef.deposit(0, '100', { from: bob }) // 294

            await time.advanceBlockTo('295')
            await this.chef.claimReward(0, { from: bob }) // block 296
            assert.equal((await this.lua.balanceOf(bob)).valueOf(), '0')

            await time.advanceBlockTo('299')
            await this.chef.claimReward(0, { from: bob }) // block 300
            assert.equal((await this.lua.balanceOf(bob)).valueOf(), '0')

            await this.chef.claimReward(0, { from: bob }) // block 301
            assert.equal((await this.lua.balanceOf(bob)).valueOf(), '320')
            assert.equal((await this.lua.lockOf(bob)).valueOf(), '960')
            assert.equal((await this.lua.totalBalanceOf(bob)).valueOf(), '1280')
            assert.equal((await this.lua.balanceOf(dev)).valueOf(), '32')
            assert.equal((await this.lua.lockOf(dev)).valueOf(), '96')
            assert.equal((await this.lua.totalBalanceOf(dev)).valueOf(), '128')

            await time.advanceBlockTo('308')
            assert.equal((await this.chef.pendingReward(0, bob)).valueOf(), "8960")
            await this.chef.claimReward(0, { from: bob }) // block 309
            assert.equal((await this.lua.balanceOf(bob)).valueOf(), '2880')
            assert.equal((await this.lua.lockOf(bob)).valueOf(), '8640')
            assert.equal((await this.chef.pendingReward(0, bob)).valueOf(), "0")

            assert.equal((await this.lua.balanceOf(dev)).valueOf(), '288')
            assert.equal((await this.lua.lockOf(dev)).valueOf(), '864')

            assert.equal((await this.lua.totalSupply()).valueOf(), '12672')
            
            await time.advanceBlockTo('371')
            assert.equal((await this.chef.pendingReward(0, bob)).valueOf(), '26500')
            assert.equal((await this.lua.balanceOf(dev)).valueOf(), '288')
            assert.equal((await this.lua.balanceOf(bob)).valueOf(), '2880')

            await this.lp.approve(this.chef.address, '1000', { from: carol }) // 372
            await time.advanceBlockTo('375')
            await this.chef.deposit(0, '100', { from: carol }) // 376
            assert.equal((await this.lua.balanceOf(dev)).valueOf(), '953')
            assert.equal((await this.lua.totalBalanceOf(dev)).valueOf(), '3812')

            await time.advanceBlockTo('387')
            assert.equal((await this.chef.pendingReward(0, carol)).valueOf(), '75')
            await this.chef.claimReward(0, { from: carol }) // 388
            assert.equal((await this.lua.totalBalanceOf(carol)).valueOf(), '80')
            assert.equal((await this.lua.balanceOf(carol)).valueOf(), '20')
            assert.equal((await this.lua.lockOf(carol)).valueOf(), '60')
        })

        it('should not distribute LUAs if no one deposit', async () => {
            // 100 per block farming rate starting at block 200 with bonus until block 1000
            this.chef = await LuaMasterFarmer.new(this.lua.address, dev, '100', '500', '10', { from: alice })
            await this.lua.transferOwnership(this.chef.address, { from: alice })
            await this.chef.add('100', this.lp.address, true)
            await this.lp.approve(this.chef.address, '1000', { from: bob })
            await time.advanceBlockTo('510')
            assert.equal((await this.lua.totalSupply()).valueOf(), '0')
            await time.advanceBlockTo('520')
            assert.equal((await this.lua.totalSupply()).valueOf(), '0')
            await time.advanceBlockTo('530')
            await this.chef.updatePool(0) // block 531
            assert.equal((await this.lua.totalSupply()).valueOf(), '0')
            assert.equal((await this.lua.balanceOf(bob)).valueOf(), '0')
            assert.equal((await this.lua.balanceOf(dev)).valueOf(), '0')
            await this.chef.deposit(0, '10', { from: bob }) // block 532
            assert.equal((await this.lp.balanceOf(this.chef.address)).valueOf(), '10')
            assert.equal((await this.lua.totalSupply()).valueOf(), '0')
            assert.equal((await this.lua.balanceOf(bob)).valueOf(), '0')
            assert.equal((await this.lua.balanceOf(dev)).valueOf(), '0')
            assert.equal((await this.lp.balanceOf(bob)).valueOf(), '990')

            await this.chef.claimReward(0, { from: bob })
            assert.equal((await this.lua.balanceOf(bob)).valueOf(), '800')
            assert.equal((await this.lua.balanceOf(dev)).valueOf(), '80')
        })
        // it('should stop giving bonus LUAs after the bonus period ends', async () => {
        //     // 100 per block farming rate starting at block 500 with bonus until block 600
        //     this.chef = await LuaMasterFarmer.new(this.lua.address, dev, '100', '500', '50', { from: alice })
        //     await this.lua.transferOwnership(this.chef.address, { from: alice })
        //     await this.lp.approve(this.chef.address, '1000', { from: alice })
        //     await this.chef.add('1', this.lp.address, true)
        //     // Alice deposits 10 LPs at block 590
        //     await time.advanceBlockTo('589')
        //     await this.chef.deposit(0, '10', { from: alice })
        //     // At block 605, she should have 900*10 + 90*5 = 9450 pending.
        //     await time.advanceBlockTo('605')
        //     assert.equal((await this.chef.pendingReward(0, alice)).valueOf(), '9450')
        //     // At block 606, Alice withdraws all pending rewards and should get 10600.
        //     await this.chef.claimReward(0, { from: alice })
        //     assert.equal((await this.chef.pendingReward(0, alice)).valueOf(), '0')
        //     assert.equal((await this.lua.balanceOf(alice)).valueOf(), '9540')
        // })

    })
})