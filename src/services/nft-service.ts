import axios from 'axios';
import { SALMON_API_URL } from '../constants';
import { Nft, NftByCollection } from '../nft';

const getAll = async (networkId: string, accountId: string, noCache = false): Promise<Nft[]> => {
  const params = { accountId, noCache };
  const { data } = await axios.get<Nft[]>(`${SALMON_API_URL}/v1/near/nft`, {
    params,
    headers: { 'X-Network-Id': networkId },
  });

  return data;
};

const getNftsByCollection = (nfts: Nft[]): Record<string, Nft[]> => {
  const byCollection: NftByCollection = {};

  nfts.forEach((nft: Nft) => {
    const name = nft.collection?.name ?? 'unknown';
    byCollection[name].push(nft);
  });

  return byCollection;
};

const getAllGroupedByCollection = async (networkId: string, accountId: string, noCache = false) => {
  const nfts = await getAll(networkId, accountId, noCache);
  return getNftsByCollection(nfts);
};

export {
  getAll,
  getAllGroupedByCollection,
};
