
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
            assert.equal((await this.lua.lockOf(bob)).valueOf(), "149")
            assert.equal((await this.lua.balanceOf(bob)).valueOf(), "287")
            assert.equal((await this.lua.totalBalanceOf(bob)).valueOf(), "436")

            await this.chef.deposit(0, '30', { from: alice }) // 252
            assert.equal((await this.chef.pendingReward(0, alice)).valueOf(), "0")
            assert.equal((await this.chef.pendingReward(0, bob)).valueOf(), "7")

            await time.advanceBlockTo('263')
            assert.equal((await this.chef.pendingReward(0, alice)).valueOf(), "55")
            assert.equal((await this.chef.pendingReward(0, bob)).valueOf(), "62")

            await this.chef.updatePool(0) // 264
            assert.equal((await this.lua.totalSupply()).valueOf(), "42944")
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
            assert.equal((await this.lua.balanceOf(carol)).valueOf(), '50')
            assert.equal((await this.lua.lockOf(carol)).valueOf(), '30')

            console.log((await this.chef.pendingReward(0, bob)).valueOf())
            await this.chef.claimReward(0, { from: bob }) // 389
            assert.equal((await this.lua.totalBalanceOf(bob)).valueOf(), '38205')
            assert.equal((await this.lua.balanceOf(bob)).valueOf(), '9585')

            assert.equal((await this.lua.totalBalanceOf(dev)).valueOf(), '2549')
        })

        // it('should not distribute LUAs if no one deposit', async () => {
        //     // 100 per block farming rate starting at block 200 with bonus until block 1000
        //     this.chef = await LuaMasterFarmer.new(this.lua.address, dev, '100', '200', '800', { from: alice })
        //     await this.lua.transferOwnership(this.chef.address, { from: alice })
        //     await this.chef.add('100', this.lp.address, true)
        //     await this.lp.approve(this.chef.address, '1000', { from: bob })
        //     await time.advanceBlockTo('199')
        //     assert.equal((await this.lua.totalSupply()).valueOf(), '0')
        //     await time.advanceBlockTo('204')
        //     assert.equal((await this.lua.totalSupply()).valueOf(), '0')
        //     await time.advanceBlockTo('209')
        //     await this.chef.updatePool(0) // block 210
        //     assert.equal((await this.lua.totalSupply()).valueOf(), '0')
        //     assert.equal((await this.lua.balanceOf(bob)).valueOf(), '0')
        //     assert.equal((await this.lua.balanceOf(dev)).valueOf(), '0')
        //     await this.chef.deposit(0, '10', { from: bob }) // block 211
        //     assert.equal((await this.lp.balanceOf(this.chef.address)).valueOf(), '10')
        //     assert.equal((await this.lua.totalSupply()).valueOf(), '0')
        //     assert.equal((await this.lua.balanceOf(bob)).valueOf(), '0')
        //     assert.equal((await this.lua.balanceOf(dev)).valueOf(), '0')
        //     assert.equal((await this.lp.balanceOf(bob)).valueOf(), '990')
        //     assert.equal((await this.chef.getBlock()).valueOf(), "211")
        //     await time.advanceBlockTo('219')
        //     assert.equal((await this.chef.getBlock()).valueOf(), "219")
        //     await this.chef.withdraw(0, '10', { from: bob }) // block 220
        //     assert.equal((await this.chef.getBlock()).valueOf(), "220")
        //     assert.equal((await this.lua.totalSupply()).valueOf(), '9000')
        //     assert.equal((await this.lua.balanceOf(bob)).valueOf(), '8100')
        //     assert.equal((await this.lua.balanceOf(dev)).valueOf(), '900')
        //     assert.equal((await this.lp.balanceOf(bob)).valueOf(), '1000')
        //     assert.equal((await this.lp.balanceOf(this.chef.address)).valueOf(), '0')
        //     await this.chef.updatePool(0)
        //     assert.equal((await this.lua.totalSupply()).valueOf(), '9000')
        //     assert.equal((await this.lua.balanceOf(bob)).valueOf(), '8100')
        //     assert.equal((await this.lua.balanceOf(dev)).valueOf(), '900')
        //     assert.equal((await this.lp.balanceOf(bob)).valueOf(), '1000')
        // })

        // it('should distribute LUAs properly for each staker', async () => {
        //     // 100 per block farming rate starting at block 300 with bonus until block 1000
        //     this.chef = await LuaMasterFarmer.new(this.lua.address, dev, '100', '300', '700', { from: alice })
        //     await this.lua.transferOwnership(this.chef.address, { from: alice })
        //     await this.chef.add('100', this.lp.address, true)
        //     await this.lp.approve(this.chef.address, '1000', { from: alice })
        //     await this.lp.approve(this.chef.address, '1000', { from: bob })
        //     await this.lp.approve(this.chef.address, '1000', { from: carol })
        //     // Alice deposits 10 LPs at block 310
        //     await time.advanceBlockTo('309')
        //     await this.chef.deposit(0, '10', { from: alice })
        //     // Bob deposits 20 LPs at block 314
        //     await time.advanceBlockTo('313')
        //     await this.chef.deposit(0, '20', { from: bob })
        //     // Carol deposits 30 LPs at block 318
        //     await time.advanceBlockTo('317')
        //     await this.chef.deposit(0, '30', { from: carol })
        //     // Alice deposits 10 more LPs at block 320. At this point:
        //     //   Alice should have: 4*900 + 4*1/3*900 + 2*1/6*900 = 5100
        //     //   LuaMasterFarmer should have the remaining: 9000 - 5100 = 4900
        //     await time.advanceBlockTo('319')
        //     await this.chef.deposit(0, '10', { from: alice })
        //     assert.equal((await this.lua.totalSupply()).valueOf(), '10000')
        //     assert.equal((await this.lua.balanceOf(alice)).valueOf(), '5100')
        //     assert.equal((await this.lua.balanceOf(bob)).valueOf(), '0')
        //     assert.equal((await this.lua.balanceOf(carol)).valueOf(), '0')
        //     assert.equal((await this.lua.balanceOf(this.chef.address)).valueOf(), '3900')
        //     assert.equal((await this.lua.balanceOf(dev)).valueOf(), '1000')
        //     // Bob withdraws 5 LPs at block 330. At this point:
        //     //   Bob should have: 4*2/3*900 + 2*2/6*900 + 10*2/7*900 = 5571
        //     await time.advanceBlockTo('329')
        //     await this.chef.withdraw(0, '5', { from: bob })
        //     assert.equal((await this.lua.totalSupply()).valueOf(), '20000')
        //     assert.equal((await this.lua.balanceOf(alice)).valueOf(), '5100')
        //     assert.equal((await this.lua.balanceOf(bob)).valueOf(), '5571')
        //     assert.equal((await this.lua.balanceOf(carol)).valueOf(), '0')
        //     assert.equal((await this.lua.balanceOf(this.chef.address)).valueOf(), '7329')
        //     assert.equal((await this.lua.balanceOf(dev)).valueOf(), '2000')
        //     // Alice withdraws 20 LPs at block 340.
        //     // Bob withdraws 15 LPs at block 350.
        //     // Carol withdraws 30 LPs at block 360.
        //     await time.advanceBlockTo('339')
        //     await this.chef.withdraw(0, '20', { from: alice })
        //     await time.advanceBlockTo('349')
        //     await this.chef.withdraw(0, '15', { from: bob })
        //     await time.advanceBlockTo('359')
        //     await this.chef.withdraw(0, '30', { from: carol })
        //     assert.equal((await this.lua.totalSupply()).valueOf(), '50000')
        //     assert.equal((await this.lua.balanceOf(dev)).valueOf(), '5000')
        //     // Alice should have: 5100 + 10*2/7*900 + 10*2/6.5*900 = 10440
        //     assert.equal((await this.lua.balanceOf(alice)).valueOf(), '10440')
        //     // Bob should have: 5571 + 10*1.5/6.5 * 900 + 10*1.5/4.5*900 = 10647
        //     assert.equal((await this.lua.balanceOf(bob)).valueOf(), '10648')
        //     // Carol should have: 2*3/6*900 + 10*3/7*900 + 10*3/6.5*900 + 10*3/4.5*900 + 10*900 = 23910
        //     assert.equal((await this.lua.balanceOf(carol)).valueOf(), '23910')
        //     // All of them should have 1000 LPs back.
        //     assert.equal((await this.lp.balanceOf(alice)).valueOf(), '1000')
        //     assert.equal((await this.lp.balanceOf(bob)).valueOf(), '1000')
        //     assert.equal((await this.lp.balanceOf(carol)).valueOf(), '1000')
        // })

        // it('should give proper LUAs allocation to each pool', async () => {
        //     // 100 per block farming rate starting at block 400 with bonus until block 1000
        //     this.chef = await LuaMasterFarmer.new(this.lua.address, dev, '100', '400', '600', { from: alice })
        //     await this.lua.transferOwnership(this.chef.address, { from: alice })
        //     await this.lp.approve(this.chef.address, '1000', { from: alice })
        //     await this.lp2.approve(this.chef.address, '1000', { from: bob })
        //     // Add first LP to the pool with allocation 1
        //     await this.chef.add('10', this.lp.address, true)
        //     // Alice deposits 10 LPs at block 410
        //     await time.advanceBlockTo('409')
        //     await this.chef.deposit(0, '10', { from: alice }) // block 410
        //     // Add LP2 to the pool with allocation 2 at block 420
        //     await time.advanceBlockTo('419')
        //     await this.chef.add('20', this.lp2.address, true) // block 420
        //     // Alice should have 10*900 pending reward
        //     assert.equal((await this.chef.pendingReward(0, alice)).valueOf(), '9000')
        //     // Bob deposits 10 LP2s at block 425
        //     await time.advanceBlockTo('424')
        //     await this.chef.deposit(1, '5', { from: bob }) // block 425
        //     // Alice should have 9000 + 5*1/3*900 = 10500 pending reward
        //     assert.equal((await this.chef.pendingReward(0, alice)).valueOf(), '10500')
        //     await time.advanceBlockTo('430')
        //     // At block 430. Bob should get 5*2/3*900 = 3333. Alice should get ~1666 more.
        //     assert.equal((await this.chef.pendingReward(0, alice)).valueOf(), '12000')
        //     assert.equal((await this.chef.pendingReward(1, bob)).valueOf(), '3000')
        // })

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