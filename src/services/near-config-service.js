'use strict';

const axios = require('axios');
const { SALMON_API_URL } = require('../constants');

const getNetworks = async () => {
  const { data } = await axios.get(`${SALMON_API_URL}/v1/near/networks`);
  return data;
};

const getConfig = async (networkId) => {
  const { data } = await axios.get(`${SALMON_API_URL}/v1/near/config`, {
    headers: { 'X-Network-Id': networkId },
  });
  return data;
};

module.exports = {
  getNetworks,
  getConfig,
};
