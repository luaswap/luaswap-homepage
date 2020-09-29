export default {
  rpc: process.env.NODE_ENV === 'production' ? 'https://mainnet.infura.io/v3/588a6747988443e18df8680e9b69f9c1' : 'https://mainnet.eth.aragon.network/', //'https://main-rpc.linkpool.io/',
  chainId: 1
}