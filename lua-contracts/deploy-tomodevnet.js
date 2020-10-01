const ethers = require('ethers')
const fs = require('fs')
const path = require('path')
const PRIVATE_KEY = 'set your key here'
function encodeParameters(types, values) {
  const abi = new ethers.utils.AbiCoder();
  return abi.encode(types, values);
}
var rpc = 'https://rpc.devnet.tomochain.com'

async function deployLPToken(name, symbol) {
  var provider = new ethers.providers.JsonRpcProvider(rpc)
  var wallet = new ethers.Wallet(PRIVATE_KEY, provider)
  var LPToken = fs.readFileSync(path.join(__dirname, './build/contracts/MockERC20.json'))
  LPToken = JSON.parse(LPToken)

  var factory = new ethers.ContractFactory(
    LPToken.abi,
    LPToken.bytecode,
    wallet
  )

  nonce = await provider.getTransactionCount(wallet.address)
  
  const txParams = {
    gasLimit: ethers.utils.hexlify(5000000),
    gasPrice: ethers.utils.hexlify(20000000000000),
    // chainId: chainId,
    nonce: nonce
  }
  
  const contract = await factory.deploy(
    name,
    symbol,
    "1000000000000000000000",
    txParams
  )
  await contract.deployed()

  return contract
}

async function deployLuaToken(lockFrom, lockTo) {
  var provider = new ethers.providers.JsonRpcProvider(rpc)
  var wallet = new ethers.Wallet(PRIVATE_KEY, provider)
  var LuaToken = fs.readFileSync(path.join(__dirname, './build/contracts/LuaToken.json'))
  LuaToken = JSON.parse(LuaToken)

  var factory = new ethers.ContractFactory(
    LuaToken.abi,
    LuaToken.bytecode,
    wallet
  )

  nonce = await provider.getTransactionCount(wallet.address)
  
  const txParams = {
    gasLimit: ethers.utils.hexlify(5000000),
    gasPrice: ethers.utils.hexlify(20000000000000),
    // chainId: chainId,
    nonce: nonce
  }
  
  const contract = await factory.deploy(lockFrom, lockTo, txParams)
  await contract.deployed()

  return contract
}

async function deployLuaMasterFarmer(luaTokenAddress, startBlock, endBlock) {
  var provider = new ethers.providers.JsonRpcProvider(rpc)
  var wallet = new ethers.Wallet(PRIVATE_KEY, provider)
  var Contract = fs.readFileSync(path.join(__dirname, './build/contracts/LuaMasterFarmer.json'))
  Contract = JSON.parse(Contract)

  var factory = new ethers.ContractFactory(
    Contract.abi,
    Contract.bytecode,
    wallet
  )

  nonce = await provider.getTransactionCount(wallet.address)
  
  const txParams = {
    gasLimit: ethers.utils.hexlify(5000000),
    gasPrice: ethers.utils.hexlify(20000000000000),
    // chainId: chainId,
    nonce: nonce
  }
  
  const contract = await factory.deploy(
    luaTokenAddress, 
    wallet.address, 
    '100000000000000000000',
    startBlock, 
    endBlock,
    txParams)
  await contract.deployed()

  return contract
}

async function deployTimelock() {
  var provider = new ethers.providers.JsonRpcProvider(rpc)
  var wallet = new ethers.Wallet(PRIVATE_KEY, provider)
  var Contract = fs.readFileSync(path.join(__dirname, './build/contracts/Timelock.json'))
  Contract = JSON.parse(Contract)

  var factory = new ethers.ContractFactory(
    Contract.abi,
    Contract.bytecode,
    wallet
  )

  nonce = await provider.getTransactionCount(wallet.address)
  
  const txParams = {
    gasLimit: ethers.utils.hexlify(5000000),
    gasPrice: ethers.utils.hexlify(20000000000000),
    // chainId: chainId,
    nonce: nonce
  }
  
  const contract = await factory.deploy(
    wallet.address, 
    120, 
    txParams)
  await contract.deployed()

  return contract
}

async function txParams() {
  var provider = new ethers.providers.JsonRpcProvider(rpc)
  var wallet = new ethers.Wallet(PRIVATE_KEY, provider)
  var nonce = await provider.getTransactionCount(wallet.address)
  
  return {
    gasLimit: ethers.utils.hexlify(50000000),
    gasPrice: ethers.utils.hexlify(50000000000000),
    nonce: nonce
  }
}


