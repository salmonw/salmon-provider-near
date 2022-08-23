const { parseAmount } = require('../format');
const indexerService = require('./near-indexer-service');

const getTokensByOwner = async (connection, accountId, networkId) => {
  const contractsNames = await indexerService.listLikelyTokens(networkId, accountId);

  return Promise.all(
    contractsNames.map(async (contractName) => {
      try {
        const metadata = await connection.viewFunction(contractName, 'ft_metadata');

        const { name, symbol, decimals, icon } = metadata;

        const params = { account_id: accountId };
        const amount = await connection.viewFunction(contractName, 'ft_balance_of', params);

        return {
          mint: contractName,
          owner: accountId,
          amount,
          decimals,
          uiAmount: parseAmount(amount, decimals),
          symbol,
          name,
          logo: icon,
          address: contractName,
        };
      } catch (error) {
        console.log(`Failed to get data for '${contractName}'`, error);
        return null;
      }
    })
  ).then((tokens) => tokens.filter(Boolean));
};

const getOwnTokens = async (connection) => {
  const {
    accountId,
    connection: { networkId },
  } = connection;

  return getTokensByOwner(connection, accountId, networkId);
};

module.exports = { getOwnTokens };
