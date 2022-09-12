import { Account } from '@salmonw/provider-base';
import { PublicKey, KeyPairEd25519 } from 'near-api-js/lib/utils';
import { InMemoryKeyStore } from 'near-api-js/lib/key_stores';
import {
  KeyPair, Connection, connect, Near, ConnectConfig, Account as NetworkAccount,
} from 'near-api-js';

import * as configService from './services/config-service';
import retrieveBalance from './services/balance-service';
import getOwnTokens from './services/token-service';
import * as nftService from './services/nft-service';
import * as swapService from './services/swap-service';
import { CHAIN } from './constants';
import { Nft, NftByCollection } from './nft';

// const transferService = require('./transfer-service');
// const wrapService = require('./wrap-service');
// const validationService = require('./validation-service');
// const recentTransactionsService = require('./recent-transactions-service');

class NearAccount extends Account<KeyPair, PublicKey, Connection> {
  readonly accountId: string;

  private readonly keyStore = new InMemoryKeyStore();

  private networkAccount: NetworkAccount;

  private Errors = {
    NOT_IMPLEMENTED: new Error('Not implemented.'),
    METHOD_NOT_AVAILABLE: (method: string) => new Error(`The method ${method} is not available for this network`),
  };

  constructor(mnemonic: string, secretKey: string, path: string, index: number, networkId: string) {
    super(mnemonic, KeyPairEd25519.fromString(secretKey), path, index, networkId);
    this.accountId = Buffer.from(super.publicKey.data).toString('hex');
    super.chain = CHAIN;
  }

  async getConnection(): Promise<Connection> {
    if (super.connection) {
      return super.connection;
    }

    await this.keyStore.setKey(super.networkId, this.accountId, super.retrieveSecureKeyPair());

    const config = await this.connectionConfig();
    const near: Near = await connect(config);
    this.networkAccount = await near.account(this.accountId);
    super.connection = this.networkAccount.connection;

    return super.connection;
  }

  private async connectionConfig(): Promise<ConnectConfig> {
    const networkConfig = await configService.retrieveConfig(this.networkId);
    const { nodeUrl, helperUrl }: { nodeUrl: string, helperUrl: string; } = networkConfig;

    return {
      networkId: this.networkId,
      nodeUrl,
      helperUrl,
      keyStore: this.keyStore,
    };
  }

  async getTokens(): Promise<object[]> {
    return getOwnTokens(this.networkAccount);
  }

  airdrop(amount: number): Promise<object> {
    throw this.Errors.NOT_IMPLEMENTED;
  }

  async getBalance(): Promise<object> {
    return retrieveBalance(this.networkAccount);
  }

  async getAllNfts(): Promise<Nft[]> {
    return nftService.getAll(this.networkId, this.accountId);
  }

  async getAllNftsGrouped(): Promise<NftByCollection> {
    return nftService.getAllGroupedByCollection(this.networkId, this.accountId);
  }

  async getBestSwapQuote(
    tokenInId: string,
    tokenOutId: string,
  ) {
    return swapService.quote(this.networkAccount, tokenInId, tokenOutId);
  }

  //   getReceiveAddress() {
  //     return this.accountId;
  //   }
  //   async validateDestinationAccount(accountId) {
  //     const connection = await this.getConnection();
  //     return validationService.validateDestinationAccount(connection, accountId);
  //   }
  //   async transfer(destination, token, amount, opts = {}) {
  //     const connection = await this.getConnection();
  //     if (token) {
  //       return transferService.transferToken(connection, token, amount, destination, opts);
  //     } else {
  //       return transferService.transferNear(connection, amount, destination);
  //     }
  //   }
  //   async transferNft(destination, token, tokenId) {
  //     const connection = await this.getConnection();
  //     return transferService.transferNft(connection, token, tokenId, destination);
  //   }

  //   async wrapNear(amount) {
  //     const connection = await this.getConnection();
  //     return wrapService.wrapNear(connection, amount);
  //   }
  //   async unwrapNear(amount) {
  //     const connection = await this.getConnection();
  //     return wrapService.unwrapNear(connection, amount);
  //   }
  //   async getRecentTransactions() {
  //     const connection = await this.getConnection();
  //     return recentTransactionsService.getRecentTransactions(connection);
  //   }
  //   setNetwork(networkId) {
  //     if (this.networkId !== networkId) {
  //       this.networkId = networkId;
  //       this.connection = null;
  //     }
  //   }
  //   async getNetworks() {
  //     return configService.getNetworks();
  //   }
  //   async getCurrentNetwork() {
  //     return configService.getConfig(this.networkId);
  //   }
  //   getChain() {
  //     return this.chain;
  //   }
  //   async getDomain() {
  //     throw 'method_not_supported';
  //   }
  //   async getDomainFromPublicKey(publicKey) {
  //     throw 'method_not_supported';
  //   }
  //   async getPublicKeyFromDomain(domain) {
  //     throw 'method_not_supported';
  //   }
}

export default NearAccount;
