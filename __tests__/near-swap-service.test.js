const { restoreAccount } = require('../../index');
const { CHAIN } = require('../src/constants');
const { MNEMONIC, NETWORK_ID, ACCOUNT_ID } = require('./config');

const TOKEN_IN_ID = 'wrap.testnet';
const TOKEN_OUT_ID = 'ref.fakes.testnet';

test('near-swap-quote', async () => {
  const account = await restoreAccount(CHAIN, MNEMONIC, {
    networkId: NETWORK_ID,
    accountId: ACCOUNT_ID,
  });

  const amount = 100;
  const slippage = 0.5;
  const quote = await account.getBestSwapQuote(TOKEN_IN_ID, TOKEN_OUT_ID, amount, slippage);
  expect(quote).toBeDefined();
});

test('near-execute-swap', async () => {
  const account = await restoreAccount(CHAIN, MNEMONIC, {
    networkId: NETWORK_ID,
    accountId: ACCOUNT_ID,
  });
  const amount = 0.009;
  const slippage = 0.5;
  const quote = await account.getBestSwapQuote(TOKEN_IN_ID, TOKEN_OUT_ID, amount, slippage);
  const result = await account.swap(quote.pool.id, TOKEN_IN_ID, TOKEN_OUT_ID, amount);
  expect(result).toBeDefined();
});
