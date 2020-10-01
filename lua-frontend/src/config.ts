export default {
  rpc: process.env.NODE_ENV === 'production' ? 
    'https://wallet.tomochain.com/api/luaswap/rpc' :
    'http://localhost:8020/rpc', //'https://main-rpc.linkpool.io/',
  chainId: 1,
  api: 'https://wallet.tomochain.com/api/luaswap'
}