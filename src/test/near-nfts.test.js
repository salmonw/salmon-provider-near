const { restoreAccount } = require('../../index');
const { CHAIN } = require('../constants');
const {
  NETWORK_ID,
  MNEMONIC,
  ACCOUNT_ID,
  IMPLICIT_MNEMONIC,
  NFT_TOKEN_NAME,
  NFT_TOKEN_ID,
} = require('./config');

test.only('near-get-all-nfts', async () => {
  const account = await restoreAccount(CHAIN, MNEMONIC, {
    networkId: NETWORK_ID,
    accountId: ACCOUNT_ID,
  });
  const nfts = await account.getAllNfts();
  expect(nfts).toBeDefined();
  expect(nfts.length).toBeGreaterThan(0);
});

test.only('near-get-all-nfts-grouped', async () => {
  const account = await restoreAccount(CHAIN, MNEMONIC, {
    networkId: NETWORK_ID,
    accountId: ACCOUNT_ID,
  });
  const nfts = await account.getAllNftsGrouped();
  expect(nfts).toBeDefined();
  expect(nfts.length).toBeGreaterThan(0);
});

test('near-transfer-nft', async () => {
  const account1 = await restoreAccount(CHAIN, MNEMONIC, {
    networkId: NETWORK_ID,
    accountId: ACCOUNT_ID,
  });
  const account2 = await restoreAccount(CHAIN, IMPLICIT_MNEMONIC, { networkId: NETWORK_ID });
  const result1 = await account1.transferNft(
    account2.getReceiveAddress(),
    NFT_TOKEN_NAME,
    NFT_TOKEN_ID
  );
  expect(result1).toBeDefined();
  const result2 = await account2.transferNft(
    account1.getReceiveAddress(),
    NFT_TOKEN_NAME,
    NFT_TOKEN_ID
  );
  expect(result2).toBeDefined();
});
