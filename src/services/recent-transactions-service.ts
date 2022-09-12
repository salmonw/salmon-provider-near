const indexerService = require('./near-indexer-service');

const getRecentTransactions = async (connection) => {
  const {
    accountId,
    connection: { networkId },
  } = connection;
  const recentTransactions = await indexerService.listRecentTransactions(networkId, accountId);

  return recentTransactions.map((transaction) => {
    return {
      destination: transaction.receiver_id,
      source: transaction.signer_id,
      type: transaction.action_kind,
      amount: transaction.deposit,
      timestamp: transaction.block_timestamp,
      status: transaction.status,
      method_name: transaction.args.method_name,
      contract: transaction.receiver_id,
    };
  });
};

module.exports = { getRecentTransactions };
