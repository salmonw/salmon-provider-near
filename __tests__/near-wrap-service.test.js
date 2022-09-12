const { restoreAccount } = require('../../index');
const { CHAIN } = require('../src/constants');
const { MNEMONIC, ACCOUNT_ID, NETWORK_ID } = require('./config');

test('near-wrap-near', async () => {
  const account = await restoreAccount(CHAIN, MNEMONIC, {
    networkId: NETWORK_ID,
    accountId: ACCOUNT_ID,
  });
  const result1 = await account.wrapNear(1);
  expect(result1).toBeDefined();
  const result2 = await account.unwrapNear(1);
  expect(result2).toBeDefined();
});
