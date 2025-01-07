const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("DeployModule", (m) => {
  // Deploy Token contract
  const Token = m.contract("Token", [
    "0xa52482a9eEB7519e309A79D581c40030fb596CeF",
    "0xa52482a9eEB7519e309A79D581c40030fb596CeF",
  ]);

  return {
    Token,
  };
});

//npx hardhat ignition deploy ./ignition/modules/deploy.js --network avalanche

// 0xa52482a9eEB7519e309A79D581c40030fb596CeF

// Avalanche: 0xE737f20b9b84A18b6cA0Da377FEed979Bd3fa4ee
// Base: 0xE264A3eb8900e15737CF1209cdB3FB82FAf58d69
