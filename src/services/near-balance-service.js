const {
  utils: {
    format: { formatNearAmount },
  },
} = require('near-api-js');
const { decorateBalancePrices } = require('../token-decorator');
const { getOwnTokens } = require('./near-token-service');
const {
  NEAR_DECIMALS,
  NEAR_SYMBOL,
  NEAR_NAME,
  NEAR_LOGO,
} = require('../constants');
const { getLast24HoursChange } = require('../common-balance-service');
const { getPricesByIds } = require('../price-service');
const { listTokensPrices } = require('./ref-finance-service');

const getNearBalance = async (connection) => {
  const { accountId } = connection;

  const balance = await connection.getAccountBalance();
  const amount = balance.total;

  return {
    mint: accountId,
    owner: accountId,
    amount,
    decimals: NEAR_DECIMALS,
    uiAmount: formatNearAmount(amount),
    symbol: NEAR_SYMBOL,
    name: NEAR_NAME,
    logo: NEAR_LOGO,
    address: accountId,
  };
};

const getBalance = async (connection) => {
  try {
    const nearBalance = await getNearBalance(connection);
    const tokensBalance = await getOwnTokens(connection);
    const contractsIds = tokensBalance.map(({ address }) => address);
    const prices = await getPrices(connection, contractsIds);
    const balances = await decorateBalancePrices([nearBalance, ...tokensBalance], prices);
    const usdTotal = balances.reduce(
      (currentValue, next) => (next.usdBalance || 0) + currentValue,
      0
    );
    const last24HoursChage = getLast24HoursChange(balances, usdTotal);
    return {
      usdTotal,
      last24HoursChage,
      items: balances,
    };
  } catch (e) {
    if (!e.message?.includes('does not exist while viewing')) {
      throw e;
    }

    const last24HoursChage = getLast24HoursChange([], 0);
    return {
      usdTotal: 0,
      last24HoursChage,
      items: [],
    };
  }
};

const getPrices = async (connection, contractsIds) => {
  const prices = await getPricesByIds(['near', 'usn']);

  const {
    connection: { networkId },
  } = connection;

  const tokensPrices = await listTokensPrices(networkId);

  return prices.concat(tokensPrices.filter(({ id }) => contractsIds.includes(id)));
};

module.exports = { getBalance };
