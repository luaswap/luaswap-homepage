import axios from "axios";
import BigNumber from "bignumber.js";
import _get from "lodash.get";

const LUA_TOKEN_ADDRESS = "0xb1f66997a5760428d3a87d68b90bfe0ae64121cc";
const route = axios.create({
  baseURL: "https://wallet.tomochain.com/api/luaswap",
});
const graphRoute = axios.create({
  baseURL: "https://api.thegraph.com/subgraphs/name/phucngh/luaswap",
});

export const getLuaPrice = (callback) => {
  return route
    .get(`/price/LUA`)
    .then((res) => {
      if (typeof callback === "function") {
        return callback(res);
      }
      return _get(res, "data.usdPrice");
    })
    .catch((err) => {
      console.error("[ERROR]:", err);
      return 0;
    });
};

export const getTotalSupply = (callback) => {
  const method = "totalSupply():(uint256)";
  const cache = true;

  return route
    .post(`/read/${LUA_TOKEN_ADDRESS}`, {
      method,
      cache,
      params: [],
    })
    .then((res) => {
      const totalSupply = _get(res, "data.data");
      if (totalSupply) {
        const convertedNumber = new BigNumber(totalSupply)
          .div(10 ** 18)
          .toNumber();
        if (typeof callback === "function") {
          return callback(convertedNumber);
        }
        return convertedNumber;
      }
      return 0;
    })
    .catch((err) => {
      console.error("[ERROR]:", err);
      return 0;
    });
};

export const getTotalLiquidityData = (callback) => {
  const operationName = "transactions";
  const query =
    "query transactions { uniswapFactories(first: 100) { id totalLiquidityUSD totalVolumeUSD } }";
  const variables = {};

  return graphRoute
    .post("", {
      operationName,
      query,
      variables,
    })
    .then((res) => {
      if (_get(res, "data.errors")) {
        console.error("[ERROR]:", _get(res, "data.errors.message", ""));
        return {};
      }
      const result = _get(res, "data.data.uniswapFactories", []).map(
        (item) => ({
          totalLiquidity: item.totalLiquidityUSD,
          volume: item.totalVolumeUSD,
        })
      )[0];

      if (typeof callback === "function") {
        return callback(result);
      }
      return result;
    })
    .catch((err) => {
      console.error("[ERROR]:", err);
      return {};
    });
};
