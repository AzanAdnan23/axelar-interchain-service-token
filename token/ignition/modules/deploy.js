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

// Avalanche: 0xeFB53Dc828e72FCB84D2f590169C3EFC7f04992D
// Base: 0xa50947Ef3Ff8ff60f1a4E8347dADDeed463A1a94
