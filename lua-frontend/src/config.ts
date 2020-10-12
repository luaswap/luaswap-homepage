export default {
  rpc: process.env.NODE_ENV === 'production' ? 
    'https://wallet.tomochain.com/api/luaswap/rpc' :
    'http://localhost:8020/rpc',
  chainId: 1,
  api: process.env.NODE_ENV === 'production' ? 
  'https://wallet.tomochain.com/api/luaswap' :
  'http://localhost:8020'
}