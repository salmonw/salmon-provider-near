const {
  connect,
  KeyPair,
  keyStores,
  utils: {
    serialize: { base_encode },
  },
} = require('near-api-js');
const tokenService = require('./near-token-service');
const balanceService = require('./near-balance-service');
const transferService = require('./near-transfer-service');
const wrapService = require('./near-wrap-service');
const swapService = require('./near-swap-service');
const nftService = require('./near-nft-service');
const configService = require('./near-config-service');
const validationService = require('./near-validation-service');
const recentTransactionsService = require('./near-recent-transactions-service');
const { CHAIN } = require('./constants');

class NearAccount {
  constructor(args) {
    this.mnemonic = args.mnemonic;
    this.networkId = args.networkId;
    this.path = args.path;
    this.index = args.index;
    this.keyPair = KeyPair.fromString(`ed25519:${base_encode(args.keyPair.secretKey)}`);
    this.publicKey = this.keyPair.publicKey;
    this.accountId = args.accountId || Buffer.from(this.publicKey.data).toString('hex');
    this.keyStore = new keyStores.InMemoryKeyStore();
    this.chain = CHAIN;
  }

  async getConnection() {
    if (!this.connection) {
      await this.keyStore.setKey(this.networkId, this.accountId, this.keyPair);

      const { nodeUrl, helperUrl } = await configService.getConfig(this.networkId);
      const config = { networkId: this.networkId, nodeUrl, helperUrl, keyStore: this.keyStore };
      const near = await connect(config);
      this.connection = await near.account(this.accountId);
    }
    return this.connection;
  }

  async getTokens() {
    const connection = await this.getConnection();
    return tokenService.getOwnTokens(connection);
  }

  async getBalance() {
    const connection = await this.getConnection();
    return balanceService.getBalance(connection);
  }

  getReceiveAddress() {
    return this.accountId;
  }

  async validateDestinationAccount(accountId) {
    const connection = await this.getConnection();
    return validationService.validateDestinationAccount(connection, accountId);
  }

  async transfer(destination, token, amount, opts = {}) {
    const connection = await this.getConnection();
    if (token) {
      return transferService.transferToken(connection, token, amount, destination, opts);
    } else {
      return transferService.transferNear(connection, amount, destination);
    }
  }

  async transferNft(destination, token, tokenId) {
    const connection = await this.getConnection();
    return transferService.transferNft(connection, token, tokenId, destination);
  }

  async getAllNfts() {
    return nftService.getAll(this.networkId, this.accountId);
  }

  async getAllNftsGrouped() {
    return nftService.getAllGroupedByCollection(this.networkId, this.accountId);
  }

  async wrapNear(amount) {
    const connection = await this.getConnection();
    return wrapService.wrapNear(connection, amount);
  }

  async unwrapNear(amount) {
    const connection = await this.getConnection();
    return wrapService.unwrapNear(connection, amount);
  }

  async getBestSwapQuote(tokenInId, tokenOutId, amount, slippage = 0.5) {
    const connection = await this.getConnection();
    return swapService.quote(connection, tokenInId, tokenOutId, amount, slippage);
  }

  async swap(poolId, tokenInId, tokenOutId, amount) {
    const connection = await this.getConnection();
    return swapService.swap(connection, poolId, tokenInId, tokenOutId, amount);
  }

  async getRecentTransactions() {
    const connection = await this.getConnection();
    return recentTransactionsService.getRecentTransactions(connection);
  }

  setNetwork(networkId) {
    if (this.networkId !== networkId) {
      this.networkId = networkId;
      this.connection = null;
    }
  }

  async getNetworks() {
    return configService.getNetworks();
  }

  async getCurrentNetwork() {
    return configService.getConfig(this.networkId);
  }

  getChain() {
    return this.chain;
  }

  async getDomain() {
    throw 'method_not_supported';
  }

  async getDomainFromPublicKey(publicKey) {
    throw 'method_not_supported';
  }

  async getPublicKeyFromDomain(domain) {
    throw 'method_not_supported';
  }
}

module.exports = NearAccount;
