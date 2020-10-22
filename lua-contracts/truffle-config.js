module.exports = {
  networks: {
    dev: {
      host: "localhost",
      port: 7545,
      network_id: "*", // Match any network id
      gas: 5000000
    },
    tomodev: {
      host: "https://rpc.devnet.tomochain.com",
      gas: 5000000,
      network_id: 99
    }
  },
  compilers: {
    solc: {
      version: "0.6.12",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
};
