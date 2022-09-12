import { PublicKey, web } from 'near-api-js/lib/utils';
import { retrieveConfig } from './config-service';

const { fetchJson } = web;

type Json = string | undefined;

const fetch = async (url: string): Promise<Json> => {
  const result: unknown = await fetchJson(url);

  if (typeof result === 'string') {
    return String(result);
  }

  return Promise.reject();
};

const listAccountsByPublicKey = async (networkId: string, publicKey: PublicKey): Promise<Json> => {
  const { indexerUrl } = await retrieveConfig(networkId);

  return fetch(`${indexerUrl}/publicKey/${publicKey.toString()}/accounts`);
};

const listLikelyNfts = async (networkId: string, accountId: string): Promise<Json> => {
  const { indexerUrl } = await retrieveConfig(networkId);

  return fetch(`${indexerUrl}/account/${accountId}/likelyNFTs`);
};

const listLikelyTokens = async (networkId: string, accountId: string): Promise<Json> => {
  const { indexerUrl } = await retrieveConfig(networkId);

  return fetch(`${indexerUrl}/account/${accountId}/likelyTokens`);
};

const listRecentTransactions = async (networkId: string, accountId: string): Promise<Json> => {
  const { indexerUrl } = await retrieveConfig(networkId);

  return fetch(`${indexerUrl}/account/${accountId}/activity`);
};

export {
  listAccountsByPublicKey,
  listLikelyNfts,
  listLikelyTokens,
  listRecentTransactions,
};
