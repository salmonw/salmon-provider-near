const {
  utils: {
    web: { fetchJson },
  },
} = require('near-api-js');
const { getConfig } = require('./near-config-service');

const listTokensPrices = async (networkId) => {
  const {
    refFinance: { apiUrl },
  } = await getConfig(networkId);

  const prices = await fetchJson(`${apiUrl}/list-token-price`);

  return Object.entries(prices).map(([id, { price, symbol, decimal }]) => ({
    id,
    priceUsd: price,
    symbol,
    decimal,
  }));
};

module.exports = {
  listTokensPrices,
};
