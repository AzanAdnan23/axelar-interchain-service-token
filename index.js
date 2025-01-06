const hre = require("hardhat");
const crypto = require("crypto");
const ethers = hre.ethers;
const {
  AxelarQueryAPI,
  Environment,
  EvmChain,
  GasToken,
} = require("@axelar-network/axelarjs-sdk");

const interchainTokenServiceContractABI = require("./utils/interchainTokenServiceABI");
const interchainTokenContractABI = require("./utils/interchainTokenABI");
const { int } = require("hardhat/internal/core/params/argumentTypes");

const MINT_BURN = 4;

const interchainTokenServiceContractAddress =
  "0xB5FB4BE02232B1bBA4dC8f81dc24C26980dE9e3C";

const avalancheCustomTokenAddress =
  "0xE258Dfc38BB25C8F40b91bfBcf0B47Dd7eED4b19";
const sepoliaCustomTokenAddress = "0x4b8e4BAB8671F699036414B09434c3AaeF9CbCee";

async function getSigner() {
  const [signer] = await ethers.getSigners();
  return signer;
}

async function getContractInstance(contractAddress, contractABI, signer) {
  return new ethers.Contract(contractAddress, contractABI, signer);
}

// Deploy token manager : Avalache
async function deployTokenManager() {
  // Get a signer to sign the transaction
  const signer = await getSigner();

  // Get the InterchainTokenService contract instance
  const interchainTokenServiceContract = await getContractInstance(
    interchainTokenServiceContractAddress,
    interchainTokenServiceContractABI,
    signer
  );

  // Generate a random salt
  const salt = "0x" + crypto.randomBytes(32).toString("hex");

  // Create params
  const params = ethers.utils.defaultAbiCoder.encode(
    ["bytes", "address"],
    [signer.address, avalancheCustomTokenAddress]
  );

  // Deploy the token manager
  const deployTxData = await interchainTokenServiceContract.deployTokenManager(
    salt,
    "",
    MINT_BURN,
    params,
    ethers.utils.parseEther("0.01")
  );

  // Get the tokenId
  const tokenId = await interchainTokenServiceContract.interchainTokenId(
    signer.address,
    salt
  );

  // Get the token manager address
  const expectedTokenManagerAddress =
    await interchainTokenServiceContract.tokenManagerAddress(tokenId);

  console.log(
    `
  Salt: ${salt},
  Transaction Hash: ${deployTxData.hash},
  Token ID: ${tokenId},
  Expected token manager address: ${expectedTokenManagerAddress},
  `
  );

  //FUNCTION_NAME=deployTokenManager npx hardhat run index.js --network avalanche

  // Salt: 0x7be0252d9fa28f0de2fedae06c4849843ae5186e0b7e1db3ca008c4cd8601862,
  // Transaction Hash: 0xb535ae9aa69530e57cb2e5dceb702d004a8a7813f3e0af9685ee1061512b34e1,
  // Token ID: 0xb3ac857bab82af22f6f192b8e7c1ece738bfac77ec93b35397d03c9762f0dd07,
  // Expected token manager address: 0xB90e8AC589b951baf0462021932Fc666dD004677,
}

const api = new AxelarQueryAPI({ environment: Environment.TESTNET });

// Estimate gas costs
async function gasEstimator() {
  const gas = await api.estimateGasFee(
    EvmChain.AVALANCHE,
    EvmChain.SEPOLIA,
    GasToken.AVAX,
    2000000,
    1.2
  );

  return gas;
}
// Deploy remote token manager : Polygon
async function deployRemoteTokenManager() {
  // Get a signer to sign the transaction
  const signer = await getSigner();

  // Get the InterchainTokenService contract instance
  const interchainTokenServiceContract = await getContractInstance(
    interchainTokenServiceContractAddress,
    interchainTokenServiceContractABI,
    signer
  );

  // Create params
  const param = ethers.utils.defaultAbiCoder.encode(
    ["bytes", "address"],
    [signer.address, sepoliaCustomTokenAddress]
  );

  const gasAmount = await gasEstimator();
  console.log("Gas Amount :", gasAmount);

  // Deploy the token manager
  const deployTxData = await interchainTokenServiceContract.deployTokenManager(
    "0x7be0252d9fa28f0de2fedae06c4849843ae5186e0b7e1db3ca008c4cd8601862", // change salt
    "ethereum-sepolia",
    MINT_BURN,
    param,
    ethers.utils.parseEther("0.01"),
    { value: gasAmount }
  );

  // Get the tokenId
  const tokenId = await interchainTokenServiceContract.interchainTokenId(
    signer.address,
    "0x7be0252d9fa28f0de2fedae06c4849843ae5186e0b7e1db3ca008c4cd8601862" // change salt
  );

  // Get the token manager address
  const expectedTokenManagerAddress =
    await interchainTokenServiceContract.tokenManagerAddress(tokenId);

  console.log(
    `
  Transaction Hash: ${deployTxData.hash},
  Token ID: ${tokenId},
  Expected token manager address: ${expectedTokenManagerAddress},
  `
  );

  // FUNCTION_NAME=deployRemoteTokenManager npx hardhat run index.js --network avalanche
  // Gas Amount : 914344567601650

  //   Transaction Hash: 0xeba15bb95a9170d5c37d77a914584c56e9cc4812ef78a83db835f84755c90489,
  //   Token ID: 0xb3ac857bab82af22f6f192b8e7c1ece738bfac77ec93b35397d03c9762f0dd07,
  //   Expected token manager address: 0xB90e8AC589b951baf0462021932Fc666dD004677,
}

