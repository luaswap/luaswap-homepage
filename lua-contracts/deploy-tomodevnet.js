const ethers = require('ethers')
const fs = require('fs')
const path = require('path')
const PRIVATE_KEY = 'set your key here'
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
async function main() {
  var provider = new ethers.providers.JsonRpcProvider(rpc)
  var currectBlockNumber = await provider.getBlockNumber()
  
  var REWARD_MULTIPLIER = [128, 128, 64, 32, 16, 8, 4, 2, 1];
  var HALVING_AFTER_BLOCK = 500;
  var START_AT_BLOCK = currectBlockNumber + 200;
  var FINISH_BOUNUS_AT_BLOCK = START_AT_BLOCK + HALVING_AFTER_BLOCK * (REWARD_MULTIPLIER.length - 1)
  var LOCK_FROM = FINISH_BOUNUS_AT_BLOCK + 200
  var LOCK_TO = LOCK_FROM + 2000
  
  var LP1 = await deployLPToken('TOMOE-USDT UNI-V2 LP', 'TOMOE-USDT UNI-V2 LP')
  var LP2 = await deployLPToken('TOMOE-USDC UNI-V2 LP', 'TOMOE-USDC UNI-V2 LP')
  var LP3 = await deployLPToken('TOMOE-ETH UNI-V2 LP', 'TOMOE-ETH UNI-V2 LP')

  var lua = await deployLuaToken(
    LOCK_FROM, 
    LOCK_TO
  );
  
  var master = await deployLuaMasterFarmer(
    lua.address, 
    START_AT_BLOCK,
    HALVING_AFTER_BLOCK)
  
  console.log({
    lua: lua.address, 
    master: master.address,
    LP1: LP1.address,
    LP2: LP2.address,
    LP3: LP3.address
  })
  await sleep(30000)
  await LP1.mint(
    '0xc6988D8De1378F235d5D020A2e8961899AD56300', 
    '100000000000000000000',
    txParams())

  await sleep(30000)
  await LP2.mint(
    '0xc6988D8De1378F235d5D020A2e8961899AD56300', 
    '200000000000000000000',
    txParams())
  await sleep(30000)
  await LP3.mint(
    '0xc6988D8De1378F235d5D020A2e8961899AD56300', 
    '300000000000000000000',
    txParams())
  console.log('done mint LP')

  await sleep(30000)
  await lua.transferOwnership(master.address, txParams())
  console.log('done transferOwnership')

  await sleep(30000)
  await master.add(100, LP1.address, true, txParams())

  await sleep(30000)
  await master.add(100, LP2.address, true, txParams())

  await sleep(30000)
  await master.add(200, LP3.address, true, txParams())

  console.log('done add LP to pool')
}

main()