import PriceVariation from './price-variation';
import Token from './token';

interface Balance {
  usdTotal: number;
  last24HoursChange: PriceVariation;
  items: BalanceToken[];
}

class BalanceToken {
  id: string;

  token: Token;

  usdPrice?: number;

  usdBalance?: number;

  last24HoursChange?: PriceVariation;
}

export { Balance, BalanceToken };