// Transfer mint access on all chains to the Expected Token Manager : Avalacnche
async function transferMintAccessToTokenManagerOnAvalacnche() {
  // Get a signer to sign the transaction
  const signer = await getSigner();

  const tokenContract = await getContractInstance(
    avalancheCustomTokenAddress,
    interchainTokenContractABI,
    signer
  );

  // Get the minter role
  const getMinterRole = await tokenContract.MINTER_ROLE();

  const grantRoleTxn = await tokenContract.grantRole(
    getMinterRole,
    "0xB90e8AC589b951baf0462021932Fc666dD004677"
  );

  console.log("grantRoleTxn: ", grantRoleTxn.hash);

  //   ❯ FUNCTION_NAME=transferMintAccessToTokenManagerOnAvalacnche npx hardhat run index.js --network avalanche
  // grantRoleTxn:  0x3c01d824d11c9537df14dd242583e342583216cc33e552ec5000b0608a92adb2
}

// Transfer mint access on all chains to the Expected Token Manager Address : Sepolia
async function transferMintAccessToTokenManagerOnSepolia() {
  // Get a signer to sign the transaction
  const signer = await getSigner();

  const tokenContract = await getContractInstance(
    sepoliaCustomTokenAddress,
    interchainTokenContractABI,
    signer
  );

  // Get the minter role
  const getMinterRole = await tokenContract.MINTER_ROLE();

  const grantRoleTxn = await tokenContract.grantRole(
    getMinterRole,
    "0xB90e8AC589b951baf0462021932Fc666dD004677"
  );

  console.log("grantRoleTxn: ", grantRoleTxn.hash);

  // ❯ FUNCTION_NAME=transferMintAccessToTokenManagerOnSepolia npx hardhat run index.js --network sepolia
  // grantRoleTxn:  0x172bf3089061c4dd37fb9e670dbe3bcbb9bf112f87431e36f5d682c7b6d19e5b
}

//...

// Transfer tokens : Fantom -> Polygon
async function transferTokens() {
  // Get a signer to sign the transaction
  const signer = await getSigner();

  const interchainTokenServiceContract = await getContractInstance(
    interchainTokenServiceContractAddress,
    interchainTokenServiceContractABI,
    signer
  );
  const gasAmount = await gasEstimator();
  const transfer = await interchainTokenServiceContract.interchainTransfer(
    "0xb3ac857bab82af22f6f192b8e7c1ece738bfac77ec93b35397d03c9762f0dd07", // tokenId, the one you store in the earlier step
    "ethereum-sepolia",
    "0x94fD63cA1282c4C645A6497a0aB32779604d1382", // receiver address
    ethers.utils.parseEther("50"), // amount of token to transfer
    "0x",
    ethers.utils.parseEther("0.2"), // gasValue
    {
      // Transaction options should be passed here as an object
      value: gasAmount,
    }
  );

  console.log("Transfer Transaction Hash:", transfer.hash);
}
//❯ FUNCTION_NAME=transferTokens npx hardhat run index.js --network avalanche
//Transfer Transaction Hash: 0x2835667bb17b68fd6f82dc457c2bc73889105b0b4a0464ce09d526299d5f6049
async function main() {
  const functionName = process.env.FUNCTION_NAME;
  switch (functionName) {
    case "deployTokenManager":
      await deployTokenManager();
      break;
    case "mintAndApproveITS":
      await mintAndApproveITS();
      break;
    case "deployRemoteTokenManager":
      await deployRemoteTokenManager();
      break;
    case "transferMintAccessToTokenManagerOnAvalacnche":
      await transferMintAccessToTokenManagerOnAvalacnche();
      break;
    case "transferMintAccessToTokenManagerOnSepolia":
      await transferMintAccessToTokenManagerOnSepolia();
      break;
    case "transferTokens":
      await transferTokens();
      break;
    default:
      console.error(`Unknown function: ${functionName}`);
      process.exitCode = 1;
      return;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
