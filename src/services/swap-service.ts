import { utils, Account } from 'near-api-js';
import { FinalExecutionOutcome } from 'near-api-js/lib/providers';
import { FT_SWAP_GAS } from '../constants';
import { retrieveConfig } from './config-service';

const { fetchJson } = utils.web;

interface Pool {
  token_account_ids?: string[];
  total_fee: number;
}

const includeIds = (tokenIn: string, tokenOut: string, tokenAccountIds?: string[]): boolean => {
  if (!tokenAccountIds) {
    return false;
  }

  return tokenAccountIds.includes(tokenIn) && tokenAccountIds.includes(tokenOut);
};

const reducer = (acc: Pool, value?: Pool): Pool | undefined => {
  let result = value;

  if (!value || acc.total_fee < value.total_fee) {
    result = acc;
  }

  return result;
};

const quote = async (account: Account, tokenInId: string, tokenOutId: string) => {
  const { networkId } = account.connection;
  const { refFinance } = await retrieveConfig(networkId);

  const tokenIn = await account.viewFunction(tokenInId, 'ft_metadata');
  const tokenOut = await account.viewFunction(tokenOutId, 'ft_metadata');
  const pools: Pool[] = await fetchJson(`${refFinance.apiUrl}/list-pools`);

  const pool = pools
    .filter(({ token_account_ids }) => includeIds(tokenInId, tokenOutId, token_account_ids))
    .reduce(reducer, null);

  const uiInfo = { in: tokenIn, out: tokenOut };

  return { pool, uiInfo };
};

const swap = async (
  account: Account,
  poolId: string,
  tokenInId: string,
  tokenOutId: string,
  amount: number,
) => {
  const { networkId } = account.connection;
  const { refFinance } = await retrieveConfig(networkId);

  //account.connection.provider.sendTransaction;

  const executionOutcome: FinalExecutionOutcome = await account.functionCall(
    {
      contractId: refFinance.contractId,
      methodName: 'ft_transfer_call',
      args: {
        messageText: JSON.stringify({
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
      gas: FT_SWAP_GAS,
      attachedDeposit: '1',
    },
  );

  return account.signAndSendTransaction({
    receiverId: tokenInId,
    actions: [
    ],
  });
};

export { quote, swap };
