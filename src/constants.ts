import { format } from 'near-api-js/lib/utils';

const { parseNearAmount } = format;

const NEAR_DECIMALS = 24;
const NEAR_SYMBOL = 'NEAR';
const NEAR_NAME = 'Near';
const NEAR_LOGO = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/near/info/logo.png';
const CHAIN = 'near';
const SALMON_API_URL = 'https://xw314040mf.execute-api.us-east-1.amazonaws.com/develop';

const FT_SWAP_GAS = parseNearAmount('0.00000000018');

const COIN_TYPES = {
  NEAR: 397,
};

export {
  NEAR_DECIMALS,
  NEAR_SYMBOL,
  NEAR_NAME,
  NEAR_LOGO,
  FT_SWAP_GAS,
  COIN_TYPES,
  CHAIN,
  SALMON_API_URL,
};
