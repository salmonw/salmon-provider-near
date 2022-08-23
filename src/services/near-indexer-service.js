const {
  utils: {
    web: { fetchJson },
  },
} = require('near-api-js');
const { getConfig } = require('./near-config-service');

const listAccountsByPublicKey = async (networkId, publicKey) => {
  const { indexerUrl } = await getConfig(networkId);

  return fetchJson(`${indexerUrl}/publicKey/${publicKey}/accounts`);
};

const listLikelyNfts = async (networkId, accountId) => {
  const { indexerUrl } = await getConfig(networkId);

  return fetchJson(`${indexerUrl}/account/${accountId}/likelyNFTs`);
};

const listLikelyTokens = async (networkId, accountId) => {
  const { indexerUrl } = await getConfig(networkId);

  return fetchJson(`${indexerUrl}/account/${accountId}/likelyTokens`);
};

const listRecentTransactions = async (networkId, accountId) => {
  const { indexerUrl } = await getConfig(networkId);

  return fetchJson(`${indexerUrl}/account/${accountId}/activity`);
};

module.exports = {
  listAccountsByPublicKey,
  listLikelyNfts,
  listLikelyTokens,
  listRecentTransactions,
};
