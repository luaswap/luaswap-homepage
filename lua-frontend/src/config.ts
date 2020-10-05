export default {
  rpc: process.env.NODE_ENV === 'production' ? 
    'https://wallet.tomochain.com/api/luaswap/rpc' :
    'https://wallet.tomochain.com/api/luaswap/rpc',
  chainId: 1,
  api: process.env.NODE_ENV === 'production' ? 
  'https://wallet.tomochain.com/api/luaswap' :
  'https://wallet.tomochain.com/api/luaswap'
}