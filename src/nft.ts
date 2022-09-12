type NftByCollection = Record<string, Nft[]>;

interface NftExtra {
  creators: string[];

  attributes: object[];

  properties: object[];
}

interface Nft {
  public_key: string;

  mint: string;

  owner: string;

  name: string;

  symbol: string;

  uri: string;

  description: string;

  collection?: { name: string; };

  media: string;

  extras: NftExtra;
}

export { Nft, NftExtra, NftByCollection };
