const {
  AxelarQueryAPI,
  Environment,
  EvmChain,
  GasToken,
} = require("@axelar-network/axelarjs-sdk");

const api = new AxelarQueryAPI({ environment: Environment.TESTNET });

async function gasEstimator() {
  const gas = await api.estimateGasFee(
    EvmChain.AVALANCHE,
    EvmChain.SEPOLIA,
    GasToken.AVAX,
    4000000,
    1.2
  );

  console.log(gas);
  return gas;
}

gasEstimator();
