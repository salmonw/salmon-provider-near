import { Connection, utils, Account } from 'near-api-js';
import { getPricesByIds, ICoin } from '@salmonw/provider-base';
import getOwnTokens from './token-service';
import listTokensPrices from './ref-finance-service';
import {
  NEAR_DECIMALS,
  NEAR_SYMBOL,
  NEAR_NAME,
  NEAR_LOGO,
} from '../constants';
import Token from '../token';
import PriceToken from '../price-token';
import { BalanceToken } from '../balance';
import notEmpty from '../utils';
import PriceVariation from '../price-variation';

const { formatNearAmount } = utils.format;

const getNearBalance = async (account: Account): Promise<Token> => {
  const balance = await account.getAccountBalance();
  const amount = balance.total;
  const { accountId } = account;

  return {
    mint: accountId,
    owner: accountId,
    amount: +amount,
    decimals: NEAR_DECIMALS,
    uiAmount: +formatNearAmount(amount),
    symbol: NEAR_SYMBOL,
    name: NEAR_NAME,
    logo: NEAR_LOGO,
    address: accountId,
  };
};

const getTokenPrices = async (
  connection: Connection,
  contractsIds: string[],
): Promise<PriceToken[]> => {
  const coins: ICoin[] = await getPricesByIds(['near', 'usn']);
  const prices: PriceToken[] = coins
    .map((coin: ICoin) => new PriceToken(
      coin.symbol.toUpperCase(),
      coin.id,
      coin.usdPrice,
      undefined,
      coin.perc24HoursChange,
    ));

  const { networkId } = connection;
  const tokensPrice: PriceToken[] = await listTokensPrices(networkId);

  return prices.concat(tokensPrice.filter(({ id }) => contractsIds.includes(id)));
};

const get24HoursUsdBalanceVariation = (
  perc24HoursChange?: number | undefined,
  usdBalance?: number,
) => {
  if (perc24HoursChange === undefined) {
    return null;
  }

  const usdBalanceAmount = usdBalance ?? 0;

  const prevBalance = (1 - perc24HoursChange / 100) * usdBalanceAmount;
  const usd = usdBalanceAmount - prevBalance;
  return {
    perc: perc24HoursChange,
    usd,
  };
};

const getPreviousTokenBalance = (balance: BalanceToken) => {
  const { usdBalance, last24HoursChange } = balance;
  const percentage = last24HoursChange?.perc ?? 0;
  const tokenBalance = (usdBalance ?? 0) / (1 - percentage / 100) || 0;

  return tokenBalance;
};

const retrieveTokensBalance = (items: Token[], prices: PriceToken[]): BalanceToken[] => {
  const result: (BalanceToken | null)[] = items.map((item) => {
    const price: PriceToken | undefined = prices
      .find((pt: PriceToken) => pt.symbol === item.symbol);

    const usdBalance = price?.priceUsd ? item.uiAmount * price.priceUsd : undefined;
    const last24HoursChange = get24HoursUsdBalanceVariation(price?.variationIn24Hr, usdBalance);

    if (!price) {
      return null;
    }

    const balance = new BalanceToken();

    balance.id = price.id;
    balance.token = item;
    balance.usdPrice = price.priceUsd;
    balance.usdBalance = usdBalance;
    balance.last24HoursChange = last24HoursChange
      ? new PriceVariation(last24HoursChange.perc, last24HoursChange.usd) : undefined;

    return balance;
  });

  return result.filter(notEmpty);
};

const getPreviousTotal = (balances: BalanceToken[]) => {
  const total = balances.reduce((
    currentValue,
    next,
  ) => getPreviousTokenBalance(next) + currentValue, 0);
  return total;
};

const getTotal24HoursUsdBalanceVariation = (balances: BalanceToken[], usdTotal: number) => {
  const prevUsdTotal = getPreviousTotal(balances);
  const usd24HoursChange = usdTotal - prevUsdTotal;
  const perc24HoursChange = (usd24HoursChange * 100) / prevUsdTotal;
  return {
    usd: usd24HoursChange,
    perc: perc24HoursChange,
  };
};

const retrieveBalance = async (account: Account) => {
  try {
    const balanceNear: Token = await getNearBalance(account);
    const balanceTokens: Token[] = await getOwnTokens(account);

    const contractsIds: string[] = balanceTokens.map(({ address }) => address);
    const prices: PriceToken[] = await getTokenPrices(account.connection, contractsIds);

    const balances: BalanceToken[] = retrieveTokensBalance([balanceNear, ...balanceTokens], prices);
    const usdTotal: number = balances
      .reduce((currentValue, next) => (next.usdBalance ?? 0) + currentValue, 0);

    const last24HoursChage = getTotal24HoursUsdBalanceVariation(balances, usdTotal);

    return {
      usdTotal,
      last24HoursChage,
      items: balances,
    };
  } catch (e: unknown) {
    if (e instanceof Error && !e.message.includes('does not exist while viewing')) {
      throw e;
    }

    const last24HoursChage = getTotal24HoursUsdBalanceVariation([], 0);
    return {
      usdTotal: 0,
      last24HoursChage,
      items: [],
    };
  }
};

export default retrieveBalance;
