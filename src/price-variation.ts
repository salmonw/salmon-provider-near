export default class PriceVariation {
  perc: number;

  usd: number;

  constructor(percentage: number, usd: number) {
    this.perc = percentage;
    this.usd = usd;
  }
}
