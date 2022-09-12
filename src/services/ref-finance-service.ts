import { web } from 'near-api-js/lib/utils';
import PriceToken from '../price-token';
import { retrieveConfig } from './config-service';

const { fetchJson } = web;

const listTokensPrices = async (networkId: string): Promise<PriceToken[]> => {
  const {
    refFinance,
  } = await retrieveConfig(networkId);

  const { apiUrl }: { apiUrl: string; } = refFinance;
  const prices: object = await fetchJson(`${apiUrl}/list-token-price`);

  return Object.entries(prices).map(([id, { price, symbol, decimal }]) => new PriceToken(
    (symbol as string).toUpperCase(),
    id,
    price as number,
    decimal as number,
  ));
};

export default listTokensPrices;
