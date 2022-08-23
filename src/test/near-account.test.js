const { restoreAccount } = require('../../index');
const { CHAIN } = require('../constants');
const {
  NETWORK_ID,
  MNEMONIC,
  ACCOUNT_ID,
  IMPLICIT_MNEMONIC,
  IMPLICIT_ACCOUNT_ID,
} = require('./config');

test('near-account-get-balance', async () => {
  const account = await restoreAccount(CHAIN, MNEMONIC, {
    networkId: NETWORK_ID,
    accountId: ACCOUNT_ID,
  });
  const balance = await account.getBalance();
  expect(balance.usdTotal).toBeGreaterThanOrEqual(0);
  expect(balance.items.length).toBeGreaterThan(0);
});

test('near-validate-destination-account', async () => {
  const account = await restoreAccount(CHAIN, MNEMONIC, {
    networkId: NETWORK_ID,
    accountId: ACCOUNT_ID,
  });

  const addr1 = 'a wewe';
  const addr2 = '8Nb3tg9H55svmywG4NvsHVtw7GpZWdA2Wi6TbXbgTtRR8Nb3tg9H55svmywG4NvsHVtw7GpZWdA2Wi6Tb';
  const addr3 = '98793cd91a3f870fb126f66285808c7e094afcfc4eda8a970f6648cdf0dbd6dg';
  const addr4 = '98793cd91a3f870fb126f66285808c7e094afcfc4eda8a970f6648cdf0dbd6de';
  const addr5 = ACCOUNT_ID;

  const result1 = await account.validateDestinationAccount(addr1);
  expect(result1.code).toBe('INVALID_ADDRESS');
  expect(result1.type).toBe('ERROR');
  const result2 = await account.validateDestinationAccount(addr2);
  expect(result2.code).toBe('INVALID_ADDRESS');
  expect(result2.type).toBe('ERROR');
  const result3 = await account.validateDestinationAccount(addr3);
  expect(result3.code).toBe('EMPTY_ACCOUNT');
  expect(result3.type).toBe('WARNING');
  const result4 = await account.validateDestinationAccount(addr4);
  expect(result4.code).toBe('VALID_ACCOUNT');
  expect(result4.type).toBe('SUCCESS');
  const result5 = await account.validateDestinationAccount(addr5);
  expect(result5.code).toBe('VALID_ACCOUNT');
  expect(result5.type).toBe('SUCCESS');
});

test('near-account-get-tokens', async () => {
  const account = await restoreAccount(CHAIN, MNEMONIC, {
    networkId: NETWORK_ID,
    accountId: ACCOUNT_ID,
  });
  const tokens = await account.getTokens();
  expect(tokens.length).toBeGreaterThan(0);
});

test('near-account-get-receive-address', async () => {
  const account = await restoreAccount(CHAIN, IMPLICIT_MNEMONIC, { networkId: NETWORK_ID });
  const receiveAddress = await account.getReceiveAddress();
  expect(receiveAddress).toBeDefined();
  expect(receiveAddress).toBe(IMPLICIT_ACCOUNT_ID);
});

test('near-get-networks', async () => {
  const account = await restoreAccount(CHAIN, IMPLICIT_MNEMONIC, { networkId: NETWORK_ID });
  const networks = await account.getNetworks();
  expect(networks).toBeDefined();
  expect(networks.length).toBeGreaterThan(0);
});

test('near-get-network', async () => {
  const account = await restoreAccount(CHAIN, IMPLICIT_MNEMONIC, { networkId: NETWORK_ID });
  const network = await account.getCurrentNetwork();
  expect(network).toBeDefined();
  expect(network.networkId).toBe(NETWORK_ID);
});

test('near-set-network', async () => {
  const account = await restoreAccount(CHAIN, MNEMONIC, { networkId: NETWORK_ID });
  const networks = await account.getNetworks();
  const newNetwork = networks[1];
  account.setNetwork(newNetwork.networkId);
  expect(account.networkId).toBe(newNetwork.networkId);
});

test('near-account-get-recent-transactions', async () => {
  const account = await restoreAccount(CHAIN, MNEMONIC, {
    networkId: NETWORK_ID,
    accountId: ACCOUNT_ID,
  });
  const transactions = await account.getRecentTransactions();
  console.log('transactions', transactions);
  const size = transactions.length;
  expect(size).toBe(10);
});
