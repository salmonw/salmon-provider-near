const { restoreAccount } = require('../../index');
const { CHAIN } = require('../src/constants');
const { MNEMONIC, ACCOUNT_ID, IMPLICIT_MNEMONIC, TOKEN_NAME, NETWORK_ID } = require('./config');

test('near-transfer-near', async () => {
  const account1 = await restoreAccount(CHAIN, MNEMONIC, {
    networkId: NETWORK_ID,
    accountId: ACCOUNT_ID,
  });
  const account2 = await restoreAccount(CHAIN, IMPLICIT_MNEMONIC, { networkId: NETWORK_ID });
  const amount = 1;
  const result1 = await account1.transfer(account2.getReceiveAddress(), null, amount);
  expect(result1).toBeDefined();
  const result2 = await account2.transfer(account1.getReceiveAddress(), null, amount);
  expect(result2).toBeDefined();
});

test('near-transfer-token', async () => {
  const account1 = await restoreAccount(CHAIN, MNEMONIC, {
    networkId: NETWORK_ID,
    accountId: ACCOUNT_ID,
  });

  const account2 = await restoreAccount(CHAIN, IMPLICIT_MNEMONIC, { networkId: NETWORK_ID });
  const amount = 1;
  const opts = { memo: 'This is a test!' };
  const result1 = await account1.transfer(account2.getReceiveAddress(), TOKEN_NAME, amount, opts);
  expect(result1).toBeDefined();
  // Back amount to mantain balance
  const result2 = await account2.transfer(account1.getReceiveAddress(), TOKEN_NAME, amount, opts);
  expect(result2).toBeDefined();
});
