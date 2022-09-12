import { parseAmount } from '@salmonw/provider-base/lib';
import { Account as NetworkAccount } from 'near-api-js';
import * as indexerService from './indexer-service';
import Token from '../token';
import notEmpty from '../utils';

const getOwnTokens = async (account: NetworkAccount): Promise<Token[]> => {
  const { connection } = account;
  const { networkId, jsvmAccountId } = connection;
  const contractNames = await indexerService.listLikelyTokens(networkId, jsvmAccountId);

  if (contractNames === undefined) {
    return Promise.reject();
  }

  const response: string[] = JSON.parse(contractNames);

  const promiseTokens: Promise<Token | null>[] = response.map(async (contract: string) => {
    try {
      const metadata = await account.viewFunction(contract, 'ft_metadata');

      const {
        name, symbol, decimals, icon,
      }: {
        name: string, symbol: string, decimals: number, icon: string,
      } = metadata;

      const params = { account_id: jsvmAccountId };
      const amount: number = await account.viewFunction(name, 'ft_balance_of', params);
      const token = new Token();

      token.mint = contract;
      token.owner = jsvmAccountId;
      token.amount = amount;
      token.decimals = decimals;
      token.uiAmount = parseAmount(amount, decimals);
      token.symbol = symbol;
      token.name = name;
      token.logo = icon;
      token.address = contract;

      return token;
    } catch (error) {
      // console.error(`Failed to get data for '${contract}'`, error);
      return null;
    }
  });

  return Promise.all(promiseTokens).then((tokens) => tokens.filter(notEmpty));
};

export default getOwnTokens;