var sleep = (t) => new Promise(r => setTimeout(r, t))
async function deploy() {
  var provider = new ethers.providers.JsonRpcProvider(rpc)
  var currectBlockNumber = await provider.getBlockNumber()
  
  var REWARD_MULTIPLIER = [128, 128, 64, 32, 16, 8, 4, 2, 1];
  var HALVING_AFTER_BLOCK = 500;
  var START_AT_BLOCK = currectBlockNumber + 200;
  var FINISH_BOUNUS_AT_BLOCK = START_AT_BLOCK + HALVING_AFTER_BLOCK * (REWARD_MULTIPLIER.length - 1)
  var LOCK_FROM = FINISH_BOUNUS_AT_BLOCK + 200
  var LOCK_TO = LOCK_FROM + 2000
  
  var LP1 = await deployLPToken('TOMOE-USDT UNI-V2 LP', 'TOMOE-USDT UNI-V2 LP')
  // var LP2 = await deployLPToken('TOMOE-USDC UNI-V2 LP', 'TOMOE-USDC UNI-V2 LP')
  // var LP3 = await deployLPToken('TOMOE-ETH UNI-V2 LP', 'TOMOE-ETH UNI-V2 LP')

  var lua = await deployLuaToken(
    LOCK_FROM, 
    LOCK_TO
  );
  
  var master = await deployLuaMasterFarmer(
    lua.address, 
    START_AT_BLOCK,
    HALVING_AFTER_BLOCK)

  var timelock = await deployTimelock()
  
  console.log({
    lua: lua.address, 
    master: master.address,
    timelock: timelock.address,
    LP1: LP1.address,
    // LP2: LP2.address,
    // LP3: LP3.address
  })
  await sleep(30000)
  await LP1.mint(
    '0xc6988D8De1378F235d5D020A2e8961899AD56300', 
    '100000000000000000000',
    txParams())

  // await sleep(30000)
  // await LP2.mint(
  //   '0xc6988D8De1378F235d5D020A2e8961899AD56300', 
  //   '200000000000000000000',
  //   txParams())
  // await sleep(30000)
  // await LP3.mint(
  //   '0xc6988D8De1378F235d5D020A2e8961899AD56300', 
  //   '300000000000000000000',
  //   txParams())
  console.log('done mint LP')

  await sleep(30000)
  await lua.transferOwnership(master.address, txParams())
  await sleep(30000)
  await master.transferOwnership(timelock.address, txParams())
  console.log('done transferOwnership')

  await sleep(30000)
  var eta = parseInt(await timelock.getBlockTimestamp()) + 60
  console.log(eta)
  await timelock.queueTransaction(
    master.address, 0, 'add(uint256,address,bool)',
    encodeParameters(
      ['uint256', 'address', 'bool'], 
      ['100', LP1.address, false]
    ), 
    (await timelock.getBlockTimestamp()) + 60,
    txParams()
  )
  await sleep(2 * 60000)
  await timelock.executeTransaction(
    master.address, 0, 'add(uint256,address,bool)',
    encodeParameters(
      ['uint256', 'address', 'bool'], 
      ['100', LP1.address, false]
    ), 
    eta
  )

  // await sleep(30000)
  // await master.add(100, LP1.address, true, txParams())

  // await sleep(30000)
  // await master.add(100, LP2.address, true, txParams())

  // await sleep(30000)
  // await master.add(200, LP3.address, true, txParams())

  // console.log('done add LP to pool')

  console.log('done')
}

function contract(address, abi) {
  var provider = new ethers.providers.JsonRpcProvider(rpc)
  var wallet = new ethers.Wallet(PRIVATE_KEY, provider)
  var Contract = fs.readFileSync(path.join(__dirname, `./build/contracts/${abi}.json`))
  Contract = JSON.parse(Contract)

  var factory = new ethers.ContractFactory(
    Contract.abi,
    Contract.bytecode,
    wallet
  )

  return factory.attach(address)
}

// { lua: '0xefCBB162259ea1BF5d09080Ef10A9d60A87D607e',
//   master: '0x09D1801f557F9630B100BdD7B41C7db11d5D9c69',
//   timelock: '0x602C1023CDA68610674c09514fab8cB3D76C0c0d',
//   LP1: '0xC3019f0D4b471908Cbaea576C53f8e4A57A99423',
//   LP2: '0x5cc89F49015069BDb39fF6bbdbf0bFAAccdbe09d',
//   LP3: '0x112E565756FD808Ec884EeD7D08BeC67AF9D7215' }

async function interact() {
  var lua = '0xb729d82A073def4eBA163C2C2859A4d4014D60a6'
  var master = '0x6050CDB01f82aC085e8Bc0B429548f3B175f4E5e'
  var timelock = '0x6Dcc33d62fd14b37F26Bf1Af4c961F613A0462e8'
  var LP1 = '0xC3019f0D4b471908Cbaea576C53f8e4A57A99423'
  var LP2 = '0x5cc89F49015069BDb39fF6bbdbf0bFAAccdbe09d'
  var LP3 = '0x112E565756FD808Ec884EeD7D08BeC67AF9D7215' 


  lua = contract(lua, 'LuaToken')
  master = contract(master, 'LuaMasterFarmer')
  timelock = contract(timelock, 'TimeLock')
  LP1 = contract(LP1, 'MockERC20')
  LP2 = contract(LP2, 'MockERC20')
  LP3 = contract(LP3, 'MockERC20')

  // await master.add(100, LP1.address, true, txParams())
  var a = (await timelock.getBlockTimestamp()).toNumber()
  var b = (await timelock.GRACE_PERIOD()).toNumber()
  var eta = 1601547044

  console.log({
    a,
    b,
    eta,
    'a >= eta': a >= eta,
    'a <= b + eta': a <= b + eta
  })

  console.log(await master.owner())
  console.log(await timelock.admin())
  console.log(await master.poolInfo(0))
  console.log(await master.migrator())

  // eta = (await timelock.getBlockTimestamp()).toNumber() + 150
  // var delay = (await timelock.delay()).toNumber()
  // console.log(eta, delay, eta > delay + a)

  // await timelock.queueTransaction(
  await timelock.executeTransaction(
    master.address, 0, 'transferOwnership(address)',
    encodeParameters(
      ['address'], 
      ['0xc6988D8De1378F235d5D020A2e8961899AD56300']
    ), 
    eta,
    txParams()
  )

  // await timelock.executeTransaction(
  //   master.address, 0, 'add(uint256,address,bool)',
  //   encodeParameters(
  //     ['uint256', 'address', 'bool'], 
  //     ['100', LP1.address, false]
  //   ), 
  //   1601544832,
  //   txParams()
  // )
}

// deploy()
interact()