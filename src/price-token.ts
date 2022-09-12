export default class PriceToken {
  id: string;

  priceUsd?: number;

  symbol: string;

  decimals?: number;

  variationIn24Hr?: number;

  constructor(
    symbol: string,
    id: string,
    price?: number,
    decimals?: number,
    variationIn24Hr?: number,
  ) {
    this.symbol = symbol;
    this.id = id;
    this.priceUsd = price;
    this.decimals = decimals;
    this.variationIn24Hr = variationIn24Hr;
  }

  static fromSymbol(symbol: string, id: string) {
    return new PriceToken(symbol, id);
  }
}
