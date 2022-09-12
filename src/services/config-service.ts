import axios from 'axios';
import { INetwork, INetworkNearConfig } from '@salmonw/provider-base/lib';
import { SALMON_API_URL } from '../constants';

const networks = async (): Promise<INetwork[]> => axios.get(`${SALMON_API_URL}/v1/near/networks`);

const retrieveConfig = async (networkId: string): Promise<INetworkNearConfig> => {
  try {
    const url = `${SALMON_API_URL}/v1/near/config`;
    const headers = { headers: { 'X-Network-Id': networkId } };
    const response = await axios.get<INetworkNearConfig>(url, headers);

    return response.data;
  } catch (exc: unknown) {
    if (exc instanceof Error) {
      throw Error(`Error getting Near config ${exc.message}`);
    } else {
      throw Error('Unknown error getting Near config');
    }
  }
};

export {
  networks,
  retrieveConfig,
};
