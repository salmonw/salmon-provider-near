const {
  transactions: { functionCall },
  utils: {
    format: { parseNearAmount },
    web: { fetchJson },
  },
} = require('near-api-js');
const { getConfig } = require('./near-config-service');

const FT_SWAP_GAS = parseNearAmount('0.00000000018');

const quote = async (connection, tokenInId, tokenOutId) => {
  const tokenIn = await connection.viewFunction(tokenInId, 'ft_metadata');
  const tokenOut = await connection.viewFunction(tokenOutId, 'ft_metadata');

  const {
    connection: { networkId },
  } = connection;

  const { refFinance } = await getConfig(networkId);

  const pools = await fetchJson(`${refFinance.apiUrl}/list-pools`);

  const pool = pools
    .filter(
      ({ token_account_ids }) =>
        token_account_ids?.includes(tokenInId) && token_account_ids?.includes(tokenOutId)
    )
    .reduce((accumulator, currentValue) => {
      if (!currentValue || accumulator?.total_fee < currentValue.total_fee) {
        return accumulator;
      }
      return currentValue;
    }, null);

  const uiInfo = { in: tokenIn, out: tokenOut };

  return { pool, uiInfo };
};

const swap = async (connection, poolId, tokenInId, tokenOutId, amount) => {
  const {
    connection: { networkId },
  } = connection;

  const { refFinance } = await getConfig(networkId);

  return connection.signAndSendTransaction({
    receiverId: tokenInId,
    actions: [
      functionCall(
        'ft_transfer_call',
        {
          receiver_id: refFinance.contractId,
          amount: `${amount}`,
          msg: JSON.stringify({
            force: 0,
            actions: [
              {
                pool_id: poolId,
                token_in: tokenInId,
                token_out: tokenOutId,
                amount_in: `${amount}`,
                min_amount_out: '0',
              },
            ],
          }),
        },
        FT_SWAP_GAS,
        `1`
      ),
    ],
  });
};

module.exports = { quote, swap };
